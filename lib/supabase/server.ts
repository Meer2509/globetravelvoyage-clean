// =============================================================================
// Globe Travel Voyage — Supabase Server Client
// =============================================================================
// Used in Server Components, Server Actions, and Route Handlers.
// Must be called per-request (not module-level) to get fresh cookies.
//
// CRITICAL: Use ONLY getAll/setAll — never get/set/remove (deprecated).
// CRITICAL: cookies() is async in Next.js 16 — always await it.
// =============================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./client";

export { isSupabaseConfigured };

export const isAdminClientConfigured =
  isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Server client (per-request, uses auth cookie) ─────────────────────────────

/**
 * Returns a typed Supabase server client bound to the current request's cookies.
 * Returns null when Supabase env keys are missing.
 *
 * Usage (Server Component):
 *   const supabase = await createServerSupabaseClient();
 *   if (!supabase) return null;  // or show setup message
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, _headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware handles the actual refresh.
        }
      },
    },
  });
}

// ── Admin client (service role — NEVER expose to browser) ─────────────────────

/**
 * Service-role client — bypasses RLS.
 * ONLY use in server-side code (Route Handlers, Server Actions, cron jobs).
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is missing.
 */
export async function createAdminSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !serviceKey) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component context — middleware handles refresh.
        }
      },
    },
  });
}
