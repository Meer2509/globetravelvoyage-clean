"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { computeTrustScore } from "./trust-score-calc";
import { persistTrustScore } from "./trust-score";
import type { ReputationMetricsRow, VerificationLevel } from "./types";
import { checkFraudSignals } from "./fraud-monitor";

function metricsWithRates(row: ReputationMetricsRow): ReputationMetricsRow {
  const response_rate =
    row.inquiries_total > 0 ? Math.round((row.inquiries_answered / row.inquiries_total) * 1000) / 1000 : 0;
  const totalBookings = row.bookings_completed + row.cancellations;
  const completion_rate =
    totalBookings > 0 ? Math.round((row.bookings_completed / totalBookings) * 1000) / 1000 : 0;
  return { ...row, response_rate, completion_rate };
}

export async function fetchReputationMetrics(
  userId: string,
  providerRole: string
): Promise<ReputationMetricsRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("provider_reputation_metrics")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_role", providerRole)
    .maybeSingle();

  if (!data) return null;
  return metricsWithRates(data as ReputationMetricsRow);
}

export async function recalculateReputationForUser(
  userId: string,
  providerRole: string
): Promise<ReputationMetricsRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const [profileRes, onboardingRes, agentProfileRes, listingRes, reviewsRes, bookingsRes] =
    await Promise.all([
      admin.from("profiles").select("created_at, full_name").eq("id", userId).maybeSingle(),
      admin
        .from("provider_onboarding_progress")
        .select("completion_score")
        .eq("user_id", userId)
        .eq("provider_role", providerRole)
        .maybeSingle(),
      admin.from("travel_agent_profiles").select("id, rating, review_count").eq("user_id", userId).maybeSingle(),
      admin.from("property_listings").select("id").eq("user_id", userId),
      admin
        .from("reviews")
        .select("rating")
        .eq("target_id", userId)
        .eq("status", "approved"),
      admin
        .from("booking_requests")
        .select("status")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString()),
    ]);

  const agentId = (agentProfileRes.data as { id: string } | null)?.id;
  let inquiriesTotal = 0;
  if (agentId) {
    const { count } = await admin
      .from("travel_agent_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", agentId);
    inquiriesTotal = count ?? 0;
  }

  const listingIds = ((listingRes.data ?? []) as Array<{ id: string }>).map((l) => l.id);
  if (listingIds.length > 0) {
    const { count } = await admin
      .from("property_inquiries")
      .select("*", { count: "exact", head: true })
      .in("property_listing_id", listingIds);
    inquiriesTotal += count ?? 0;
  }

  const bookings = (bookingsRes.data ?? []) as Array<{ status: string }>;
  const completed = bookings.filter((b) => ["confirmed", "completed", "approved"].includes(b.status)).length;
  const cancelled = bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length;

  const reviewRows = (reviewsRes.data ?? []) as Array<{ rating: number }>;
  const reviewCount = reviewRows.length;
  const reviewAverage =
    reviewCount > 0
      ? Math.round((reviewRows.reduce((s, r) => s + r.rating, 0) / reviewCount) * 100) / 100
      : Number((agentProfileRes.data as { rating?: number } | null)?.rating ?? 0);

  const metrics: ReputationMetricsRow = metricsWithRates({
    user_id: userId,
    provider_role: providerRole,
    inquiries_total: inquiriesTotal,
    inquiries_answered: Math.round(inquiriesTotal * 0.85),
    bookings_completed: completed,
    cancellations: cancelled,
    avg_response_hours: 24,
    review_average: reviewAverage,
    review_count: reviewCount || Number((agentProfileRes.data as { review_count?: number } | null)?.review_count ?? 0),
    updated_at: new Date().toISOString(),
    response_rate: 0,
    completion_rate: 0,
  });

  await admin.from("provider_reputation_metrics").upsert(
    {
      user_id: metrics.user_id,
      provider_role: metrics.provider_role,
      inquiries_total: metrics.inquiries_total,
      inquiries_answered: metrics.inquiries_answered,
      bookings_completed: metrics.bookings_completed,
      cancellations: metrics.cancellations,
      avg_response_hours: metrics.avg_response_hours,
      review_average: metrics.review_average,
      review_count: metrics.review_count,
      updated_at: metrics.updated_at,
    },
    { onConflict: "user_id,provider_role" }
  );

  const { data: verification } = await admin
    .from("provider_verification_profiles")
    .select("verification_level")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const level = ((verification as { verification_level?: VerificationLevel } | null)?.verification_level ??
    "basic") as VerificationLevel;

  const profileCreated = (profileRes.data as { created_at?: string } | null)?.created_at;
  const accountAgeDays = profileCreated
    ? Math.floor((Date.now() - new Date(profileCreated).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const profileCompletion =
    (onboardingRes.data as { completion_score?: number } | null)?.completion_score ?? 50;

  const score = computeTrustScore({
    userId,
    providerRole,
    verificationLevel: level,
    profileCompletion,
    reviewAverage: metrics.review_average,
    reviewCount: metrics.review_count,
    responseRate: metrics.response_rate,
    completionRate: metrics.completion_rate,
    accountAgeDays,
  });

  await persistTrustScore(score);
  await checkFraudSignals(userId, metrics);

  return metrics;
}
