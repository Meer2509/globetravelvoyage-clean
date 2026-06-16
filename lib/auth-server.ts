import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUserRole } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

export type AuthCheckResult =
  | { ok: true; userId: string; role: UserRole }
  | { ok: false; error: string };

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function resolveUserRole(userId: string): Promise<UserRole> {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    const dbRole = normalizeUserRole((data as { role: string } | null)?.role);
    if (dbRole !== "customer" || data) return dbRole;
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id === userId) {
      return normalizeUserRole(user.user_metadata?.role as string | undefined);
    }
  }

  return "customer";
}

export async function requireSession(): Promise<AuthCheckResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { ok: false, error: "Sign in required." };
  }

  const role = await resolveUserRole(user.id);
  return { ok: true, userId: user.id, role };
}

export async function requireAdmin(): Promise<AuthCheckResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (session.role !== "admin") {
    return { ok: false, error: "Administrator access required." };
  }
  return session;
}

/** Roles users may assign to themselves during signup or onboarding. */
export const SELF_ASSIGNABLE_ROLES: UserRole[] = [
  "customer",
  "visa_agent",
  "travel_agency",
  "tour_guide",
  "property_host",
];
