// =============================================================================
// Globe Travel Voyage — Supabase Admin Client (service role)
// =============================================================================
// SERVER ONLY — never import in Client Components.
// Bypasses RLS for trusted server operations (guest form intake, admin reads).
// =============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, isSupabaseConfigured } from "./client";

export const isAdminClientConfigured =
  isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Service-role Supabase client. Returns null when keys are missing.
 * Use for: anonymous form submissions, admin dashboard aggregates.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !serviceKey) return null;

  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseClient;
}

export type SupabaseAdminClient = SupabaseClient;
