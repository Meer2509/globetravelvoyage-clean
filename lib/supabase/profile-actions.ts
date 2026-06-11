"use server";

import { createAdminClient } from "./admin";
import { parseCommaList } from "./profile-utils";
import { isVisaExpertRole } from "@/lib/auth";
import {
  ensureProfileForUserId,
  ensureUserProfile,
  upsertVisaExpertForProfile,
} from "./ensure-user-profile";
import type { UserRole } from "./types";

export type ProfileActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; demo?: boolean };

export interface SignupProfileInput {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  country?: string;
  city?: string;
  role: UserRole;
  companyName?: string;
  businessType?: string;
  specializations?: string[];
  bio?: string;
}

export interface ProfileUpdateInput {
  fullName: string;
  phone?: string;
  country?: string;
  city?: string;
  companyName?: string;
  businessType?: string;
  bio?: string;
  languages?: string;
  specializations?: string;
  yearsExperience?: string;
}

function adminOrFail(): ReturnType<typeof createAdminClient> | null {
  return createAdminClient();
}

export async function saveProfileOnSignup(input: SignupProfileInput): Promise<ProfileActionResult> {
  const admin = adminOrFail();
  if (!admin) return { ok: false, error: "Supabase is not configured.", demo: true };

  const profileResult = await ensureProfileForUserId(input.userId, input.email, {
    fullName: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    country: input.country ?? null,
    city: input.city ?? null,
    role: input.role,
    companyName: input.companyName ?? null,
    businessType: input.businessType ?? input.role,
    bio: input.bio ?? null,
  });

  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  await admin.from("user_roles").delete().eq("user_id", input.userId).eq("is_primary", true);
  const { error: roleError } = await admin.from("user_roles").upsert(
    { user_id: input.userId, role: input.role, is_primary: true },
    { onConflict: "user_id,role" }
  );
  if (roleError) return { ok: false, error: roleError.message };

  await admin.auth.admin.updateUserById(input.userId, {
    user_metadata: { role: input.role, full_name: input.fullName },
  });

  if (isVisaExpertRole(input.role)) {
    const expertResult = await upsertVisaExpertForProfile(profileResult.profile, {
      specializations: input.specializations ?? null,
      bio: input.bio ?? null,
    });
    if (!expertResult.ok) return { ok: false, error: expertResult.error };
  }

  return { ok: true };
}

export async function updateUserProfile(input: ProfileUpdateInput): Promise<ProfileActionResult> {
  const admin = adminOrFail();
  if (!admin) return { ok: false, error: "Supabase is not configured.", demo: true };

  const profileResult = await ensureUserProfile({
    fullName: input.fullName,
    phone: input.phone ?? null,
    country: input.country ?? null,
    city: input.city ?? null,
    companyName: input.companyName ?? null,
    businessType: input.businessType ?? null,
    bio: input.bio ?? null,
  });

  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  const { profile } = profileResult;

  if (isVisaExpertRole(profile.role)) {
    const languages = input.languages ? parseCommaList(input.languages) : undefined;
    const specializations = input.specializations ? parseCommaList(input.specializations) : undefined;
    const years = input.yearsExperience ? parseInt(input.yearsExperience, 10) : null;

    const expertResult = await upsertVisaExpertForProfile(profile, {
      languages,
      specializations,
      bio: input.bio ?? null,
      years_experience: Number.isFinite(years) ? years : null,
    });

    if (!expertResult.ok) return { ok: false, error: expertResult.error };
  }

  await admin.auth.admin.updateUserById(profile.id, {
    user_metadata: { full_name: input.fullName, role: profile.role },
  });

  return { ok: true };
}
