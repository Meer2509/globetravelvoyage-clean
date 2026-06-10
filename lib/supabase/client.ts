// =============================================================================
// Globe Travel Voyage — Supabase Browser Client (stub)
// =============================================================================
//
// STATUS: Stub client — safe to import, returns null until keys are added.
//
// To enable real Supabase:
//   1. Add keys to .env.local  (see .env.example)
//   2. Install:  npm install @supabase/supabase-js @supabase/ssr
//   3. Replace this file with:
//
//      import { createBrowserClient } from "@supabase/ssr";
//      import type { Database } from "./types";
//
//      export const supabase = createBrowserClient<Database>(
//        process.env.NEXT_PUBLIC_SUPABASE_URL!,
//        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//      );
//      export const isSupabaseConfigured = true;
//
// =============================================================================

import type { Database } from "./types";

// ── Config detection ──────────────────────────────────────────────────────────

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both public env vars are set. */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

// ── Stub client ───────────────────────────────────────────────────────────────
// Type-annotated as null for now; will be SupabaseClient<Database> once enabled.

export type SupabaseStub = null;

/**
 * Supabase browser client.
 * Returns null until real keys are added — all pages gracefully fall back to mock data.
 * Replace with `createBrowserClient<Database>(...)` after setup.
 */
export const supabase: SupabaseStub = null;

// ── Typed table helpers (ready for real client) ───────────────────────────────
// These are convenience aliases. Use them in components:
//   import { tables } from "@/lib/supabase/client";
//   // When real client is wired: await tables.profiles.select()

export type TableName = keyof Database["public"]["Tables"];
