"use server";

import { createAdminClient } from "./admin";
import { createServerSupabaseClient } from "./server";
import { requireAdmin, requireSession } from "@/lib/auth-server";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logAdminAudit } from "@/lib/admin/phase1-actions";
import { parseCommaList } from "./profile-utils";
import {
  PUBLIC_TRAVEL_AGENT_STATUS,
  TRAVEL_AGENT_PROFILE_SELECT,
  TRAVEL_AGENT_SERVICE_SELECT,
  type TravelAgentInquiryRow,
  type TravelAgentProfileRow,
  type TravelAgentServiceRow,
} from "./travel-agent-types";

export type TravelAgentActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function adminDb() {
  return createAdminClient();
}

function normalizeProfile(row: Record<string, unknown>): TravelAgentProfileRow {
  return {
    ...(row as TravelAgentProfileRow),
    specialties: (row.specialties as string[]) ?? [],
    countries_served: (row.countries_served as string[]) ?? [],
    languages: (row.languages as string[]) ?? [],
    featured: Boolean(row.featured),
    is_active: row.is_active !== false,
    rating: row.rating != null ? Number(row.rating) : 0,
    review_count: row.review_count != null ? Number(row.review_count) : 0,
  };
}

async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ── Public marketplace ──────────────────────────────────────────────────────

export async function fetchVerifiedTravelAgents(): Promise<TravelAgentProfileRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  const { data, error } = await admin
    .from("travel_agent_profiles")
    .select(TRAVEL_AGENT_PROFILE_SELECT)
    .eq("verification_status", PUBLIC_TRAVEL_AGENT_STATUS)
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[travel-agents] fetch verified failed", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeProfile(row as Record<string, unknown>));
}

export async function fetchVerifiedTravelAgentById(
  id: string
): Promise<TravelAgentProfileRow | null> {
  const admin = adminDb();
  if (!admin) return null;

  const { data, error } = await admin
    .from("travel_agent_profiles")
    .select(TRAVEL_AGENT_PROFILE_SELECT)
    .eq("id", id)
    .eq("verification_status", PUBLIC_TRAVEL_AGENT_STATUS)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeProfile(data as Record<string, unknown>);
}

export async function fetchTravelAgentServices(
  profileId: string,
  activeOnly = true
): Promise<TravelAgentServiceRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  let query = admin
    .from("travel_agent_services")
    .select(TRAVEL_AGENT_SERVICE_SELECT)
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as TravelAgentServiceRow[];
}

// ── Agent dashboard ───────────────────────────────────────────────────────────

