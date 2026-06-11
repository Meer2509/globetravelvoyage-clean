"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";

export interface CreatePaymentInput {
  userId: string | null;
  email: string | null;
  serviceType: string;
  amount: number;
  currency: string;
  description: string;
  stripeSessionId: string;
}

export interface FulfillPaymentInput {
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount?: number;
  currency?: string;
  email?: string | null;
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
};

type PaymentUpdate = {
  status: string;
  stripe_payment_intent_id?: string | null;
  paid_at?: string;
  amount?: number;
  currency?: string;
  email?: string | null;
};

export async function createPaymentRecord(
  input: CreatePaymentInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Supabase admin client is not configured." };
  }

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
  };

  const { data, error } = await admin.from("payments").insert(row).select("id").single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Payments table not found. Run supabase/migrations/002_intake_tables.sql." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, id: (data as { id: string }).id };
}

async function updatePaymentBySession(
  stripeSessionId: string,
  updates: PaymentUpdate
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: bySession, error: sessionError } = await admin
    .from("payments")
    .update(updates)
    .eq("stripe_session_id", stripeSessionId)
    .select("id");

  if (sessionError) return { ok: false, error: sessionError.message };
  if (bySession && bySession.length > 0) return { ok: true };

  const { error: legacyError } = await admin
    .from("payments")
    .update(updates)
    .eq("stripe_payment_id", stripeSessionId);

  if (legacyError) return { ok: false, error: legacyError.message };
  return { ok: true };
}

export async function fulfillPaymentFromCheckoutSession(
  input: FulfillPaymentInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const updates: PaymentUpdate = {
    status: "paid",
    stripe_payment_intent_id: input.stripePaymentIntentId,
    paid_at: new Date().toISOString(),
  };

  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.currency) updates.currency = input.currency.toUpperCase();
  if (input.email) updates.email = input.email;

  return updatePaymentBySession(input.stripeSessionId, updates);
}

/** @deprecated Use fulfillPaymentFromCheckoutSession */
export async function updatePaymentBySessionId(
  stripeSessionId: string,
  updates: { status: string; amount?: number }
): Promise<{ ok: true } | { ok: false; error: string }> {
  return fulfillPaymentFromCheckoutSession({
    stripeSessionId,
    stripePaymentIntentId: null,
    amount: updates.amount,
  });
}
