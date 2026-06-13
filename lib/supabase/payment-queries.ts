"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { claimPaymentsByEmail } from "@/lib/stripe/link-user";
import { paymentServiceLabel } from "@/lib/payments-display";
import { VISA_CASE_STATUSES, type VisaCaseStatus } from "@/lib/visa-case-constants";
import { mapVisaCaseRow } from "@/lib/supabase/visa-case-mapper";
import { ensureCaseChecklist, isVisaProductKey, createVisaCase } from "@/lib/visa-case";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";

export interface PaymentRowExtended {
  id: string;
  user_id: string | null;
  email: string | null;
  service_type: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  invoice_number: string | null;
  created_at: string;
  paid_at: string | null;
  booking_id: string | null;
}

export interface StripeBookingRow {
  id: string;
  booking_type: string;
  listing_title: string | null;
  status: string;
  total_amount: number | null;
  currency: string | null;
  created_at: string;
}

export interface VisaCaseData {
  id: string;
  caseNumber: string;
  visaType: string;
  destinationCountry: string;
  status: string;
  progressPercent: number;
  currentStep: string;
  assignedExpert: string | null;
  serviceProductKey: string | null;
  serviceName: string | null;
  paymentStatus: string;
  paymentId: string | null;
  amount: number | null;
  currency: string;
  invoiceNumber: string | null;
  createdAt: string;
  checklist: Array<{
    id?: string;
    name: string;
    status: string;
    documentId?: string;
    required: boolean;
    notes?: string | null;
    fileName?: string | null;
    fileUrl?: string | null;
    storagePath?: string | null;
    uploadedAt?: string | null;
  }>;
}

export interface ActiveServiceRow {
  id: string;
  serviceName: string;
  productKey: string | null;
  status: string;
  purchasedAt: string;
  amount: number | null;
  currency: string;
  isVisa: boolean;
}

export async function fetchCustomerActiveServices(): Promise<ActiveServiceRow[]> {
  const payments = await fetchCustomerPaymentsExtended();
  return payments
    .filter((p) => p.status === "paid")
    .map((p) => ({
      id: p.id,
      serviceName: paymentServiceLabel(p.service_type, p.description),
      productKey: p.service_type,
      status: "active",
      purchasedAt: p.paid_at ?? p.created_at,
      amount: Number(p.amount),
      currency: p.currency ?? "USD",
      isVisa: Boolean(p.service_type?.includes("visa")),
    }));
}

