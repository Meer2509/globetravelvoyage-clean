// =============================================================================
// Globe Travel Voyage — Next.js Proxy (replaces deprecated middleware.ts)
// =============================================================================
// Runs on every request (except static assets).
// Responsibilities:
//   1. Refresh Supabase auth tokens via getUser() on each request
//   2. Protect /dashboard/* and /onboarding/* routes — redirect unauthenticated users
//   3. Redirect authenticated users away from /login and /register
//
// CRITICAL: Never remove supabase.auth.getUser() — it refreshes expired tokens.
// CRITICAL: Use ONLY getAll/setAll — never get/set/remove (deprecated by @supabase/ssr).
// CRITICAL: Return supabaseResponse (not NextResponse.next()) to propagate cookies.
// =============================================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const isConfigured = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

// Routes that logged-in users should be redirected away from
const AUTH_PAGES = ["/login", "/register"];

// Role → dashboard mapping
const ROLE_DASHBOARD: Record<string, string> = {
  customer:       "/dashboard/customer",
  visa_agent:     "/dashboard/agent",
  travel_agency:  "/dashboard/agency",
  tour_guide:     "/dashboard/guide",
  property_host:  "/dashboard/host",
  admin:          "/dashboard/admin",
};

function getDashboardForRole(role: UserRole | string | undefined): string {
  return ROLE_DASHBOARD[role ?? "customer"] ?? "/dashboard/customer";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip Supabase if not configured (demo mode) ─────────────────────────────
  if (!isConfigured) {
    return NextResponse.next({ request });
  }

  // ── Build Supabase client with request cookies ───────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // IMPORTANT: setAll in proxy must apply cookies AND cache headers to response
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  // ── IMPORTANT: getUser() refreshes the session. Do not remove or move. ───────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Route protection ─────────────────────────────────────────────────────────

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // No user + protected route → redirect to login with `next` param
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in user on login/register → redirect to their dashboard
  if (user && isAuthPage) {
    const role = user.user_metadata?.role as string | undefined;
    return NextResponse.redirect(
      new URL(getDashboardForRole(role), request.url)
    );
  }

  // ── Return response with refreshed cookies ───────────────────────────────────
  // IMPORTANT: always return supabaseResponse to propagate session cookies.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (Next.js static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - Static image formats
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
