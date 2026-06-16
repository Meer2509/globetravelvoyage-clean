"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-server";

export interface AdminConnectStats {
  connectedProviders: number;
  payoutReadyProviders: number;
  pendingSetupProviders: number;
  paymentsWithSplit: number;
  paymentsPendingSetup: number;
  totalPlatformFees: number;
}

export interface AdminConnectProviderRow {
  user_id: string;
  provider_role: string | null;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  onboarding_status: string;
  updated_at: string;
}

export async function fetchAdminConnectStats(): Promise<AdminConnectStats | null> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const [accountsRes, splitRes, pendingRes] = await Promise.all([
    admin.from("provider_payout_accounts").select("charges_enabled, payouts_enabled, stripe_account_id"),
    admin
      .from("payments")
      .select("platform_fee", { count: "exact" })
      .eq("transfer_status", "transferred"),
    admin
      .from("payments")
      .select("id", { count: "exact" })
      .eq("transfer_status", "pending_setup"),
  ]);

  const accounts = (accountsRes.data ?? []) as Array<{
    charges_enabled: boolean;
    payouts_enabled: boolean;
    stripe_account_id: string | null;
  }>;

  const connectedProviders = accounts.filter((a) => a.stripe_account_id).length;
  const payoutReadyProviders = accounts.filter(
    (a) => a.charges_enabled && a.payouts_enabled
  ).length;
  const pendingSetupProviders = connectedProviders - payoutReadyProviders;

  const { data: feeRows } = await admin
    .from("payments")
    .select("platform_fee")
    .eq("status", "paid")
    .not("platform_fee", "is", null);

  const totalPlatformFees = ((feeRows ?? []) as Array<{ platform_fee: number }>).reduce(
    (s, r) => s + Number(r.platform_fee ?? 0),
    0
  );

  return {
    connectedProviders,
    payoutReadyProviders,
    pendingSetupProviders: Math.max(pendingSetupProviders, 0),
    paymentsWithSplit: splitRes.count ?? 0,
    paymentsPendingSetup: pendingRes.count ?? 0,
    totalPlatformFees,
  };
}

export async function fetchAdminConnectProviders(): Promise<AdminConnectProviderRow[]> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("provider_payout_accounts")
    .select("user_id, provider_role, stripe_account_id, charges_enabled, payouts_enabled, onboarding_status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (data ?? []) as AdminConnectProviderRow[];
}
