"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { requireAdmin } from "@/lib/auth-server";
import { recalculateReputationForUser } from "./reputation-engine";
import type {
  ProviderCategory,
  PublicTrustProfile,
  VerificationLevel,
  VerificationProfileRow,
  VerificationStatus,
} from "./types";
import { PROVIDER_CATEGORIES } from "./types";

async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function normalizeRow(row: Record<string, unknown>): VerificationProfileRow {
  const base = row as unknown as VerificationProfileRow;
  return {
    ...base,
    certifications: Array.isArray(row.certifications) ? (row.certifications as string[]) : [],
    social_links: (row.social_links as Record<string, string>) ?? {},
  };
}

export async function fetchMyVerificationProfiles(): Promise<
  { ok: true; profiles: VerificationProfileRow[]; trustScore: number | null } | { ok: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in to view verification." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data } = await admin
    .from("provider_verification_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  const { data: scoreRow } = await admin
    .from("provider_trust_scores")
    .select("trust_score")
    .eq("user_id", userId)
    .order("trust_score", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ok: true,
    profiles: (data ?? []).map((r) => normalizeRow(r as Record<string, unknown>)),
    trustScore: (scoreRow as { trust_score?: number } | null)?.trust_score ?? null,
  };
}

export async function saveVerificationProfile(input: {
  providerCategory: ProviderCategory;
  website?: string;
  verificationNotes?: string;
  socialLinks?: Record<string, string>;
  certifications?: string[];
  identityDocPath?: string;
  businessLicensePath?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const category = PROVIDER_CATEGORIES.find((c) => c.key === input.providerCategory);
  if (!category) return { ok: false, error: "Invalid provider category." };

  const now = new Date().toISOString();

  const payload = {
    user_id: userId,
    provider_category: input.providerCategory,
    provider_role: category.role,
    website: input.website?.trim() || null,
    verification_notes: input.verificationNotes?.trim() || null,
    social_links: input.socialLinks ?? {},
    certifications: input.certifications ?? [],
    identity_doc_path: input.identityDocPath ?? null,
    business_license_path: input.businessLicensePath ?? null,
    status: "pending" as VerificationStatus,
    submitted_at: now,
    updated_at: now,
  };

  const { data: existing } = await admin
    .from("provider_verification_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_category", input.providerCategory)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("provider_verification_profiles")
      .update(payload)
      .eq("id", (existing as { id: string }).id);
    if (error) return { ok: false, error: error.message };
    recalculateReputationForUser(userId, category.role);
    return { ok: true, id: (existing as { id: string }).id };
  }

  const { data, error } = await admin
    .from("provider_verification_profiles")
    .insert({ ...payload, verification_level: "basic" })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) return { ok: false, error: "Verification system not available." };
    return { ok: false, error: error.message };
  }

  recalculateReputationForUser(userId, category.role);
  return { ok: true, id: (data as { id: string }).id };
}

