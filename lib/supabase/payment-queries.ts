"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimPaymentsByEmail } from "@/lib/stripe/link-user";

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
  visaType: string;
  destinationCountry: string;
  status: string;
  progressStep: number;
  assignedExpert: string | null;
  serviceProductKey: string | null;
  serviceName: string | null;
  paymentStatus: string;
  amount: number | null;
  currency: string;
  invoiceNumber: string | null;
  createdAt: string;
  checklist: Array<{ name: string; status: string }>;
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
    return mapVisaCase(visaApp as Record<string, unknown>, null);
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
      .select("status, amount, currency, invoice_number, description")
      .eq("id", ent.payment_id)
      .maybeSingle();
    payment = data as Record<string, unknown> | null;
  }

  if (!visaApp && payment) {
    return {
      id: ent.payment_id ?? user.id,
      visaType: ent.metadata?.product_name ?? "Visa Premium Service",
      destinationCountry: "USA",
      status: "in_review",
      progressStep: 2,
      assignedExpert: "Assignment in progress",
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
  return mapVisaCase(visaApp, payment);
}

function mapVisaCase(
  visaApp: Record<string, unknown>,
  payment: Record<string, unknown> | null
): VisaCaseData {
  const checklist = Array.isArray(visaApp.ai_checklist)
    ? (visaApp.ai_checklist as Array<{ name: string; status: string }>)
    : [];

  return {
    id: visaApp.id as string,
    visaType: (visaApp.visa_type as string) ?? "Visa Application",
    destinationCountry: (visaApp.destination_country as string) ?? "—",
    status: (visaApp.status as string) ?? "submitted",
    progressStep: (visaApp.progress_step as number) ?? 1,
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
