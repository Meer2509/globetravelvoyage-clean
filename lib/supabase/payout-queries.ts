"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";

export interface ProviderPayoutSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  bookedServices: number;
  currency: string;
}

export interface ProviderBookingRow {
  id: string;
  booking_type: string;
  listing_title: string | null;
  status: string;
  total_amount: number | null;
  currency: string | null;
  customer_email: string | null;
  created_at: string;
}

export interface ProviderTransactionRow {
  id: string;
  amount: number;
  provider_amount: number | null;
  platform_fee: number | null;
  currency: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

export async function fetchProviderPayoutSummary(): Promise<ProviderPayoutSummary | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const [paymentsRes, bookingsRes, transactionsRes] = await Promise.all([
    admin
      .from("payments")
      .select("amount, provider_amount, platform_fee, status, currency, transfer_status")
      .eq("provider_user_id", user.id)
      .eq("status", "paid"),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("provider_user_id", user.id)
      .in("status", ["confirmed", "pending_payment", "pending"]),
    admin
      .from("transactions")
      .select("provider_amount, status")
      .eq("provider_user_id", user.id)
      .eq("status", "completed"),
  ]);

  const payments = (paymentsRes.data ?? []) as Array<{
    amount: number;
    provider_amount: number | null;
    platform_fee: number | null;
    status: string;
    currency: string;
    transfer_status: string | null;
  }>;

  const totalEarnings = payments.reduce(
    (sum, p) => sum + Number(p.provider_amount ?? p.amount ?? 0),
    0
  );

  const completedPayouts = payments
    .filter((p) => p.transfer_status === "transferred")
    .reduce((sum, p) => sum + Number(p.provider_amount ?? 0), 0);
  const pendingPayouts = totalEarnings - completedPayouts;

  return {
    totalEarnings,
    pendingPayouts,
    completedPayouts,
    bookedServices: bookingsRes.count ?? 0,
    currency: payments[0]?.currency ?? "USD",
  };
}

export async function fetchProviderBookingsList(): Promise<ProviderBookingRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("bookings")
    .select("id, booking_type, listing_title, status, total_amount, currency, customer_email, created_at")
    .eq("provider_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as ProviderBookingRow[];
}

export async function fetchProviderTransactionsList(): Promise<ProviderTransactionRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("transactions")
    .select("id, amount, provider_amount, platform_fee, currency, status, description, created_at")
    .eq("provider_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as ProviderTransactionRow[];
}
