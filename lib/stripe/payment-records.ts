"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";

export interface CreatePaymentInput {
  userId: string | null;
  amount: number;
  currency: string;
  description: string;
  stripeSessionId: string;
  payeeName?: string | null;
}

export async function createPaymentRecord(
  input: CreatePaymentInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Supabase admin client is not configured." };
  }

  const { data, error } = await admin
    .from("payments")
    .insert({
      user_id: input.userId,
      amount: input.amount,
      currency: input.currency.toUpperCase(),
      status: "pending",
      stripe_payment_id: input.stripeSessionId,
      description: input.description,
      payee_name: input.payeeName ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Payments table not found. Run supabase/migrations/002_intake_tables.sql." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, id: (data as { id: string }).id };
}

export async function updatePaymentBySessionId(
  stripeSessionId: string,
  updates: { status: string; amount?: number }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const payload: { status: string; amount?: number } = { status: updates.status };
  if (updates.amount !== undefined) payload.amount = updates.amount;

  const { error } = await admin
    .from("payments")
    .update(payload)
    .eq("stripe_payment_id", stripeSessionId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
