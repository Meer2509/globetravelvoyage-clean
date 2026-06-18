"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { requireAdmin } from "@/lib/auth-server";
import type { AcquisitionDashboardReport } from "./types";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function weekAgoIso(): string {
  return daysAgoIso(7);
}

function rate(n: number, d: number): number {
  if (d <= 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

export async function fetchAcquisitionDashboardReport(periodDays = 30): Promise<
  AcquisitionDashboardReport | { error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { error: "Supabase is not configured." };

  const since = daysAgoIso(periodDays);
  const weekSince = weekAgoIso();

  const providerTables = [
    { role: "visa_agent", table: "visa_experts" },
    { role: "travel_agency", table: "agencies" },
    { role: "tour_guide", table: "tour_guides" },
    { role: "property_host", table: "property_hosts" },
  ] as const;

  const counts = await Promise.all(
    providerTables.map(async ({ role, table }) => {
      const [total, pending, week] = await Promise.all([
        admin.from(table).select("*", { count: "exact", head: true }).gte("created_at", since),
        admin
          .from(table)
          .select("*", { count: "exact", head: true })
          .in("verification_status", ["pending", "under_review"]),
        admin.from(table).select("*", { count: "exact", head: true }).gte("created_at", weekSince),
      ]);
      return {
        role,
        count: total.count ?? 0,
        pending: pending.count ?? 0,
        week: week.count ?? 0,
      };
    })
  );

  const providersAddedThisWeek = counts.reduce((s, c) => s + c.week, 0);
  const pendingApprovals = counts.reduce((s, c) => s + c.pending, 0);

  const { data: referralCodes } = await admin
    .from("provider_referral_codes")
    .select("user_id, total_referrals, total_rewards_usd")
    .order("total_referrals", { ascending: false })
    .limit(10);

  const topReferrerIds = (referralCodes ?? []).map((r) => (r as { user_id: string }).user_id);
  const { data: profiles } = topReferrerIds.length
    ? await admin.from("profiles").select("id, full_name").in("id", topReferrerIds)
    : { data: [] };

  const nameMap = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { full_name: string }).full_name])
  );

  const topReferrers = (referralCodes ?? []).map((row) => {
    const r = row as { user_id: string; total_referrals: number; total_rewards_usd: number };
    return {
      userId: r.user_id,
      name: nameMap.get(r.user_id) ?? "Provider",
      referrals: r.total_referrals ?? 0,
      rewardsUsd: Number(r.total_rewards_usd ?? 0),
    };
  });

  const { count: landingEvents } = await admin
    .from("growth_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "provider_landing_view")
    .gte("created_at", since);

  const { count: providerSignups } = await admin
    .from("growth_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "provider_signup")
    .gte("created_at", since);

  const { count: onboardedCount } = await admin
    .from("provider_onboarding_progress")
    .select("*", { count: "exact", head: true })
    .gte("completion_score", 80)
    .gte("updated_at", since);

  const { count: verifiedCount } = await admin
    .from("visa_experts")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified")
    .gte("verified_at", since);

  const { data: recentReferrals } = await admin
    .from("provider_referrals")
    .select("id, referred_email, provider_role, status, reward_usd, created_at, converted_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (recentReferrals === null && !isMissingTableError({ message: "" } as never)) {
    // table may not exist pre-migration
  }

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    providersAddedThisWeek,
    pendingApprovals,
    topReferrers,
    conversionRates: {
      landingToSignup: rate(providerSignups ?? 0, landingEvents ?? 1),
      signupToOnboarding: rate(onboardedCount ?? 0, providerSignups ?? 1),
      onboardingToVerified: rate(verifiedCount ?? 0, onboardedCount ?? 1),
    },
    byRole: counts.map(({ role, count, pending }) => ({ role, count, pending })),
    recentReferrals: (recentReferrals ?? []) as AcquisitionDashboardReport["recentReferrals"],
  };
}
