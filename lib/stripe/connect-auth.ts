import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUserRole } from "@/lib/auth";
import { isProviderPayoutRole, type ProviderPayoutRole } from "@/lib/stripe/connect-config";
import type { UserRole } from "@/lib/supabase/types";

export interface AuthenticatedProvider {
  id: string;
  email: string | null;
  role: ProviderPayoutRole;
}

export async function getAuthenticatedProvider(): Promise<
  { ok: true; provider: AuthenticatedProvider } | { ok: false; error: string; status: number }
> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured.", status: 503 };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "Sign in required.", status: 401 };
  }

  const role = await resolveProviderRole(user.id, user.user_metadata?.role as string | undefined);
  if (!role || !isProviderPayoutRole(role)) {
    return { ok: false, error: "Only verified provider accounts can set up payouts.", status: 403 };
  }

  return {
    ok: true,
    provider: { id: user.id, email: user.email ?? null, role },
  };
}

async function resolveProviderRole(
  userId: string,
  metadataRole?: string
): Promise<ProviderPayoutRole | null> {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();

    const dbRole = normalizeUserRole((data as { role: string } | null)?.role);
    if (isProviderPayoutRole(dbRole)) return dbRole;
  }

  const metaRole = normalizeUserRole(metadataRole);
  return isProviderPayoutRole(metaRole) ? metaRole : null;
}

export async function getUserRoleForAdmin(userId: string): Promise<UserRole> {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    return normalizeUserRole((data as { role: string } | null)?.role);
  }
  return "customer";
}