export async function fetchCustomerPaymentsExtended(): Promise<PaymentRowExtended[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  await claimPaymentsByEmail(user.id, user.email ?? "");

  const orFilter = user.email
    ? `user_id.eq.${user.id},email.eq.${user.email}`
    : `user_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, user_id, email, service_type, amount, currency, status, description, stripe_session_id, stripe_payment_intent_id, invoice_number, created_at, paid_at, booking_id"
    )
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as PaymentRowExtended[];
}

export async function fetchCustomerStripeBookings(): Promise<StripeBookingRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_type, listing_title, status, total_amount, currency, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return [];
  return (data ?? []) as StripeBookingRow[];
}

export async function fetchCustomerVisaCase(): Promise<VisaCaseData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: visaCaseRow, error: caseError } = await supabase
    .from("visa_cases")
    .select("*")
    .eq("user_id", user.id)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (caseError && isMissingTableError(caseError)) {
    console.error("[visa_cases] table missing:", caseError.message);
  }

  if (!visaCaseRow) {
    const backfilledId = await backfillVisaCaseFromPayment(user.id);
    if (backfilledId) {
      const { data } = await supabase.from("visa_cases").select("*").eq("id", backfilledId).maybeSingle();
      visaCaseRow = data;
    }
  }

  if (visaCaseRow) {
    await ensureCaseChecklist((visaCaseRow as { id: string }).id, user.id);
    return mapVisaCaseRow(visaCaseRow as Record<string, unknown>, supabase);
  }

  const { data: entitlement } = await supabase
    .from("user_entitlements")
    .select("visa_application_id, payment_id, product_key, metadata")
    .eq("user_id", user.id)
    .in("entitlement_type", ["visa_full_support", "visa_premium"])
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!entitlement) {
    const { data: visaApp } = await supabase
      .from("visa_applications")
      .select("*")
      .eq("applicant_id", user.id)
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!visaApp) return null;
    return mapLegacyVisaCase(visaApp as Record<string, unknown>, null);
  }

  const ent = entitlement as {
    visa_application_id: string | null;
    payment_id: string | null;
    product_key: string;
    metadata: { product_name?: string } | null;
  };

  let visaApp: Record<string, unknown> | null = null;
  if (ent.visa_application_id) {
    const { data } = await supabase
      .from("visa_applications")
      .select("*")
      .eq("id", ent.visa_application_id)
      .maybeSingle();
    visaApp = data as Record<string, unknown> | null;
  }

  let payment: Record<string, unknown> | null = null;
  if (ent.payment_id) {
    const { data } = await supabase
      .from("payments")
      .select("status, amount, currency, invoice_number, description, service_type")
      .eq("id", ent.payment_id)
      .maybeSingle();
    payment = data as Record<string, unknown> | null;
  }

  if (!visaApp && payment) {
    return {
      id: ent.payment_id ?? user.id,
      caseNumber: `GTV-LEGACY-${(ent.payment_id ?? user.id).slice(0, 8).toUpperCase()}`,
      visaType: ent.metadata?.product_name ?? "Visa Premium Service",
      destinationCountry: "—",
      status: "documents_needed",
      progressPercent: 15,
      currentStep: "Upload required documents",
      assignedExpert: null,
      serviceProductKey: ent.product_key,
      serviceName: ent.metadata?.product_name ?? null,
      paymentStatus: (payment.status as string) ?? "paid",
      paymentId: ent.payment_id,
      amount: payment.amount != null ? Number(payment.amount) : null,
      currency: (payment.currency as string) ?? "USD",
      invoiceNumber: (payment.invoice_number as string) ?? null,
      createdAt: new Date().toISOString(),
      checklist: VISA_DOCUMENT_CHECKLIST.map((item) => ({
        name: item.documentType,
        status: "pending",
        required: item.required,
        notes: null,
      })),
    };
  }

  if (!visaApp) return null;
  return mapLegacyVisaCase(visaApp, payment);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedDb = { from: (table: string) => any };

async function backfillVisaCaseFromPayment(userId: string): Promise<string | null> {
  const admin = createAdminClient() as UntypedDb | null;
  if (!admin) return null;

  const { data: payments } = await admin
    .from("payments")
    .select("id, service_type, description, booking_id, status")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(20);

  for (const p of payments ?? []) {
    const row = p as { id: string; service_type: string | null; description: string | null; booking_id: string | null };
    const key = row.service_type ?? "";
    if (!isVisaProductKey(key)) continue;

    const { data: existing } = await admin
      .from("visa_cases")
      .select("id")
      .eq("payment_id", row.id)
      .maybeSingle();

    if (existing) return (existing as { id: string }).id;

    const created = await createVisaCase({
      userId,
      paymentId: row.id,
      bookingId: row.booking_id,
      serviceName: row.description ?? key,
      productKey: key,
    });

    if (created && "caseId" in created) return created.caseId;
  }

  return null;
}

function mapLegacyVisaCase(
  visaApp: Record<string, unknown>,
  payment: Record<string, unknown> | null
): VisaCaseData {
  const checklist = Array.isArray(visaApp.ai_checklist)
    ? (visaApp.ai_checklist as Array<{ name: string; status: string }>).map((d) => ({
        name: d.name,
        status: d.status,
        required: true,
        notes: null as string | null,
      }))
    : VISA_DOCUMENT_CHECKLIST.map((item) => ({
        name: item.documentType,
        status: "pending",
        required: item.required,
        notes: null as string | null,
      }));

  const legacyStatus = (visaApp.status as string) ?? "submitted";
  const mappedStatus: VisaCaseStatus = VISA_CASE_STATUSES.includes(legacyStatus as VisaCaseStatus)
    ? (legacyStatus as VisaCaseStatus)
    : "under_review";

  return {
    id: visaApp.id as string,
    caseNumber: `GTV-LEGACY-${(visaApp.id as string).slice(0, 8).toUpperCase()}`,
    visaType: (visaApp.visa_type as string) ?? "Visa Application",
    destinationCountry: (visaApp.destination_country as string) ?? "—",
    status: mappedStatus,
    progressPercent: ((visaApp.progress_step as number) ?? 1) * 15,
    currentStep: mappedStatus,
    assignedExpert: (visaApp.assigned_expert_name as string) ?? null,
    serviceProductKey: (visaApp.service_product_key as string) ?? null,
    serviceName: (visaApp.visa_type as string) ?? null,
    paymentStatus: (payment?.status as string) ?? "paid",
    paymentId: (payment?.id as string) ?? (visaApp.payment_id as string) ?? null,
    amount: payment?.amount != null ? Number(payment.amount) : (visaApp.agent_fee as number) ?? null,
    currency: (payment?.currency as string) ?? "USD",
    invoiceNumber: (payment?.invoice_number as string) ?? null,
    createdAt: (visaApp.created_at as string) ?? new Date().toISOString(),
    checklist,
  };
}

export async function fetchProviderReviews(providerUserId: string) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("provider_reviews")
    .select("id, rating, review_text, created_at, customer_id")
    .eq("provider_user_id", providerUserId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function fetchHomepageReviews() {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("provider_reviews")
    .select("id, rating, review_text, created_at, provider_user_id")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}
