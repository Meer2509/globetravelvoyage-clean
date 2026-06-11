"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { normalizeUserRole } from "@/lib/auth";
import type { UserRole } from "./types";

export interface EnsuredProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  role: UserRole;
  bio: string | null;
  company_name: string | null;
  business_type: string | null;
}

export interface EnsureProfileInput {
  fullName?: string;
  email?: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  role?: UserRole | string;
  companyName?: string | null;
  businessType?: string | null;
  bio?: string | null;
}

export interface VisaExpertInput {
  specializations?: string[] | null;
  languages?: string[] | null;
  services?: string[] | null;
  bio?: string | null;
  years_experience?: number | null;
}

export type EnsureProfileResult =
  | { ok: true; profile: EnsuredProfile }
  | { ok: false; error: string };

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

async function resolveRole(
  admin: AdminClient,
  userId: string,
  metadataRole: unknown,
  explicitRole?: UserRole | string
): Promise<UserRole> {
  if (explicitRole) return normalizeUserRole(explicitRole);

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (roleRow) return normalizeUserRole((roleRow as { role: string }).role);

  const { data: profileRow } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileRow) return normalizeUserRole((profileRow as { role: string | null }).role);

  return normalizeUserRole(metadataRole as string | undefined);
}

export async function ensureProfileForUserId(
  userId: string,
  email: string,
  fields: EnsureProfileInput = {}
): Promise<EnsureProfileResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing } = await admin
    .from("profiles")
    .select("id, email, full_name, phone, country, city, role, bio, company_name, business_type")
    .eq("id", userId)
    .maybeSingle();

  const existingProfile = existing as EnsuredProfile | null;
  const role = await resolveRole(admin, userId, undefined, fields.role);

  const payload = {
    id: userId,
    email: fields.email ?? email ?? existingProfile?.email ?? "",
    full_name:
      fields.fullName ??
      existingProfile?.full_name ??
      null,
    phone: fields.phone !== undefined ? fields.phone : existingProfile?.phone ?? null,
    country: fields.country !== undefined ? fields.country : existingProfile?.country ?? null,
    city: fields.city !== undefined ? fields.city : existingProfile?.city ?? null,
    role,
    company_name:
      fields.companyName !== undefined ? fields.companyName : existingProfile?.company_name ?? null,
    business_type:
      fields.businessType !== undefined ? fields.businessType : existingProfile?.business_type ?? null,
    bio: fields.bio !== undefined ? fields.bio : existingProfile?.bio ?? null,
  };

  const { data: upserted, error } = await admin
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, full_name, phone, country, city, role, bio, company_name, business_type")
    .single();

  if (error) return { ok: false, error: error.message };
  if (!upserted) return { ok: false, error: "Profile upsert did not return a row." };

  const profile = upserted as EnsuredProfile;
  return {
    ok: true,
    profile: {
      ...profile,
      role: normalizeUserRole(profile.role),
    },
  };
}

/**
 * Ensures a profiles row exists for the current auth user before any role-specific writes.
 */
export async function ensureUserProfile(fields: EnsureProfileInput = {}): Promise<EnsureProfileResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const role = await resolveRole(admin, user.id, user.user_metadata?.role, fields.role);

  return ensureProfileForUserId(user.id, user.email ?? "", {
    ...fields,
    role,
    fullName: fields.fullName ?? (user.user_metadata?.full_name as string | undefined),
    email: fields.email ?? user.email ?? undefined,
  });
}

export async function upsertVisaExpertForProfile(
  profile: EnsuredProfile,
  expert: VisaExpertInput = {}
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing, error: existingError } = await admin
    .from("visa_experts")
    .select("id, services, specializations, languages, bio, years_experience")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  const current = existing as {
    id: string;
    services: string[] | null;
    specializations: string[] | null;
    languages: string[] | null;
    bio: string | null;
    years_experience: number | null;
  } | null;

  const expertPayload = {
    user_id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    country: profile.country,
    city: profile.city,
    specializations:
      expert.specializations !== undefined ? expert.specializations : current?.specializations ?? null,
    languages: expert.languages !== undefined ? expert.languages : current?.languages ?? null,
    services: expert.services !== undefined ? expert.services : current?.services ?? null,
    bio: expert.bio !== undefined ? expert.bio : profile.bio ?? current?.bio ?? null,
    years_experience:
      expert.years_experience !== undefined
        ? expert.years_experience
        : current?.years_experience ?? null,
  };

  if (current) {
    const { error } = await admin.from("visa_experts").update(expertPayload).eq("user_id", profile.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("visa_experts").insert({
      ...expertPayload,
      verification_status: "pending",
    });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

