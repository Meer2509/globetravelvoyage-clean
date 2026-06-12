"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { claimPaymentsByEmail } from "@/lib/stripe/link-user";
import { paymentServiceLabel } from "@/lib/payments-display";
import { VISA_CASE_STATUSES, type VisaCaseStatus } from "@/lib/visa-case-constants";

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
  amount: number | null;
  currency: string;
  invoiceNumber: string | null;
  createdAt: string;
  checklist: Array<{ name: string; status: string; documentId?: string }>;
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

  const { data: visaCaseRow, error: caseError } = await supabase
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

  if (visaCaseRow) {
    return mapVisaCaseFromTable(visaCaseRow as Record<string, unknown>, supabase);
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
      amount: payment.amount != null ? Number(payment.amount) : null,
      currency: (payment.currency as string) ?? "USD",
      invoiceNumber: (payment.invoice_number as string) ?? null,
      createdAt: new Date().toISOString(),
      checklist: [],
    };
  }

  if (!visaApp) return null;
  return mapLegacyVisaCase(visaApp, payment);
}

async function mapVisaCaseFromTable(
  row: Record<string, unknown>,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
): Promise<VisaCaseData> {
  const caseId = row.id as string;
  let payment: Record<string, unknown> | null = null;

  if (row.payment_id && supabase) {
    const { data } = await supabase
      .from("payments")
      .select("status, amount, currency, invoice_number, service_type")
      .eq("id", row.payment_id as string)
      .maybeSingle();
    payment = data as Record<string, unknown> | null;
  }

  let checklist: VisaCaseData["checklist"] = [];
  if (supabase) {
    const { data: docs } = await supabase
      .from("case_documents")
      .select("id, document_type, file_name, status")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });
    checklist = (docs ?? []).map((d) => {
      const doc = d as { id: string; document_type: string; file_name: string | null; status: string };
      return {
        name: doc.document_type,
        status: doc.status ?? "pending",
        documentId: doc.id,
      };
    });
  }

  const status = (row.status as string) ?? "intake_started";

  return {
    id: caseId,
    caseNumber: (row.case_number as string) ?? caseId.slice(0, 12),
    visaType: (row.visa_type as string) ?? (row.service_name as string) ?? "Visa Service",
    destinationCountry: (row.visa_country as string) ?? "—",
    status,
    progressPercent: (row.progress_percent as number) ?? 10,
    currentStep: (row.current_step as string) ?? status,
    assignedExpert: row.provider_user_id ? "Expert assigned" : null,
    serviceProductKey: (payment?.service_type as string) ?? null,
    serviceName: (row.service_name as string) ?? null,
    paymentStatus: (payment?.status as string) ?? "paid",
    amount: payment?.amount != null ? Number(payment.amount) : null,
    currency: (payment?.currency as string) ?? "USD",
    invoiceNumber: (payment?.invoice_number as string) ?? null,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    checklist,
  };
}

function mapLegacyVisaCase(
  visaApp: Record<string, unknown>,
  payment: Record<string, unknown> | null
): VisaCaseData {
  const checklist = Array.isArray(visaApp.ai_checklist)
    ? (visaApp.ai_checklist as Array<{ name: string; status: string }>).map((d) => ({
        name: d.name,
        status: d.status,
      }))
    : [];

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
