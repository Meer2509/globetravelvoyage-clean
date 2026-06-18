import type { GrowthContext } from "./types";

export const GROWTH_COOKIE_NAME = "gtv_growth";
export const GROWTH_SESSION_KEY = "gtv_session_id";

export interface GrowthCookiePayload {
  session_id: string;
  landing_path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export function parseGrowthCookie(raw: string | undefined): GrowthCookiePayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as GrowthCookiePayload;
    if (!parsed.session_id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function growthContextFromCookie(payload: GrowthCookiePayload | null, sourcePath?: string): GrowthContext {
  if (!payload) return { source_path: sourcePath ?? null };
  return {
    session_id: payload.session_id,
    landing_path: payload.landing_path ?? null,
    referrer: payload.referrer ?? null,
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    utm_content: payload.utm_content ?? null,
    utm_term: payload.utm_term ?? null,
    source_path: sourcePath ?? payload.landing_path ?? null,
  };
}