export async function fetchPublicTrustProfile(userId: string): Promise<PublicTrustProfile | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const [profileRes, verificationRes, scoreRes, metricsRes] = await Promise.all([
    admin.from("profiles").select("full_name, is_active").eq("id", userId).maybeSingle(),
    admin
      .from("provider_verification_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("provider_trust_scores")
      .select("*")
      .eq("user_id", userId)
      .order("trust_score", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("provider_reputation_metrics")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profileRes.data) return null;

  const profile = profileRes.data as { full_name: string; is_active: boolean };
  const verification = verificationRes.data
    ? normalizeRow(verificationRes.data as Record<string, unknown>)
    : null;
  const score = scoreRes.data as { trust_score?: number; badge_tier?: string } | null;
  const metrics = metricsRes.data as {
    review_average?: number;
    review_count?: number;
    inquiries_answered?: number;
    inquiries_total?: number;
    bookings_completed?: number;
  } | null;

  const responseRate =
    metrics && metrics.inquiries_total
      ? Math.round(((metrics.inquiries_answered ?? 0) / metrics.inquiries_total) * 100)
      : 0;

  return {
    userId,
    displayName: profile.full_name,
    providerCategory: verification?.provider_category ?? "travel_agent",
    verificationLevel: verification?.verification_level ?? "basic",
    verificationStatus: verification?.status ?? "draft",
    trustScore: score?.trust_score ?? 0,
    badgeTier: (score?.badge_tier as PublicTrustProfile["badgeTier"]) ?? "none",
    responseRate,
    reviewAverage: Number(metrics?.review_average ?? 0),
    reviewCount: metrics?.review_count ?? 0,
    completedServices: metrics?.bookings_completed ?? 0,
    website: verification?.website ?? null,
    socialLinks: verification?.social_links ?? {},
    isSuspended: verification?.status === "suspended" || !profile.is_active,
  };
}

export async function fetchAdminVerificationQueue(): Promise<
  Array<VerificationProfileRow & { full_name: string; email: string }>
> {
  const auth = await requireAdmin();
  if (!auth.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("provider_verification_profiles")
    .select("*, profiles(full_name, email)")
    .in("status", ["pending", "under_review"])
    .order("submitted_at", { ascending: true })
    .limit(100);

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const profiles = r.profiles as { full_name: string; email: string } | null;
    return {
      ...normalizeRow(r),
      full_name: profiles?.full_name ?? "Provider",
      email: profiles?.email ?? "",
    };
  });
}

export async function adminVerifyProvider(input: {
  profileId: string;
  level: VerificationLevel;
  adminNotes?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: row } = await admin
    .from("provider_verification_profiles")
    .select("user_id, provider_role, provider_category")
    .eq("id", input.profileId)
    .maybeSingle();

  if (!row) return { ok: false, error: "Profile not found." };

  const profile = row as { user_id: string; provider_role: string; provider_category: string };
  const now = new Date().toISOString();

  await admin
    .from("provider_verification_profiles")
    .update({
      verification_level: input.level,
      status: "approved",
      admin_notes: input.adminNotes ?? null,
      verified_at: now,
      updated_at: now,
    })
    .eq("id", input.profileId);

  const tableMap: Record<string, string> = {
    visa_agent: "visa_experts",
    travel_agency: "agencies",
    tour_guide: "tour_guides",
    property_host: "property_hosts",
  };
  const table = tableMap[profile.provider_role];
  if (table) {
    await admin
      .from(table)
      .update({ verification_status: "verified", verified_at: now })
      .eq("user_id", profile.user_id);
  }

  if (profile.provider_role === "visa_agent") {
    await admin
      .from("travel_agent_profiles")
      .update({ verification_status: "verified", verified_at: now })
      .eq("user_id", profile.user_id);
  }

  const { sendProviderApprovalNotification } = await import("@/lib/provider-acquisition/emails");
  const { data: userProfile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", profile.user_id)
    .maybeSingle();

  if (userProfile) {
    const p = userProfile as { email: string; full_name: string };
    sendProviderApprovalNotification({
      to: p.email,
      userId: profile.user_id,
      providerRole: profile.provider_role as import("@/lib/provider-acquisition/types").ProviderAcquisitionRole,
      fullName: p.full_name,
    });
  }

  recalculateReputationForUser(profile.user_id, profile.provider_role);
  return { ok: true };
}

export async function adminRevokeVerification(
  profileId: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: row } = await admin
    .from("provider_verification_profiles")
    .select("user_id, provider_role")
    .eq("id", profileId)
    .maybeSingle();

  if (!row) return { ok: false, error: "Profile not found." };

  const profile = row as { user_id: string; provider_role: string };
  const now = new Date().toISOString();

  await admin
    .from("provider_verification_profiles")
    .update({
      verification_level: "basic",
      status: "revoked",
      revoked_at: now,
      admin_notes: reason ?? null,
      updated_at: now,
    })
    .eq("id", profileId);

  recalculateReputationForUser(profile.user_id, profile.provider_role);
  return { ok: true };
}

export async function adminSuspendProvider(
  profileId: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: row } = await admin
    .from("provider_verification_profiles")
    .select("user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (!row) return { ok: false, error: "Profile not found." };

  const userId = (row as { user_id: string }).user_id;
  const now = new Date().toISOString();

  await admin
    .from("provider_verification_profiles")
    .update({ status: "suspended", suspended_at: now, admin_notes: reason ?? null, updated_at: now })
    .eq("id", profileId);

  await admin.from("profiles").update({ is_active: false }).eq("id", userId);

  return { ok: true };
}

export async function adminRejectVerification(
  profileId: string,
  reason?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  await admin
    .from("provider_verification_profiles")
    .update({ status: "rejected", admin_notes: reason ?? null, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  return { ok: true };
}
