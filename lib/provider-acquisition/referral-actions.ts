"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { trackGrowthEvent } from "@/lib/growth/track-event";
import {
  PROVIDER_REFERRAL_REWARD_USD,
  type ProviderAcquisitionRole,
  type ProviderReferralRow,
} from "./types";

const PROVIDER_ROLES: ProviderAcquisitionRole[] = [
  "visa_agent",
  "travel_agency",
  "tour_guide",
  "property_host",
];

function isProviderRole(role: string): role is ProviderAcquisitionRole {
  return PROVIDER_ROLES.includes(role as ProviderAcquisitionRole);
}

function generateCode(name: string): string {
  const base = name.split(" ")[0]?.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "GTV";
  return `GTV-${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getOrCreateProviderReferralCode(input?: {
  name?: string;
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in to get your referral link." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("provider_referral_codes")
    .select("referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return { ok: true, code: (existing as { referral_code: string }).referral_code };
  }

  const code = generateCode(input?.name ?? "PROVIDER");
  const { error } = await admin.from("provider_referral_codes").insert({
    user_id: userId,
    referral_code: code,
  });

  if (error) {
    if (isMissingTableError(error)) return { ok: false, error: "Referral system is not available yet." };
    return { ok: false, error: error.message };
  }

  return { ok: true, code };
}

export async function fetchMyProviderReferrals(): Promise<
  { ok: true; code: string; referrals: ProviderReferralRow[]; totalRewards: number } | { ok: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in to view referrals." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const codeResult = await getOrCreateProviderReferralCode();
  if (!codeResult.ok) return codeResult;

  const { data: rows } = await admin
    .from("provider_referrals")
    .select("id, referred_email, provider_role, status, reward_usd, created_at, converted_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: codeRow } = await admin
    .from("provider_referral_codes")
    .select("total_rewards_usd")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    ok: true,
    code: codeResult.code,
    referrals: (rows ?? []) as ProviderReferralRow[],
    totalRewards: Number((codeRow as { total_rewards_usd?: number } | null)?.total_rewards_usd ?? 0),
  };
}

export async function recordProviderReferralAtSignup(input: {
  referredUserId: string;
  referredEmail: string;
  providerRole: string;
  referralCode?: string | null;
}): Promise<void> {
  if (!input.referralCode?.startsWith("GTV-")) return;
  if (!isProviderRole(input.providerRole)) return;

  const admin = createAdminClient();
  if (!admin) return;

  const { data: codeRow } = await admin
    .from("provider_referral_codes")
    .select("user_id")
    .eq("referral_code", input.referralCode.trim())
    .maybeSingle();

  if (!codeRow) return;

  const referrerId = (codeRow as { user_id: string }).user_id;
  if (referrerId === input.referredUserId) return;

  const { data: existing } = await admin
    .from("provider_referrals")
    .select("id")
    .eq("referred_user_id", input.referredUserId)
    .maybeSingle();

  if (existing) return;

  await admin.from("provider_referrals").insert({
    referrer_id: referrerId,
    referred_user_id: input.referredUserId,
    referred_email: input.referredEmail,
    referral_code: input.referralCode.trim(),
    provider_role: input.providerRole,
    status: "registered",
    converted_at: new Date().toISOString(),
  });

  trackGrowthEvent({
    eventType: "signup",
    userId: input.referredUserId,
    email: input.referredEmail,
    metadata: { provider_referral: true, referrer_id: referrerId, role: input.providerRole },
  });
}

export async function markProviderReferralOnboarded(userId: string, role: ProviderAcquisitionRole): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("provider_referrals")
    .update({ status: "onboarded", updated_at: new Date().toISOString() })
    .eq("referred_user_id", userId)
    .eq("provider_role", role)
    .in("status", ["pending", "registered"]);
}

export async function rewardProviderReferralOnVerification(userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: referral } = await admin
    .from("provider_referrals")
    .select("id, referrer_id, status")
    .eq("referred_user_id", userId)
    .in("status", ["registered", "onboarded"])
    .maybeSingle();

  if (!referral) return;

  const row = referral as { id: string; referrer_id: string; status: string };
  const reward = PROVIDER_REFERRAL_REWARD_USD;
  const now = new Date().toISOString();

  await admin
    .from("provider_referrals")
    .update({
      status: "rewarded",
      reward_usd: reward,
      rewarded_at: now,
      updated_at: now,
    })
    .eq("id", row.id);

  const { data: codeRow } = await admin
    .from("provider_referral_codes")
    .select("total_referrals, total_rewards_usd")
    .eq("user_id", row.referrer_id)
    .maybeSingle();

  if (codeRow) {
    const c = codeRow as { total_referrals: number; total_rewards_usd: number };
    await admin
      .from("provider_referral_codes")
      .update({
        total_referrals: (c.total_referrals ?? 0) + 1,
        total_rewards_usd: Number(c.total_rewards_usd ?? 0) + reward,
        updated_at: now,
      })
      .eq("user_id", row.referrer_id);
  }
}

export async function inviteProviderByEmail(input: {
  email: string;
  providerRole: ProviderAcquisitionRole;
  message?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.email.includes("@")) return { ok: false, error: "Valid email required." };

  const codeResult = await getOrCreateProviderReferralCode();
  if (!codeResult.ok) return codeResult;

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in required." };

  const { data: existing } = await admin
    .from("provider_referrals")
    .select("id")
    .eq("referrer_id", userId)
    .eq("referred_email", input.email.trim().toLowerCase())
    .eq("status", "pending")
    .maybeSingle();

  if (!existing) {
    await admin.from("provider_referrals").insert({
      referrer_id: userId,
      referred_email: input.email.trim().toLowerCase(),
      referral_code: codeResult.code,
      provider_role: input.providerRole,
      status: "pending",
    });
  }

  const { sendProviderInviteEmail } = await import("./emails");
  await sendProviderInviteEmail({
    to: input.email.trim(),
    referrerCode: codeResult.code,
    providerRole: input.providerRole,
    message: input.message,
  });

  return { ok: true };
}
