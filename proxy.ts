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
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeUserRole } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const isConfigured = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/admin"];

// Routes that logged-in users should be redirected away from
const AUTH_PAGES = ["/login", "/register"];

// Role → dashboard mapping
const ROLE_DASHBOARD: Record<string, string> = {
  customer:       "/dashboard/customer",
  visa_agent:     "/dashboard/agent",
  visa_expert:    "/dashboard/agent",
  travel_agency:  "/dashboard/agency",
  tour_guide:     "/dashboard/guide",
  property_host:  "/dashboard/host",
  admin:          "/dashboard/admin",
};

/** Paths each role may visit under /dashboard (beyond the primary home route). */
const ROLE_DASHBOARD_PREFIXES: Record<UserRole, string[]> = {
  customer: [
    "/dashboard/customer",
    "/dashboard/visa-cases",
    "/dashboard/billing",
    "/dashboard/support",
    "/dashboard/documents",
    "/dashboard/profile",
    "/dashboard/messages",
  ],
  visa_agent: ["/dashboard/agent", "/dashboard/profile", "/dashboard/payouts", "/dashboard/messages"],
  travel_agency: ["/dashboard/agency", "/dashboard/profile", "/dashboard/payouts", "/dashboard/messages"],
  tour_guide: ["/dashboard/guide", "/dashboard/profile", "/dashboard/payouts", "/dashboard/messages"],
  property_host: ["/dashboard/host", "/dashboard/profile", "/dashboard/payouts", "/dashboard/messages"],
  admin: ["/dashboard"],
};

function getDashboardForRole(role: UserRole | string | undefined): string {
  const normalized = normalizeUserRole(role);
  return ROLE_DASHBOARD[normalized] ?? ROLE_DASHBOARD[role ?? ""] ?? "/dashboard";
}

function isDashboardPathAllowed(pathname: string, role: UserRole): boolean {
  if (role === "admin") return true;
  const prefixes = ROLE_DASHBOARD_PREFIXES[role] ?? [getDashboardForRole(role)];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getPrimaryRoleFromDb(userId: string): Promise<UserRole | undefined> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !SUPABASE_URL) return undefined;

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  const role = (data as { role: string } | null)?.role;
  return role ? normalizeUserRole(role) : undefined;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip Supabase when not configured ─────────────────────────────────────
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

  // Logged-in user on login/register or generic /dashboard → role dashboard
  if (user && (isAuthPage || pathname === "/dashboard")) {
    const dbRole = await getPrimaryRoleFromDb(user.id);
    const role = dbRole ?? normalizeUserRole(user.user_metadata?.role as string | undefined);
    return NextResponse.redirect(
      new URL(getDashboardForRole(role), request.url)
    );
  }

  // Role-specific dashboard — redirect only when path is not allowed for this role
  if (user && pathname.startsWith("/dashboard/")) {
    const dbRole = await getPrimaryRoleFromDb(user.id);
    const metaRole = normalizeUserRole(user.user_metadata?.role as string | undefined);
    const adminEmail = (
      process.env.PLATFORM_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "meerhamzakhan2020@gmail.com"
    ).toLowerCase();
    const isAdmin =
      dbRole === "admin" ||
      metaRole === "admin" ||
      user.email?.toLowerCase() === adminEmail;
    const role = isAdmin ? "admin" : (dbRole ?? metaRole);
    if (!isDashboardPathAllowed(pathname, role)) {
      return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
    }
  }

  // /admin/* — authenticated platform admins only
  if (user && pathname.startsWith("/admin")) {
    const dbRole = await getPrimaryRoleFromDb(user.id);
    const metaRole = normalizeUserRole(user.user_metadata?.role as string | undefined);
    const adminEmail = (
      process.env.PLATFORM_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "meerhamzakhan2020@gmail.com"
    ).toLowerCase();
    const isAdmin =
      dbRole === "admin" ||
      metaRole === "admin" ||
      user.email?.toLowerCase() === adminEmail;
    if (!isAdmin) {
      return NextResponse.redirect(new URL(getDashboardForRole(dbRole ?? metaRole), request.url));
    }
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
