// =============================================================================
// Globe Travel Voyage — Supabase Browser Client
// =============================================================================
// Used in Client Components ("use client").
// createBrowserClient() uses a singleton — safe to call multiple times.
// Returns null when env keys are missing — forms and auth require configuration.
// =============================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// ── Config ────────────────────────────────────────────────────────────────────

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Supabase renamed anon key → publishable key; support both env var names.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/** True when both public env vars are present. */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

// ── Browser client factory ────────────────────────────────────────────────────

/**
 * Returns a typed Supabase browser client.
 * Returns null if keys are not configured — caller must guard with isSupabaseConfigured.
 *
 * Example:
 *   const client = createClient();
 *   if (!client) { return <SetupRequired />; }
 *   const { data } = await client.auth.signInWithPassword(...)
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  // createBrowserClient is a singleton — multiple calls return same instance
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;
