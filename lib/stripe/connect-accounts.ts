"use server";

import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe/server";
import type { ProviderPayoutRole } from "@/lib/stripe/connect-config";

export interface ProviderPayoutAccountRow {
  id: string;
  user_id: string;
  provider_role: string | null;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_status: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectAccountStatus {
  account: ProviderPayoutAccountRow | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingStatus: string;
  pendingRequirements: string[];
  connectReady: boolean;
}

function mapOnboardingStatus(account: Stripe.Account): string {
  if (account.charges_enabled && account.payouts_enabled) return "complete";
  if (account.details_submitted) return "pending_verification";
  if (account.requirements?.currently_due?.length) return "requirements_due";
  return "in_progress";
}

export async function fetchPayoutAccountByUserId(
  userId: string
): Promise<ProviderPayoutAccountRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("provider_payout_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProviderPayoutAccountRow;
}

export async function fetchConnectReadyAccount(
  providerUserId: string
): Promise<{ stripeAccountId: string } | null> {
  const row = await fetchPayoutAccountByUserId(providerUserId);
  if (!row?.stripe_account_id || !row.charges_enabled) return null;
  return { stripeAccountId: row.stripe_account_id };
}

export async function upsertPayoutAccountRow(input: {
  userId: string;
  providerRole: ProviderPayoutRole;
  stripeAccountId: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  onboardingStatus?: string;
}): Promise<ProviderPayoutAccountRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const existing = await fetchPayoutAccountByUserId(input.userId);
  const resolvedRole =
    input.providerRole ?? (existing?.provider_role as ProviderPayoutRole | null) ?? "visa_agent";
  const payload = {
    user_id: input.userId,
    provider_role: resolvedRole,
    stripe_account_id: input.stripeAccountId,
    charges_enabled: input.chargesEnabled ?? false,
    payouts_enabled: input.payoutsEnabled ?? false,
    details_submitted: input.detailsSubmitted ?? false,
    onboarding_status: input.onboardingStatus ?? "in_progress",
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await admin
      .from("provider_payout_accounts")
      .update(payload)
      .eq("user_id", input.userId)
      .select("*")
      .single();
    if (error) return null;
    return data as ProviderPayoutAccountRow;
  }

  const { data, error } = await admin
    .from("provider_payout_accounts")
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error) return null;
  return data as ProviderPayoutAccountRow;
}

export async function syncStripeAccountStatus(
  userId: string,
  stripeAccountId: string
): Promise<ConnectAccountStatus | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  let account: Stripe.Account;
  try {
    account = await stripe.accounts.retrieve(stripeAccountId);
  } catch {
    return null;
  }

  const onboardingStatus = mapOnboardingStatus(account);
  const existing = await fetchPayoutAccountByUserId(userId);
  const providerRole =
    (account.metadata?.provider_role as ProviderPayoutRole | undefined) ??
    (existing?.provider_role as ProviderPayoutRole | undefined) ??
    "visa_agent";

  const row = await upsertPayoutAccountRow({
    userId,
    providerRole,
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    onboardingStatus,
  });

  const pendingRequirements = [
    ...(account.requirements?.currently_due ?? []),
    ...(account.requirements?.past_due ?? []),
  ];

  return {
    account: row,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    onboardingStatus,
    pendingRequirements,
    connectReady: Boolean(account.charges_enabled && account.payouts_enabled),
  };
}

export async function createExpressConnectAccount(input: {
  userId: string;
  email: string | null;
  providerRole: ProviderPayoutRole;
}): Promise<{ ok: true; stripeAccountId: string } | { ok: false; error: string }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const existing = await fetchPayoutAccountByUserId(input.userId);
  if (existing?.stripe_account_id) {
    return { ok: true, stripeAccountId: existing.stripe_account_id };
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: input.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: input.userId,
        provider_role: input.providerRole,
      },
    });

    await upsertPayoutAccountRow({
      userId: input.userId,
      providerRole: input.providerRole,
      stripeAccountId: account.id,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      onboardingStatus: "in_progress",
    });

    return { ok: true, stripeAccountId: account.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create Connect account.";
    return { ok: false, error: message };
  }
}

export async function createConnectOnboardingLink(
  stripeAccountId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const siteUrl = getSiteUrl();

  try {
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/dashboard/payouts?refresh=1`,
      return_url: `${siteUrl}/dashboard/payouts?success=1`,
      type: "account_onboarding",
    });

    if (!link.url) return { ok: false, error: "Stripe did not return an onboarding URL." };
    return { ok: true, url: link.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create onboarding link.";
    return { ok: false, error: message };
  }
}
