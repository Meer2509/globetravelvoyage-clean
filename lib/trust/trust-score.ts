"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import type { TrustScoreRow } from "./types";

export async function persistTrustScore(row: Omit<TrustScoreRow, "calculated_at">): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("provider_trust_scores").upsert(
    { ...row, calculated_at: new Date().toISOString() },
    { onConflict: "user_id,provider_role" }
  );

  if (error && !isMissingTableError(error)) {
    console.error("[trust] persist score failed", error.message);
  }
}

export async function fetchTrustScore(
  userId: string,
  providerRole: string
): Promise<TrustScoreRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("provider_trust_scores")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_role", providerRole)
    .maybeSingle();

  return (data as TrustScoreRow | null) ?? null;
}

export async function fetchPublicTrustScore(userId: string): Promise<TrustScoreRow | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("provider_trust_scores")
    .select("*")
    .eq("user_id", userId)
    .order("trust_score", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as TrustScoreRow | null) ?? null;
}
