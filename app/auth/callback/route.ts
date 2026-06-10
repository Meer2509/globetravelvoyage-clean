// =============================================================================
// Globe Travel Voyage — Supabase Auth Callback Route
// GET /auth/callback
// =============================================================================
// Handles:
//   - Email confirmation after signup
//   - OAuth callbacks (Google, Apple)
//   - Password reset confirmation links
//
// Supabase redirects here with ?code=xxx after any auth flow.
// We exchange the code for a session, then redirect the user.
// =============================================================================

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

const ROLE_REDIRECT: Record<string, string> = {
  customer:       "/dashboard/customer",
  visa_agent:     "/dashboard/agent",
  travel_agency:  "/dashboard/agency",
  tour_guide:     "/dashboard/guide",
  property_host:  "/dashboard/host",
  admin:          "/dashboard/admin",
};

const ROLE_ONBOARDING: Record<string, string> = {
  customer:       "/onboarding/customer",
  visa_agent:     "/onboarding/agent",
  travel_agency:  "/onboarding/agency",
  tour_guide:     "/onboarding/guide",
  property_host:  "/onboarding/host",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");    // explicit redirect override
  const type = searchParams.get("type");    // 'signup' | 'recovery' | 'invite'

  // No code → auth failed
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    // Supabase not configured — send to setup page
    return NextResponse.redirect(`${origin}/admin/setup`);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const user = data.session.user;
  const role = user.user_metadata?.role as UserRole | undefined;

  // Password reset flow → send to password update page
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/account/update-password`);
  }

  // Explicit `next` override (from login page with ?next=...)
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // New signup — send to onboarding if available for role
  const isNewUser = data.session.user.created_at === data.session.user.updated_at;
  if (isNewUser && role && ROLE_ONBOARDING[role]) {
    return NextResponse.redirect(`${origin}${ROLE_ONBOARDING[role]}`);
  }

  // Existing user — send to dashboard
  const dashboard = ROLE_REDIRECT[role ?? "customer"] ?? "/dashboard/customer";
  return NextResponse.redirect(`${origin}${dashboard}`);
}
