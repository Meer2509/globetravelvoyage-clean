"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { persistGrowthAttribution } from "@/lib/growth/attribution-actions";
import {
  GROWTH_COOKIE_NAME,
  GROWTH_SESSION_KEY,
  type GrowthCookiePayload,
} from "@/lib/growth/attribution-cookie";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(GROWTH_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GROWTH_SESSION_KEY, id);
  }
  return id;
}

function setGrowthCookie(payload: GrowthCookiePayload): void {
  const value = encodeURIComponent(JSON.stringify(payload));
  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${GROWTH_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function GrowthAttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const utm_source = searchParams.get("utm_source") ?? undefined;
    const utm_medium = searchParams.get("utm_medium") ?? undefined;
    const utm_campaign = searchParams.get("utm_campaign") ?? undefined;
    const utm_content = searchParams.get("utm_content") ?? undefined;
    const utm_term = searchParams.get("utm_term") ?? undefined;
    const hasUtm = Boolean(utm_source || utm_medium || utm_campaign);

    const payload: GrowthCookiePayload = {
      session_id: sessionId,
      landing_path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      ...(hasUtm
        ? { utm_source, utm_medium, utm_campaign, utm_content, utm_term }
        : {}),
    };

    setGrowthCookie(payload);

    persistGrowthAttribution({
      sessionId,
      touch: {
        landing_path: pathname,
        referrer: payload.referrer ?? null,
        utm_source: payload.utm_source ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
        utm_content: payload.utm_content ?? null,
        utm_term: payload.utm_term ?? null,
      },
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
