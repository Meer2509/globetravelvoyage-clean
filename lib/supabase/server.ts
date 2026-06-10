// =============================================================================
// Globe Travel Voyage — Supabase Server Client (stub)
// =============================================================================
//
// STATUS: Stub client — safe to import from Server Components and API routes.
//
// To enable real Supabase server client:
//   1. Add keys to .env.local (see .env.example)
//   2. Install: npm install @supabase/supabase-js @supabase/ssr
//   3. Replace this file with:
//
//      import { createServerClient, type CookieOptions } from "@supabase/ssr";
//      import { cookies } from "next/headers";
//      import type { Database } from "./types";
//
//      export async function createServerSupabaseClient() {
//        const cookieStore = await cookies();
//        return createServerClient<Database>(
//          process.env.NEXT_PUBLIC_SUPABASE_URL!,
//          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//          {
//            cookies: {
//              get(name: string) { return cookieStore.get(name)?.value; },
//              set(name: string, value: string, options: CookieOptions) {
//                cookieStore.set({ name, value, ...options });
//              },
//              remove(name: string, options: CookieOptions) {
//                cookieStore.set({ name, value: "", ...options });
//              },
//            },
//          }
//        );
//      }
//
//      // Service role client (bypasses RLS) — server only, never expose to browser
//      export function createAdminSupabaseClient() {
//        return createClient<Database>(
//          process.env.NEXT_PUBLIC_SUPABASE_URL!,
//          process.env.SUPABASE_SERVICE_ROLE_KEY!
//        );
//      }
//
// =============================================================================

import type { Database } from "./types";
import { isSupabaseConfigured } from "./client";

export type { Database };
export { isSupabaseConfigured };

export type ServerSupabaseStub = null;

/**
 * Server-side Supabase client stub.
 * Returns null until real keys are added.
 * Use in Server Components: const db = await createServerSupabaseClient()
 */
export async function createServerSupabaseClient(): Promise<ServerSupabaseStub> {
  // Add real implementation here after installing @supabase/ssr
  return null;
}

/**
 * Admin/service-role client stub.
 * Server-only — never expose to the browser.
 * Returns null until SUPABASE_SERVICE_ROLE_KEY is set.
 */
export function createAdminSupabaseClient(): ServerSupabaseStub {
  // Add real implementation here after installing @supabase/ssr
  return null;
}

/**
 * Check if both public AND service role keys are configured.
 * Service role key is required for admin operations.
 */
export const isAdminClientConfigured =
  isSupabaseConfigured &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
