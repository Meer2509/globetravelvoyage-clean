// =============================================================================
// Globe Travel Voyage — Supabase barrel export
// =============================================================================

export {
  createClient,
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./client";
export type { SupabaseBrowserClient } from "./client";

export {
  createServerSupabaseClient,
  createAdminSupabaseClient,
  isAdminClientConfigured,
} from "./server";

// All DB types (Database, Profile, Booking, TableName, etc.)
export type * from "./types";
