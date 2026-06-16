"use server";

// =============================================================================
// Globe Travel Voyage — Auth callback completion (server action)
// =============================================================================

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { applyUserRole } from "./role-sync";
import { ensureProfileForUserId } from "./ensure-user-profile";
import { normalizeUserRole } from "@/lib/auth";
import type { UserRole } from "./types";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  visa_agent: "/dashboard/agent",
  travel_agency: "/dashboard/agency",
  tour_guide: "/dashboard/guide",
  property_host: "/dashboard/host",
  admin: "/dashboard/admin",
};

export type AuthCallbackResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; code?: string };

function formatCallbackError(message: string): { error: string; code?: string } {
  const lower = message.toLowerCase();

  if (
    lower.includes("expired") ||
    lower.includes("invalid") ||
    lower.includes("otp") ||
    lower.includes("already been used")
  ) {
    return {
      code: "link_expired",
      error:
        "This confirmation link has expired or was already used. Request a new email to continue.",
    };
  }

  if (lower.includes("access_denied")) {
    return {
      code: "access_denied",
      error: "Sign-in was cancelled. You can try again when you're ready.",
    };
  }

  return { error: "We couldn't complete sign-in. Please try again or request a new link." };
}

async function ensureAuthUserProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata ?? {};
  const role = normalizeUserRole(meta.role as string | undefined);

  await ensureProfileForUserId(user.id, user.email ?? "", {
    fullName: (meta.full_name as string | undefined) ?? "",
    email: user.email ?? "",
    phone: (meta.phone as string | undefined) ?? null,
    country: (meta.country as string | undefined) ?? null,
    city: (meta.city as string | undefined) ?? null,
    role,
    companyName: (meta.company_name as string | undefined) ?? null,
    businessType: (meta.business_type as string | undefined) ?? role,
    bio: (meta.bio as string | undefined) ?? null,
  });
}

async function resolveRoleAfterCallback(user: {
  id: string;
  user_metadata?: Record<string, unknown>;
}): Promise<UserRole> {
  const admin = createAdminClient();
  if (!admin) {
    return normalizeUserRole(user.user_metadata?.role as string | undefined);
  }

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const existing = (roleRow as { role: string } | null)?.role;
  if (existing) return normalizeUserRole(existing);

  const metaRole = normalizeUserRole(user.user_metadata?.role as string | undefined);
  if (metaRole !== "customer" || user.user_metadata?.role) {
    if (metaRole !== "admin") {
      await applyUserRole(user.id, metaRole);
    }
    return metaRole === "admin" ? "customer" : metaRole;
  }

  return "customer";
}

function dashboardForRole(role: UserRole): string {
  return ROLE_DASHBOARD[role] ?? "/dashboard";
}

export async function completeAuthCallback(input: {
  code: string;
  type?: string | null;
  next?: string | null;
}): Promise<AuthCallbackResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Authentication is not configured yet.", code: "not_configured" };
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(input.code);

  if (error || !data.session) {
    const formatted = formatCallbackError(error?.message ?? "Authentication failed");
    return { ok: false, ...formatted };
  }

  const user = data.session.user;
  await ensureAuthUserProfile(user);
  const role = await resolveRoleAfterCallback(user);

  if (input.type === "recovery") {
    return { ok: true, redirectTo: "/account/update-password" };
  }

  if (input.next && input.next.startsWith("/") && !input.next.startsWith("//")) {
    return { ok: true, redirectTo: input.next };
  }

  return { ok: true, redirectTo: dashboardForRole(role) };
}
