// =============================================================================
// Globe Travel Voyage — Supabase barrel export
// =============================================================================
// Import from "@/lib/supabase" to get everything in one shot.

export { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./client";
export type { TableName } from "./client";
export { createServerSupabaseClient, createAdminSupabaseClient, isAdminClientConfigured } from "./server";
// All DB types (Database, Profile, Booking, etc.) come from types.ts
export type * from "./types";
