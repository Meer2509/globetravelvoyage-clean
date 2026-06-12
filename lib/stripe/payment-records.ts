"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { splitPaymentAmount } from "@/lib/stripe/commission";
import { generateInvoiceNumber } from "@/lib/stripe/invoice";
import { resolveUserIdFromEmail } from "@/lib/stripe/link-user";

export interface CreatePaymentInput {
  userId: string | null;
  email: string | null;
  serviceType: string;
  amount: number;
  currency: string;
  description: string;
  stripeSessionId: string;
  providerUserId?: string | null;
  providerServiceId?: string | null;
  customerName?: string | null;
}

export interface FulfillPaymentInput {
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount?: number;
  currency?: string;
  email?: string | null;
  userId?: string | null;
  serviceType?: string;
  description?: string;
  providerUserId?: string | null;
  providerServiceId?: string | null;
}

type PaymentInsert = {
  user_id: string | null;
  email: string | null;
  service_type: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string;
  stripe_payment_id: string;
  description: string;
  invoice_number?: string;
  customer_name?: string | null;
  provider_user_id?: string | null;
  provider_service_id?: string | null;
  platform_fee?: number | null;
  provider_amount?: number | null;
};

type PaymentUpdate = {
  status: string;
  stripe_payment_intent_id?: string | null;
  paid_at?: string;
  amount?: number;
  currency?: string;
  email?: string | null;
  user_id?: string | null;
  invoice_number?: string;
};

export async function createPaymentRecord(
  input: CreatePaymentInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Supabase admin client is not configured." };
  }

  const split = input.providerUserId ? splitPaymentAmount(input.amount) : null;
  const invoiceNumber = await generateInvoiceNumber();

  const row: PaymentInsert = {
    user_id: input.userId,
    email: input.email,
    service_type: input.serviceType,
    amount: input.amount,
    currency: input.currency.toUpperCase(),
    status: "pending",
    stripe_session_id: input.stripeSessionId,
    stripe_payment_id: input.stripeSessionId,
    description: input.description,
    invoice_number: invoiceNumber,
    customer_name: input.customerName ?? null,
    provider_user_id: input.providerUserId ?? null,
    provider_service_id: input.providerServiceId ?? null,
    platform_fee: split?.platformFee ?? null,
    provider_amount: split?.providerAmount ?? null,
  };

  const { data, error } = await admin.from("payments").insert(row).select("id").single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Payments table not found. Run supabase migrations." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, id: (data as { id: string }).id };
}

async function updatePaymentBySession(
  stripeSessionId: string,
  updates: PaymentUpdate
): Promise<{ ok: true; paymentId?: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: bySession, error: sessionError } = await admin
    .from("payments")
    .update(updates)
    .eq("stripe_session_id", stripeSessionId)
    .select("id");

  if (sessionError) return { ok: false, error: sessionError.message };
  if (bySession && bySession.length > 0) {
    return { ok: true, paymentId: (bySession[0] as { id: string }).id };
  }

  const { data: byLegacy, error: legacyError } = await admin
    .from("payments")
    .update(updates)
    .eq("stripe_payment_id", stripeSessionId)
    .select("id");

  if (legacyError) return { ok: false, error: legacyError.message };
  if (byLegacy && byLegacy.length > 0) {
    return { ok: true, paymentId: (byLegacy[0] as { id: string }).id };
  }

  return { ok: true };
}

/** Create paid payment row from session if checkout insert was missed. */
async function ensurePaymentRecord(
  input: FulfillPaymentInput
): Promise<{ ok: true; paymentId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("stripe_session_id", input.stripeSessionId)
    .maybeSingle();

  if (existing) {
    return { ok: true, paymentId: (existing as { id: string }).id };
  }

  let userId = input.userId ?? null;
  if (!userId && input.email) {
    userId = await resolveUserIdFromEmail(input.email);
  }

  const invoiceNumber = await generateInvoiceNumber();
  const amount = input.amount ?? 0;
  const split = input.providerUserId ? splitPaymentAmount(amount) : null;

  const { data, error } = await admin
    .from("payments")
    .insert({
      user_id: userId,
      email: input.email ?? null,
      service_type: input.serviceType ?? "unknown",
      amount,
      currency: (input.currency ?? "USD").toUpperCase(),
      status: "paid",
      stripe_session_id: input.stripeSessionId,
      stripe_payment_id: input.stripeSessionId,
      stripe_payment_intent_id: input.stripePaymentIntentId,
      description: input.description ?? "Stripe payment",
      invoice_number: invoiceNumber,
      paid_at: new Date().toISOString(),
      provider_user_id: input.providerUserId ?? null,
      provider_service_id: input.providerServiceId ?? null,
      platform_fee: split?.platformFee ?? null,
      provider_amount: split?.providerAmount ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Payments table not found." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, paymentId: (data as { id: string }).id };
}

export async function fulfillPaymentFromCheckoutSession(
  input: FulfillPaymentInput
): Promise<{ ok: true; paymentId: string } | { ok: false; error: string }> {
  const ensured = await ensurePaymentRecord(input);
  if (!ensured.ok) return ensured;

  let userId = input.userId ?? null;
  if (!userId && input.email) {
    userId = await resolveUserIdFromEmail(input.email);
  }

  const updates: PaymentUpdate = {
    status: "paid",
    stripe_payment_intent_id: input.stripePaymentIntentId,
    paid_at: new Date().toISOString(),
  };

  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.currency) updates.currency = input.currency.toUpperCase();
  if (input.email) updates.email = input.email;
  if (userId) updates.user_id = userId;

  const admin = createAdminClient();
  if (admin) {
    const { data: row } = await admin
      .from("payments")
      .select("invoice_number")
      .eq("id", ensured.paymentId)
      .maybeSingle();
    if (!(row as { invoice_number: string | null } | null)?.invoice_number) {
      updates.invoice_number = await generateInvoiceNumber();
    }
  }

  const result = await updatePaymentBySession(input.stripeSessionId, updates);
  if (!result.ok) return result;

  return { ok: true, paymentId: result.paymentId ?? ensured.paymentId };
}

export async function markPaymentStatusBySession(
  stripeSessionId: string,
  status: "failed" | "expired" | "cancelled"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { error } = await admin
    .from("payments")
    .update({ status })
    .eq("stripe_session_id", stripeSessionId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
