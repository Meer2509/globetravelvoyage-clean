"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import type { GrowthAttributionTouch } from "./types";

export async function persistGrowthAttribution(input: {
  sessionId: string;
  userId?: string | null;
  touch: GrowthAttributionTouch;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const touchPayload = {
    landing_path: input.touch.landing_path ?? null,
    referrer: input.touch.referrer ?? null,
    utm_source: input.touch.utm_source ?? null,
    utm_medium: input.touch.utm_medium ?? null,
    utm_campaign: input.touch.utm_campaign ?? null,
    utm_content: input.touch.utm_content ?? null,
    utm_term: input.touch.utm_term ?? null,
  };

  const { data: existing } = await admin
    .from("growth_attribution")
    .select("id")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("growth_attribution")
      .update({
        user_id: input.userId ?? undefined,
        last_touch: touchPayload,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", input.sessionId);

    if (error && !isMissingTableError(error)) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const { error } = await admin.from("growth_attribution").insert({
    session_id: input.sessionId,
    user_id: input.userId ?? null,
    landing_path: touchPayload.landing_path,
    referrer: touchPayload.referrer,
    utm_source: touchPayload.utm_source,
    utm_medium: touchPayload.utm_medium,
    utm_campaign: touchPayload.utm_campaign,
    utm_content: touchPayload.utm_content,
    utm_term: touchPayload.utm_term,
    first_touch: touchPayload,
    last_touch: touchPayload,
  });

  if (error && !isMissingTableError(error)) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function linkAttributionToUser(sessionId: string, userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  await admin
    .from("growth_attribution")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);
}
