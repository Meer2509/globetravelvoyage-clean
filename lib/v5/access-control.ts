"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  FREE_SAVED_TRIP_LIMIT,
  PLUS_SAVED_TRIP_LIMIT,
  PREMIUM_SAVED_TRIP_LIMIT,
} from "./plans";

export type UserPremiumTier = "free" | "concierge_plus" | "premium_concierge" | "agent_pro";

export interface UserPremiumAccess {
  tier: UserPremiumTier;
  savedTripLimit: number;
  priorityConcierge: boolean;
  prioritySupport: boolean;
  enhancedItineraries: boolean;
  isAgentPro: boolean;
}

const DEFAULT_ACCESS: UserPremiumAccess = {
  tier: "free",
  savedTripLimit: FREE_SAVED_TRIP_LIMIT,
  priorityConcierge: false,
  prioritySupport: false,
  enhancedItineraries: false,
  isAgentPro: false,
};

export async function getUserPremiumAccess(userId: string | null): Promise<UserPremiumAccess> {
  if (!userId) return DEFAULT_ACCESS;

  const admin = createAdminClient();
  if (!admin) return DEFAULT_ACCESS;

  const now = new Date().toISOString();

  const [{ data: subs }, { data: entitlements }] = await Promise.all([
    admin
      .from("subscriptions")
      .select("plan_key, status, current_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`current_period_end.is.null,current_period_end.gt.${now}`),
    admin
      .from("user_entitlements")
      .select("entitlement_type, product_key, expires_at, status")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  let tier: UserPremiumTier = "free";
  let isAgentPro = false;

  for (const sub of subs ?? []) {
    const key = (sub as { plan_key: string }).plan_key;
    if (key === "ai_concierge_plus") tier = "concierge_plus";
    if (key === "travel_agent_pro") {
      isAgentPro = true;
      tier = tier === "concierge_plus" ? tier : "agent_pro";
    }
  }

  for (const ent of entitlements ?? []) {
    const row = ent as { entitlement_type: string; product_key: string; expires_at: string | null };
    if (row.expires_at && row.expires_at < now) continue;

    if (row.entitlement_type === "concierge_plus" || row.product_key === "ai_concierge_plus") {
      tier = "concierge_plus";
    }
    if (
      row.entitlement_type === "premium_concierge" ||
      row.product_key === "premium_concierge_planning"
    ) {
      tier = "premium_concierge";
    }
    if (row.entitlement_type === "agent_pro" || row.product_key === "travel_agent_pro") {
      isAgentPro = true;
    }
  }

  if (tier === "premium_concierge") {
    return {
      tier,
      savedTripLimit: PREMIUM_SAVED_TRIP_LIMIT,
      priorityConcierge: true,
      prioritySupport: true,
      enhancedItineraries: true,
      isAgentPro,
    };
  }

  if (tier === "concierge_plus") {
    return {
      tier,
      savedTripLimit: PLUS_SAVED_TRIP_LIMIT,
      priorityConcierge: true,
      prioritySupport: true,
      enhancedItineraries: true,
      isAgentPro,
    };
  }

  if (isAgentPro) {
    return {
      tier: "agent_pro",
      savedTripLimit: FREE_SAVED_TRIP_LIMIT,
      priorityConcierge: false,
      prioritySupport: true,
      enhancedItineraries: false,
      isAgentPro: true,
    };
  }

  return DEFAULT_ACCESS;
}

export async function canUserSaveTrip(userId: string): Promise<{ ok: true } | { ok: false; error: string; limit: number }> {
  const admin = createAdminClient();
  if (!admin) return { ok: true };

  const access = await getUserPremiumAccess(userId);

  const { count } = await admin
    .from("trip_plans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_saved", true);

  const current = count ?? 0;
  if (current >= access.savedTripLimit) {
    return {
      ok: false,
      error: `Save limit reached (${access.savedTripLimit}). Upgrade for more saved trips.`,
      limit: access.savedTripLimit,
    };
  }

  return { ok: true };
}
