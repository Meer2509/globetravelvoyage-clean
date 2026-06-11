// =============================================================================
// Globe Travel Voyage — Site URL helpers for auth redirects
// =============================================================================
// Production auth flows always use https://www.globetravelvoyage.com so email
// links never point at localhost. Local dev (localhost only) keeps same-origin.
// =============================================================================

export const PRODUCTION_SITE_URL = "https://www.globetravelvoyage.com";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Base site URL for auth redirects (no trailing slash).
 * - localhost dev → current origin
 * - everything else in production → https://www.globetravelvoyage.com
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  if (typeof window !== "undefined") {
    if (isLocalHostname(window.location.hostname)) {
      return window.location.origin;
    }
    return PRODUCTION_SITE_URL;
  }

  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    return process.env.NEXT_PUBLIC_DEV_SITE_URL ?? "http://localhost:3000";
  }

  return PRODUCTION_SITE_URL;
}

/** Supabase emailRedirectTo / redirectTo target. */
export function getAuthCallbackUrl(type?: "recovery" | "signup" | "magiclink" | "invite"): string {
  const base = `${getSiteUrl()}/auth/callback`;
  if (!type) return base;
  return `${base}?type=${type}`;
}
