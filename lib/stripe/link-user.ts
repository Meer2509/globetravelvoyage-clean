"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/** Resolve profile id from checkout email when session had no user_id. */
export async function resolveUserIdFromEmail(
  email: string | null | undefined
): Promise<string | null> {
  if (!email?.trim()) return null;
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}

/** Attach orphan payments/bookings/transactions to a user after login. */
export async function claimPaymentsByEmail(
  userId: string,
  email: string
): Promise<{ claimed: number }> {
  const admin = createAdminClient();
  if (!admin) return { claimed: 0 };

  const normalized = email.trim().toLowerCase();

  const { data: payments } = await admin
    .from("payments")
    .select("id")
    .is("user_id", null)
    .ilike("email", normalized);

  const ids = ((payments ?? []) as { id: string }[]).map((p) => p.id);
  if (ids.length === 0) return { claimed: 0 };

  await admin.from("payments").update({ user_id: userId }).in("id", ids);
  await admin.from("bookings").update({ user_id: userId }).is("user_id", null).ilike("customer_email", normalized);
  await admin.from("transactions").update({ user_id: userId }).is("user_id", null).in("payment_id", ids);

  return { claimed: ids.length };
}
