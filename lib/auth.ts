// =============================================================================
// Globe Travel Voyage — Auth Helper Functions
// =============================================================================
// Client-side helpers used in "use client" components.
// All functions return null / undefined gracefully if Supabase is not configured.
// =============================================================================

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";

// ── Role mappings ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  customer:       "Traveler",
  visa_agent:     "Visa Expert",
  travel_agency:  "Travel Agency",
  tour_guide:     "Tour Guide",
  property_host:  "Property Host",
  admin:          "Administrator",
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  customer:       "/dashboard/customer",
  visa_agent:     "/dashboard/agent",
  travel_agency:  "/dashboard/agency",
  tour_guide:     "/dashboard/guide",
  property_host:  "/dashboard/host",
  admin:          "/dashboard/admin",
};

export const ROLE_ONBOARDING: Record<UserRole, string> = {
  customer:       "/onboarding/customer",
  visa_agent:     "/onboarding/agent",
  travel_agency:  "/onboarding/agency",
  tour_guide:     "/onboarding/guide",
  property_host:  "/onboarding/host",
  admin:          "/dashboard/admin",
};

export const ROLE_EMOJI: Record<UserRole, string> = {
  customer:       "🧳",
  visa_agent:     "👔",
  travel_agency:  "🏢",
  tour_guide:     "🧭",
  property_host:  "🏠",
  admin:          "⚙️",
};

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Get the current user's session and profile data.
 * Returns null if not authenticated or Supabase not configured.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return user;
}

const VALID_ROLES: UserRole[] = [
  "customer", "visa_agent", "travel_agency", "tour_guide", "property_host", "admin",
];

/** Map legacy/alternate role strings to canonical UserRole values. */
export function normalizeUserRole(role: string | null | undefined): UserRole {
  if (!role) return "customer";
  if (role === "visa_expert") return "visa_agent";
  return VALID_ROLES.includes(role as UserRole) ? (role as UserRole) : "customer";
}

export function getRoleLabel(role: UserRole | string | null | undefined): string {
  return ROLE_LABELS[normalizeUserRole(role ?? undefined)] ?? "Traveler";
}

export function isVisaExpertRole(role: UserRole | string | null | undefined): boolean {
  return normalizeUserRole(role ?? undefined) === "visa_agent";
}

/**
 * Get role from user_metadata (fallback when DB unavailable).
 */
export function getUserRole(user: { user_metadata?: Record<string, unknown> } | null): UserRole {
  if (!user?.user_metadata?.role) return "customer";
  return normalizeUserRole(user.user_metadata.role as string);
}

/**
 * Fetch primary role from user_roles table (preferred when Supabase is live).
 */
export async function getUserRoleFromDb(userId: string): Promise<UserRole | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  const row = data as { role: UserRole } | null;
  if (error || !row?.role) return null;
  return normalizeUserRole(row.role);
}

/**
 * Resolve role: DB first, then metadata fallback.
 */
export async function resolveUserRole(
  user: { id: string; user_metadata?: Record<string, unknown> } | null
): Promise<UserRole> {
  if (!user) return "customer";
  const dbRole = await getUserRoleFromDb(user.id);
  return dbRole ?? getUserRole(user);
}

/**
 * Sign out the current user and redirect.
 */
export async function signOut(redirectTo = "/login") {
  const supabase = createClient();
  if (!supabase) {
    window.location.href = redirectTo;
    return;
  }

  await supabase.auth.signOut();
  window.location.href = redirectTo;
}

/**
 * Get the dashboard URL for a given role.
 */
export function getDashboardUrl(role: UserRole | string | undefined): string {
  return ROLE_DASHBOARD[role as UserRole] ?? "/dashboard";
}

/**
 * Get the onboarding URL for a given role.
 */
export function getOnboardingUrl(role: UserRole | string | undefined): string {
  return ROLE_ONBOARDING[role as UserRole] ?? "/onboarding/customer";
}

// ── Error message formatting ───────────────────────────────────────────────────

/**
 * Convert Supabase auth error codes to user-friendly messages.
 */
export function formatAuthError(error: { message?: string; code?: string } | null): string {
  if (!error) return "";

  const msg = error.message?.toLowerCase() ?? "";
  const code = error.code ?? "";

  if (msg.includes("invalid login credentials") || code === "invalid_credentials") {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox.";
  }
  if (msg.includes("user already registered") || code === "user_already_exists") {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("email rate limit") || code === "over_email_send_rate_limit") {
    return "Too many emails sent. Please wait a few minutes before trying again.";
  }
  if (msg.includes("password") && msg.includes("short")) {
    return "Password must be at least 8 characters long.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  return error.message ?? "An unexpected error occurred. Please try again.";
}

// ── Re-export for convenience ─────────────────────────────────────────────────

export { isSupabaseConfigured, createClient };
export { getSiteUrl, getAuthCallbackUrl, PRODUCTION_SITE_URL } from "@/lib/site-url";
