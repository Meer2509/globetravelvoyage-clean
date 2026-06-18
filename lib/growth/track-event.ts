"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import {
  growthContextFromCookie,
  parseGrowthCookie,
  GROWTH_COOKIE_NAME,
} from "./attribution-cookie";
import type { GrowthContext, TrackGrowthEventInput } from "./types";

async function resolveGrowthContext(context?: GrowthContext): Promise<GrowthContext> {
  if (context?.session_id) return context;
  const cookieStore = await cookies();
  const payload = parseGrowthCookie(cookieStore.get(GROWTH_COOKIE_NAME)?.value);
  return growthContextFromCookie(payload, context?.source_path ?? undefined);
}

/** Fire-and-forget growth event — never blocks user flows. */
export async function trackGrowthEvent(input: TrackGrowthEventInput): Promise<void> {
  try {
    const admin = createAdminClient();
    if (!admin) return;

    const ctx = await resolveGrowthContext(input.context);

    const { error } = await admin.from("growth_events").insert({
      event_type: input.eventType,
      user_id: input.userId ?? null,
      email: input.email ?? null,
      session_id: ctx.session_id ?? null,
      source_path: ctx.source_path ?? null,
      referrer: ctx.referrer ?? null,
      utm_source: ctx.utm_source ?? null,
      utm_medium: ctx.utm_medium ?? null,
      utm_campaign: ctx.utm_campaign ?? null,
      utm_content: ctx.utm_content ?? null,
      utm_term: ctx.utm_term ?? null,
      related_id: input.relatedId ?? null,
      metadata: input.metadata ?? {},
    });

    if (error && !isMissingTableError(error)) {
      console.error("[growth] track event failed", input.eventType, error.message);
    }
  } catch (err) {
    console.error("[growth] track event error", err);
  }
}
