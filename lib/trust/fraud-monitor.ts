"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import type { FraudFlagRow, ReputationMetricsRow } from "./types";

async function insertFlag(input: {
  userId: string;
  flagType: string;
  severity: string;
  details: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: existing } = await admin
    .from("provider_fraud_flags")
    .select("id")
    .eq("user_id", input.userId)
    .eq("flag_type", input.flagType)
    .eq("status", "open")
    .maybeSingle();

  if (existing) return;

  const { error } = await admin.from("provider_fraud_flags").insert({
    user_id: input.userId,
    flag_type: input.flagType,
    severity: input.severity,
    details: input.details,
    status: "open",
  });

  if (error && !isMissingTableError(error)) {
    console.error("[fraud] flag insert failed", error.message);
  }
}

export async function checkFraudSignals(
  userId: string,
  metrics: ReputationMetricsRow
): Promise<void> {
  const totalBookings = metrics.bookings_completed + metrics.cancellations;
  if (totalBookings >= 3 && metrics.cancellations / totalBookings > 0.5) {
    await insertFlag({
      userId,
      flagType: "repeated_cancellations",
      severity: "medium",
      details: { cancellations: metrics.cancellations, total: totalBookings },
    });
  }

  if (metrics.inquiries_total >= 10 && metrics.response_rate < 0.2) {
    await insertFlag({
      userId,
      flagType: "spam_inquiries",
      severity: "low",
      details: { inquiries_total: metrics.inquiries_total, response_rate: metrics.response_rate },
    });
  }

  if (metrics.review_count >= 5 && metrics.review_average >= 4.95) {
    await insertFlag({
      userId,
      flagType: "review_abuse",
      severity: "low",
      details: { review_average: metrics.review_average, review_count: metrics.review_count },
    });
  }
}

export async function flagSuspiciousAccount(
  userId: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await insertFlag({
    userId,
    flagType: "suspicious_account",
    severity: "high",
    details: { reason },
  });
  return { ok: true };
}

export async function fetchOpenFraudFlags(limit = 50): Promise<FraudFlagRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("provider_fraud_flags")
    .select("id, user_id, flag_type, severity, details, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as FraudFlagRow[];
}

export async function resolveFraudFlag(
  flagId: string,
  action: "dismiss" | "suspend"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: flag } = await admin
    .from("provider_fraud_flags")
    .select("user_id")
    .eq("id", flagId)
    .maybeSingle();

  if (!flag) return { ok: false, error: "Flag not found." };

  await admin
    .from("provider_fraud_flags")
    .update({ status: action === "dismiss" ? "dismissed" : "actioned", reviewed_at: new Date().toISOString() })
    .eq("id", flagId);

  if (action === "suspend") {
    await admin
      .from("provider_verification_profiles")
      .update({ status: "suspended", suspended_at: new Date().toISOString() })
      .eq("user_id", (flag as { user_id: string }).user_id);
    await admin
      .from("profiles")
      .update({ is_active: false })
      .eq("id", (flag as { user_id: string }).user_id);
  }

  return { ok: true };
}
