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
  nationality?: string | null;
  passportCountry?: string | null;
  preferredCurrency?: string | null;
  preferredLanguage?: string | null;
  travelInterests?: string[] | null;
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
    .select(
      "id, email, full_name, phone, country, city, role, bio, company_name, business_type, nationality, passport_country, preferred_currency, preferred_language, travel_interests"
    )
    .eq("id", userId)
    .maybeSingle();

  const existingProfile = existing as (EnsuredProfile & {
    nationality: string | null;
    passport_country: string | null;
    preferred_currency: string | null;
    preferred_language: string | null;
    travel_interests: string[] | null;
  }) | null;
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
    nationality:
      fields.nationality !== undefined ? fields.nationality : existingProfile?.nationality ?? null,
    passport_country:
      fields.passportCountry !== undefined
        ? fields.passportCountry
        : existingProfile?.passport_country ?? null,
    preferred_currency:
      fields.preferredCurrency !== undefined
        ? fields.preferredCurrency
        : existingProfile?.preferred_currency ?? "USD",
    preferred_language:
      fields.preferredLanguage !== undefined
        ? fields.preferredLanguage
        : existingProfile?.preferred_language ?? "en",
    travel_interests:
      fields.travelInterests !== undefined
        ? fields.travelInterests
        : existingProfile?.travel_interests ?? null,
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

export interface AgencyInput {
  agency_name: string;
  website?: string | null;
  description?: string | null;
  founded_year?: number | null;
  team_size?: string | null;
  services?: string[] | null;
  top_destinations?: string[] | null;
  annual_bookings?: string | null;
  license_number?: string | null;
  registration_country?: string | null;
  iata_number?: string | null;
}

export async function upsertAgencyForProfile(
  profile: EnsuredProfile,
  agency: AgencyInput
): Promise<{ ok: true; agencyId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing, error: existingError } = await admin
    .from("agencies")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  const payload = {
    user_id: profile.id,
    agency_name: agency.agency_name,
    website: agency.website ?? null,
    description: agency.description ?? null,
    founded_year: agency.founded_year ?? null,
    team_size: agency.team_size ?? null,
    services: agency.services ?? null,
    top_destinations: agency.top_destinations ?? null,
    annual_bookings: agency.annual_bookings ?? null,
    license_number: agency.license_number ?? null,
    registration_country: agency.registration_country ?? null,
    iata_number: agency.iata_number ?? null,
  };

  if (existing) {
    const { error } = await admin.from("agencies").update(payload).eq("user_id", profile.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, agencyId: (existing as { id: string }).id };
  }

  const { data: inserted, error } = await admin
    .from("agencies")
    .insert({ ...payload, verification_status: "pending" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, agencyId: (inserted as { id: string }).id };
}

export interface TourGuideInput {
  guide_city?: string | null;
  guide_country?: string | null;
  languages?: string[] | null;
  tour_categories?: string[] | null;
  max_group_size?: string | null;
  advance_booking?: string | null;
  available_days?: string[] | null;
  start_times?: string[] | null;
}

export async function upsertTourGuideForProfile(
  profile: EnsuredProfile,
  guide: TourGuideInput
): Promise<{ ok: true; guideId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing, error: existingError } = await admin
    .from("tour_guides")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  const payload = {
    user_id: profile.id,
    guide_city: guide.guide_city ?? null,
    guide_country: guide.guide_country ?? null,
    languages: guide.languages ?? null,
    tour_categories: guide.tour_categories ?? null,
    max_group_size: guide.max_group_size ?? null,
    advance_booking: guide.advance_booking ?? null,
    available_days: guide.available_days ?? null,
    start_times: guide.start_times ?? null,
  };

  if (existing) {
    const { error } = await admin.from("tour_guides").update(payload).eq("user_id", profile.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, guideId: (existing as { id: string }).id };
  }

  const { data: inserted, error } = await admin
    .from("tour_guides")
    .insert({ ...payload, verification_status: "pending" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, guideId: (inserted as { id: string }).id };
}

export interface PropertyHostPropertyInput {
  title: string;
  description?: string | null;
  property_type: string;
  listing_type: string;
  city: string;
  country?: string | null;
  neighborhood?: string | null;
  beds?: number | null;
  baths?: number | null;
  max_guests?: number | null;
  sqft?: number | null;
  price_per_night?: number | null;
  price_per_month?: number | null;
  asking_price?: number | null;
  amenities?: string[] | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  min_stay_nights?: number | null;
  pet_friendly?: boolean;
  smoking_allowed?: boolean;
  instant_book?: boolean;
}

export async function upsertPropertyHostForProfile(
  profile: EnsuredProfile,
  property?: PropertyHostPropertyInput
): Promise<{ ok: true; hostId: string; propertyId?: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin client is not configured." };

  const { data: existing, error: existingError } = await admin
    .from("property_hosts")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  let hostId: string;

  if (existing) {
    hostId = (existing as { id: string }).id;
  } else {
    const { data: inserted, error } = await admin
      .from("property_hosts")
      .insert({ user_id: profile.id, verification_status: "pending" })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    hostId = (inserted as { id: string }).id;
  }

  if (!property) return { ok: true, hostId };

  const { data: propertyRow, error: propertyError } = await admin
    .from("properties")
    .insert({
      host_id: hostId,
      title: property.title,
      description: property.description ?? null,
      property_type: property.property_type,
      listing_type: property.listing_type,
      city: property.city,
      country: property.country ?? "Unknown",
      neighborhood: property.neighborhood ?? null,
      beds: property.beds ?? null,
      baths: property.baths ?? null,
      max_guests: property.max_guests ?? null,
      sqft: property.sqft ?? null,
      price_per_night: property.price_per_night ?? null,
      price_per_month: property.price_per_month ?? null,
      asking_price: property.asking_price ?? null,
      amenities: property.amenities ?? null,
      check_in_time: property.check_in_time ?? null,
      check_out_time: property.check_out_time ?? null,
      min_stay_nights: property.min_stay_nights ?? 1,
      pet_friendly: property.pet_friendly ?? false,
      smoking_allowed: property.smoking_allowed ?? false,
      instant_book: property.instant_book ?? true,
      is_active: true,
    })
    .select("id")
    .single();

  if (propertyError) return { ok: false, error: propertyError.message };

  await admin
    .from("property_hosts")
    .update({ total_listings: 1 })
    .eq("id", hostId);

  return { ok: true, hostId, propertyId: (propertyRow as { id: string }).id };
}

