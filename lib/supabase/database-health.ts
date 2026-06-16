"use server";

import { createServerSupabaseClient, isSupabaseConfigured } from "./server";
import { createAdminClient, isAdminClientConfigured } from "./admin";
import { isMissingTableError } from "./profile-utils";

export interface DatabaseHealthResult {
  ok: boolean;
  configured: boolean;
  clientConnected: boolean;
  authOk: boolean;
  tables: {
    profiles: boolean;
    user_roles: boolean;
    visa_experts: boolean;
  };
  message: string;
}

async function probeTable(table: string, supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<boolean> {
  const admin = createAdminClient();
  const client = admin ?? supabase;
  if (!client) return false;

  const { error } = await client.from(table).select("id", { head: true, count: "exact" });
  if (!error) return true;
  return !isMissingTableError(error);
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const configured = isSupabaseConfigured;
  const clientConnected = isAdminClientConfigured;

  const empty: DatabaseHealthResult = {
    ok: false,
    configured,
    clientConnected,
    authOk: false,
    tables: { profiles: false, user_roles: false, visa_experts: false },
    message: configured
      ? "Supabase is configured but the admin client is unavailable."
      : "Supabase is not configured.",
  };

  if (!configured) return empty;

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ...empty, message: "Could not create Supabase client." };
  }

  const { error: authError } = await supabase.auth.getUser();
  const authOk = !authError;

  const [profiles, user_roles, visa_experts] = await Promise.all([
    probeTable("profiles", supabase),
    probeTable("user_roles", supabase),
    probeTable("visa_experts", supabase),
  ]);

  const coreReady = profiles && user_roles && visa_experts;
  const ok = coreReady && configured;

  return {
    ok,
    configured: true,
    clientConnected,
    authOk,
    tables: { profiles, user_roles, visa_experts },
    message: ok
      ? "Database connected"
      : !profiles
        ? "The profiles table was not found. Run supabase/schema.sql in your Supabase SQL Editor."
        : !user_roles
          ? "The user_roles table was not found. Run supabase/schema.sql in your Supabase SQL Editor."
          : !visa_experts
            ? "The visa_experts table was not found. Run supabase/schema.sql in your Supabase SQL Editor."
            : !clientConnected
              ? "Add SUPABASE_SERVICE_ROLE_KEY to enable full dashboard data access."
              : "Database connection could not be verified.",
  };
}