export async function fetchMyTravelAgentProfile(): Promise<{
  profile: TravelAgentProfileRow | null;
  error?: string;
}> {
  const session = await requireSession();
  if (!session.ok) return { profile: null, error: session.error };

  const admin = adminDb();
  if (!admin) return { profile: null, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("travel_agent_profiles")
    .select(TRAVEL_AGENT_PROFILE_SELECT)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  if (!data) return { profile: null };
  return { profile: normalizeProfile(data as Record<string, unknown>) };
}

export async function upsertMyTravelAgentProfile(input: {
  agencyName?: string;
  fullName: string;
  bio?: string;
  specialties?: string;
  countriesServed?: string;
  languages?: string;
  yearsExperience?: string;
  profilePhoto?: string;
}): Promise<TravelAgentActionResult> {
  const session = await requireSession();
  if (!session.ok) return { ok: false, error: session.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const payload = {
    user_id: session.userId,
    agency_name: input.agencyName?.trim() || null,
    full_name: input.fullName.trim(),
    bio: input.bio?.trim() || null,
    specialties: parseCommaList(input.specialties ?? ""),
    countries_served: parseCommaList(input.countriesServed ?? ""),
    languages: parseCommaList(input.languages ?? ""),
    years_experience: input.yearsExperience
      ? parseInt(input.yearsExperience, 10) || null
      : null,
    profile_photo: input.profilePhoto?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from("travel_agent_profiles")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("travel_agent_profiles")
      .update(payload)
      .eq("user_id", session.userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: (existing as { id: string }).id } };
  }

  const { data, error } = await admin
    .from("travel_agent_profiles")
    .insert({
      ...payload,
      verification_status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function ensureTravelAgentProfileFromOnboarding(input: {
  userId: string;
  fullName: string;
  agencyName?: string;
  bio?: string;
  specialties?: string[];
  countries?: string[];
  languages?: string[];
  yearsExperience?: number | null;
}): Promise<void> {
  const admin = adminDb();
  if (!admin) return;

  const { data: existing } = await admin
    .from("travel_agent_profiles")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();

  const payload = {
    user_id: input.userId,
    full_name: input.fullName,
    agency_name: input.agencyName ?? null,
    bio: input.bio ?? null,
    specialties: input.specialties ?? [],
    countries_served: input.countries ?? [],
    languages: input.languages ?? [],
    years_experience: input.yearsExperience ?? null,
    verification_status: "pending",
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await admin.from("travel_agent_profiles").update(payload).eq("user_id", input.userId);
    return;
  }

  await admin.from("travel_agent_profiles").insert(payload);
}

export async function saveTravelAgentService(input: {
  id?: string;
  title: string;
  description?: string;
  price?: string;
  priceUnit?: string;
  isActive?: boolean;
}): Promise<TravelAgentActionResult> {
  const session = await requireSession();
  if (!session.ok) return { ok: false, error: session.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { profile } = await fetchMyTravelAgentProfile();
  if (!profile) {
    return { ok: false, error: "Create your travel agent profile first." };
  }

  const row = {
    profile_id: profile.id,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    price: input.price ? parseFloat(input.price.replace(/[^0-9.]/g, "")) || null : null,
    price_unit: input.priceUnit?.trim() || "quote",
    is_active: input.isActive !== false,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await admin
      .from("travel_agent_services")
      .update(row)
      .eq("id", input.id)
      .eq("profile_id", profile.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: input.id } };
  }

  const { data, error } = await admin
    .from("travel_agent_services")
    .insert(row)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function deleteTravelAgentService(serviceId: string): Promise<TravelAgentActionResult> {
  const session = await requireSession();
  if (!session.ok) return { ok: false, error: session.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const { profile } = await fetchMyTravelAgentProfile();
  if (!profile) return { ok: false, error: "Profile not found." };

  const { error } = await admin
    .from("travel_agent_services")
    .delete()
    .eq("id", serviceId)
    .eq("profile_id", profile.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: serviceId } };
}

export async function fetchMyTravelAgentInquiries(): Promise<TravelAgentInquiryRow[]> {
  const session = await requireSession();
  if (!session.ok) return [];

  const admin = adminDb();
  if (!admin) return [];

  const { profile } = await fetchMyTravelAgentProfile();
  if (!profile) return [];

  const { data } = await admin
    .from("travel_agent_inquiries")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []) as TravelAgentInquiryRow[];
}

export async function fetchMyTravelAgentServices(): Promise<TravelAgentServiceRow[]> {
  const { profile } = await fetchMyTravelAgentProfile();
  if (!profile) return [];
  return fetchTravelAgentServices(profile.id, false);
}

// ── Customer inquiry ──────────────────────────────────────────────────────────

export async function submitTravelAgentInquiry(input: {
  profileId: string;
  serviceId?: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<TravelAgentActionResult> {
  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const userId = await getOptionalUserId();
  const rateBlocked = await enforceRateLimit("form", userId);
  if (!rateBlocked.ok) return { ok: false, error: rateBlocked.error };

  const { data: profile } = await admin
    .from("travel_agent_profiles")
    .select("id, full_name, agency_name, verification_status")
    .eq("id", input.profileId)
    .eq("verification_status", PUBLIC_TRAVEL_AGENT_STATUS)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) return { ok: false, error: "This travel agent is not available." };

  const { data, error } = await admin
    .from("travel_agent_inquiries")
    .insert({
      profile_id: input.profileId,
      user_id: userId,
      service_id: input.serviceId ?? null,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      message: input.message.trim(),
      status: "new",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const agent = profile as { full_name: string; agency_name: string | null };
  const agentLabel = agent.agency_name
    ? `${agent.full_name} (${agent.agency_name})`
    : agent.full_name;

  notifyIntakeSubmission({
    kind: "contact",
    requestId: data.id,
    customerName: input.fullName,
    customerEmail: input.email,
    userId,
    supportSubject: `Travel agent inquiry: ${agentLabel}`,
    fields: [
      { label: "Agent", value: agentLabel },
      { label: "Phone", value: input.phone ?? "—" },
      { label: "Message", value: input.message },
    ],
  }).catch((e) => console.error("[travel-agent-inquiry] email failed", e));

  return { ok: true, data: { id: data.id } };
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAllTravelAgentProfilesForAdmin(): Promise<{
  rows: TravelAgentProfileRow[];
  error?: string;
}> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("travel_agent_profiles")
    .select(TRAVEL_AGENT_PROFILE_SELECT)
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []).map((row) => normalizeProfile(row as Record<string, unknown>)) };
}

async function adminPatchProfile(
  profileId: string,
  patch: Record<string, unknown>,
  action: string,
  metadata?: Record<string, unknown>
): Promise<TravelAgentActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("travel_agent_profiles")
    .select("id, full_name")
    .eq("id", profileId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Agent not found." };

  const { error } = await admin
    .from("travel_agent_profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action,
    entityType: "travel_agent_profiles",
    entityId: profileId,
    metadata: { name: (existing as { full_name: string }).full_name, ...metadata },
  });

  return { ok: true, data: { id: profileId } };
}

export async function adminApproveTravelAgent(profileId: string): Promise<TravelAgentActionResult> {
  return adminPatchProfile(
    profileId,
    {
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      is_active: true,
    },
    "travel_agent.approve"
  );
}

export async function adminVerifyTravelAgent(profileId: string): Promise<TravelAgentActionResult> {
  return adminApproveTravelAgent(profileId);
}

export async function adminRejectTravelAgent(profileId: string): Promise<TravelAgentActionResult> {
  return adminPatchProfile(
    profileId,
    { verification_status: "rejected", featured: false, is_active: false },
    "travel_agent.reject"
  );
}

export async function adminFeatureTravelAgent(
  profileId: string,
  featured: boolean
): Promise<TravelAgentActionResult> {
  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: profile } = await admin
    .from("travel_agent_profiles")
    .select("verification_status")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) return { ok: false, error: "Agent not found." };
  if (featured && (profile as { verification_status: string }).verification_status !== "verified") {
    return { ok: false, error: "Only verified agents can be featured." };
  }

  return adminPatchProfile(
    profileId,
    { featured },
    featured ? "travel_agent.feature" : "travel_agent.unfeature",
    { featured }
  );
}

export async function adminUpdateTravelAgentNotes(
  profileId: string,
  adminNotes: string
): Promise<TravelAgentActionResult> {
  return adminPatchProfile(
    profileId,
    { admin_notes: adminNotes.trim() || null },
    "travel_agent.notes"
  );
}

export async function adminUpdateTravelAgentStatus(
  profileId: string,
  verificationStatus: string
): Promise<TravelAgentActionResult> {
  const patch: Record<string, unknown> = { verification_status: verificationStatus };
  if (verificationStatus === "verified") {
    patch.verified_at = new Date().toISOString();
    patch.is_active = true;
  } else if (verificationStatus === "rejected") {
    patch.featured = false;
    patch.is_active = false;
  } else if (verificationStatus !== "verified") {
    patch.featured = false;
  }
  return adminPatchProfile(profileId, patch, "travel_agent.status", { verificationStatus });
}

export async function fetchTravelAgentInquiriesForAdmin(limit = 100) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("travel_agent_inquiries")
    .select("*, travel_agent_profiles(full_name, agency_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: data ?? [] };
}
