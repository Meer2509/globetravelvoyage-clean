import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./client";

/**
 * Cookie-free Supabase client for public reads (catalog, SEO, pricing).
 * Safe for generateStaticParams, generateMetadata, and build-time SSG.
 */
export function createPublicSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
