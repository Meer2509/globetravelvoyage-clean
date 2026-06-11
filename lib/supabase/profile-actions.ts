"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { parseCommaList } from "./profile-utils";
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
  services?: string;
  yearsExperience?: string;
}

function adminOrFail(): ReturnType<typeof createAdminClient> | null {
  return createAdminClient();
}

export async function saveProfileOnSignup(input: SignupProfileInput): Promise<ProfileActionResult> {
  const admin = adminOrFail();
  if (!admin) return { ok: false, error: "Supabase is not configured.", demo: true };

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: input.userId,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      role: input.role,
      company_name: input.companyName ?? null,
      business_type: input.businessType ?? input.role,
    },
    { onConflict: "id" }
  );

  if (profileError) return { ok: false, error: profileError.message };

  await admin.from("user_roles").delete().eq("user_id", input.userId).eq("is_primary", true);
  const { error: roleError } = await admin.from("user_roles").upsert(
    { user_id: input.userId, role: input.role, is_primary: true },
    { onConflict: "user_id,role" }
  );
  if (roleError) return { ok: false, error: roleError.message };

  await admin.auth.admin.updateUserById(input.userId, {
    user_metadata: { role: input.role, full_name: input.fullName },
  });

  if (input.role === "visa_agent") {
    const { data: existing } = await admin
      .from("visa_experts")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();

    const expertPayload = {
      user_id: input.userId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      specializations: input.specializations ?? null,
      bio: input.bio ?? null,
      verification_status: "pending" as const,
    };

    if (existing) {
      await admin.from("visa_experts").update(expertPayload).eq("user_id", input.userId);
    } else {
      await admin.from("visa_experts").insert(expertPayload);
    }
  }

  return { ok: true };
}

export async function updateUserProfile(input: ProfileUpdateInput): Promise<ProfileActionResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured.", demo: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to update your profile." };

  const admin = adminOrFail();
  if (!admin) return { ok: false, error: "Supabase is not configured.", demo: true };

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      company_name: input.companyName ?? null,
      business_type: input.businessType ?? null,
      bio: input.bio ?? null,
    })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  const roleRes = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const role = (roleRes.data as { role: UserRole } | null)?.role
    ?? (user.user_metadata?.role as UserRole | undefined)
    ?? "customer";

  if (role === "visa_agent") {
    {
      const languages = input.languages ? parseCommaList(input.languages) : null;
      const specializations = input.specializations ? parseCommaList(input.specializations) : null;
      const services = input.services ? parseCommaList(input.services) : null;
      const years = input.yearsExperience ? parseInt(input.yearsExperience, 10) : null;

      const { data: existing } = await admin
        .from("visa_experts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const expertPayload = {
        user_id: user.id,
        full_name: input.fullName,
        email: user.email ?? null,
        phone: input.phone ?? null,
        country: input.country ?? null,
        city: input.city ?? null,
        languages,
        specializations,
        services,
        bio: input.bio ?? null,
        years_experience: Number.isFinite(years) ? years : null,
      };

      if (existing) {
        await admin.from("visa_experts").update(expertPayload).eq("user_id", user.id);
      } else {
        await admin.from("visa_experts").insert({
          ...expertPayload,
          verification_status: "pending",
        });
      }
    }
  }

  return { ok: true };
}
