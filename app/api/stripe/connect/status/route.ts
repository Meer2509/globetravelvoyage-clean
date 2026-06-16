import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlatformFeePercent, isStripeConnectConfigured } from "@/lib/stripe/connect-config";
import { getAuthenticatedProvider } from "@/lib/stripe/connect-auth";
import {
  fetchPayoutAccountByUserId,
  syncStripeAccountStatus,
} from "@/lib/stripe/connect-accounts";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const auth = await getAuthenticatedProvider();
  const isProvider = auth.ok;

  let account = await fetchPayoutAccountByUserId(user.id);
  let connectStatus = null;

  if (account?.stripe_account_id && isStripeConnectConfigured()) {
    connectStatus = await syncStripeAccountStatus(user.id, account.stripe_account_id);
    account = connectStatus?.account ?? account;
  }

  const admin = createAdminClient();
  const earnings = {
    grossSales: 0,
    platformFees: 0,
    estimatedPayout: 0,
    completedPayouts: 0,
    pendingPayouts: 0,
    currency: "USD",
  };

  if (admin) {
    const { data: payments } = await admin
      .from("payments")
      .select("amount, platform_fee, provider_amount, transfer_status, currency")
      .eq("provider_user_id", user.id)
      .eq("status", "paid");

    const rows = (payments ?? []) as Array<{
      amount: number;
      platform_fee: number | null;
      provider_amount: number | null;
      transfer_status: string | null;
      currency: string;
    }>;

    earnings.grossSales = rows.reduce((s, p) => s + Number(p.amount ?? 0), 0);
    earnings.platformFees = rows.reduce((s, p) => s + Number(p.platform_fee ?? 0), 0);
    earnings.estimatedPayout = rows.reduce(
      (s, p) => s + Number(p.provider_amount ?? p.amount ?? 0),
      0
    );
    earnings.completedPayouts = rows
      .filter((p) => p.transfer_status === "transferred")
      .reduce((s, p) => s + Number(p.provider_amount ?? 0), 0);
    earnings.pendingPayouts = earnings.estimatedPayout - earnings.completedPayouts;
    earnings.currency = rows[0]?.currency ?? "USD";
  }

  return NextResponse.json({
    configured: isStripeConnectConfigured(),
    isProvider,
    platformFeePercent: getPlatformFeePercent(),
    account: account
      ? {
          stripeAccountId: account.stripe_account_id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted ?? false,
          onboardingStatus: account.onboarding_status,
          providerRole: account.provider_role,
        }
      : null,
    connectReady: connectStatus?.connectReady ?? false,
    pendingRequirements: connectStatus?.pendingRequirements ?? [],
    earnings,
  });
}
