"use server";

import {
  ensureUserProfile,
  upsertAgencyForProfile,
  upsertPropertyHostForProfile,
  upsertTourGuideForProfile,
  upsertVisaExpertForProfile,
} from "./ensure-user-profile";
import { syncUserRole } from "./actions";
import { createAdminClient } from "./admin";
import type { UserRole } from "./types";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { parseCommaList } from "./profile-utils";
import { ensureTravelAgentProfileFromOnboarding } from "./travel-agent-actions";

export type OnboardingResult = { ok: true } | { ok: false; error: string };

function saveError(message?: string): OnboardingResult {
  if (message === "You must be signed in.") return { ok: false, error: message };
  return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };
}

async function syncRole(userId: string, role: UserRole): Promise<OnboardingResult | null> {
  const roleResult = await syncUserRole(userId, role);
  if (!roleResult.ok) return saveError();
  return null;
}

export interface AgentOnboardingInput {
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  yearsExp?: string;
  bio?: string;
  specializations?: string[];
  spokenLanguages?: string[];
  priceFrom?: string;
  priceTo?: string;
  turnaround?: string;
  successRate?: string;
  offersConsultation?: boolean;
  availableOnWeekends?: boolean;
  acceptedDocs?: string[];
}

export async function completeAgentOnboarding(input: AgentOnboardingInput): Promise<OnboardingResult> {
  const profileResult = await ensureUserProfile({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
    role: "visa_agent",
    bio: input.bio ?? null,
  });

  if (!profileResult.ok) return saveError(profileResult.error);

  const roleBlocked = await syncRole(profileResult.profile.id, "visa_agent");
  if (roleBlocked) return roleBlocked;

  const services: string[] = [];
  if (input.priceFrom || input.priceTo) {
    services.push(`Consultation: ${input.priceFrom ?? "—"} – ${input.priceTo ?? "—"}`);
  }
  if (input.turnaround) services.push(`Turnaround: ${input.turnaround}`);
  if (input.successRate) services.push(`Success rate: ${input.successRate}`);
  if (input.offersConsultation) services.push("Offers free consultation");
  if (input.availableOnWeekends) services.push("Weekend availability");
  if (input.acceptedDocs?.length) {
    services.push(`Documents checklist: ${input.acceptedDocs.join(", ")}`);
  }

  const expertResult = await upsertVisaExpertForProfile(profileResult.profile, {
    specializations: input.specializations ?? [],
    languages: input.spokenLanguages ?? [],
    services: services.length ? services : null,
    bio: input.bio ?? null,
    years_experience: input.yearsExp ? parseInt(input.yearsExp, 10) || null : null,
  });

  if (!expertResult.ok) return saveError();

  await ensureTravelAgentProfileFromOnboarding({
    userId: profileResult.profile.id,
    fullName: input.fullName,
    bio: input.bio ?? undefined,
    specialties: input.specializations ?? [],
    countries: input.country ? [input.country] : [],
    languages: input.spokenLanguages ?? [],
    yearsExperience: input.yearsExp ? parseInt(input.yearsExp, 10) || null : null,
  });

  const customerEmail = input.email ?? profileResult.profile.email;
  await notifyIntakeSubmission({
    kind: "provider_application",
    requestId: profileResult.profile.id,
    customerName: input.fullName,
    customerEmail,
    userId: profileResult.profile.id,
    supportSubject: "Visa expert onboarding completed",
    fields: [
      { label: "Provider type", value: "Visa Expert" },
      { label: "Phone", value: input.phone },
      { label: "Country", value: input.country },
      { label: "City", value: input.city },
      { label: "Years of experience", value: input.yearsExp },
      { label: "Specializations", value: input.specializations?.join(", ") },
      { label: "Languages", value: input.spokenLanguages?.join(", ") },
      { label: "Price range", value: `${input.priceFrom ?? "—"} – ${input.priceTo ?? "—"}` },
      { label: "Turnaround", value: input.turnaround },
      { label: "Success rate", value: input.successRate },
      { label: "Bio", value: input.bio },
    ],
  });

  return { ok: true };
}

export interface AgencyOnboardingInput {
  agencyName: string;
  website?: string;
  city?: string;
  country?: string;
  foundedYear?: string;
  teamSize?: string;
  description?: string;
  selectedServices?: string[];
  destinations?: string;
  annualBookings?: string;
  socialMedia?: { instagram?: string; facebook?: string; linkedin?: string };
  licenseNumber?: string;
  registrationCountry?: string;
}

export async function completeAgencyOnboarding(input: AgencyOnboardingInput): Promise<OnboardingResult> {
  const profileResult = await ensureUserProfile({
    fullName: input.agencyName,
    city: input.city ?? null,
    country: input.country ?? null,
    role: "travel_agency",
    companyName: input.agencyName,
    bio: input.description ?? null,
  });

  if (!profileResult.ok) return saveError(profileResult.error);

  const roleBlocked = await syncRole(profileResult.profile.id, "travel_agency");
  if (roleBlocked) return roleBlocked;

  const foundedYear = input.foundedYear ? parseInt(input.foundedYear, 10) : null;
  const socialNotes = [
    input.socialMedia?.instagram ? `Instagram: ${input.socialMedia.instagram}` : null,
    input.socialMedia?.facebook ? `Facebook: ${input.socialMedia.facebook}` : null,
    input.socialMedia?.linkedin ? `LinkedIn: ${input.socialMedia.linkedin}` : null,
  ].filter(Boolean);

  const agencyResult = await upsertAgencyForProfile(profileResult.profile, {
    agency_name: input.agencyName,
    website: input.website ?? null,
    description:
      [input.description, socialNotes.length ? socialNotes.join(" · ") : null].filter(Boolean).join("\n") ||
      null,
    founded_year: Number.isFinite(foundedYear) ? foundedYear : null,
    team_size: input.teamSize ?? null,
    services: input.selectedServices ?? null,
    top_destinations: input.destinations ? parseCommaList(input.destinations) : null,
    annual_bookings: input.annualBookings ?? null,
    license_number: input.licenseNumber ?? null,
    registration_country: input.registrationCountry ?? null,
  });

  if (!agencyResult.ok) return saveError();

  await notifyIntakeSubmission({
    kind: "provider_application",
    requestId: agencyResult.agencyId,
    customerName: input.agencyName,
    customerEmail: profileResult.profile.email,
    userId: profileResult.profile.id,
    supportSubject: "Travel agency onboarding completed",
    fields: [
      { label: "Provider type", value: "Travel Agency" },
      { label: "Website", value: input.website },
      { label: "City", value: input.city },
      { label: "Country", value: input.country },
      { label: "Founded", value: input.foundedYear },
      { label: "Team size", value: input.teamSize },
      { label: "Services", value: input.selectedServices?.join(", ") },
      { label: "Destinations", value: input.destinations },
      { label: "Annual bookings", value: input.annualBookings },
      { label: "License", value: input.licenseNumber },
      { label: "Registration country", value: input.registrationCountry },
      { label: "Description", value: input.description },
    ],
  });

  return { ok: true };
}

export interface GuideTourInput {
  title: string;
  duration?: string;
  price?: string;
}

export interface GuideOnboardingInput {
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  languages?: string[];
  bio?: string;
  categories?: string[];
  tours?: GuideTourInput[];
  groupSize?: string;
  availableDays?: string[];
  startTime?: string;
  advanceBooking?: string;
}

export async function completeGuideOnboarding(input: GuideOnboardingInput): Promise<OnboardingResult> {
  const profileResult = await ensureUserProfile({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
    role: "tour_guide",
    bio: input.bio ?? null,
  });

  if (!profileResult.ok) return saveError(profileResult.error);

  const roleBlocked = await syncRole(profileResult.profile.id, "tour_guide");
  if (roleBlocked) return roleBlocked;

  const guideResult = await upsertTourGuideForProfile(profileResult.profile, {
    guide_city: input.city ?? null,
    guide_country: input.country ?? null,
    languages: input.languages ?? null,
    tour_categories: input.categories ?? null,
    max_group_size: input.groupSize ?? null,
    advance_booking: input.advanceBooking ?? null,
    available_days: input.availableDays ?? null,
    start_times: input.startTime ? [input.startTime] : null,
  });

  if (!guideResult.ok) return saveError();

  const admin = createAdminClient();
  if (!admin) return saveError();

  const tours = (input.tours ?? []).filter((t) => t.title.trim());
  for (const tour of tours) {
    const price = tour.price ? parseFloat(tour.price) : null;
    const { error } = await admin.from("tours").insert({
      guide_id: guideResult.guideId,
      title: tour.title,
      description: input.bio ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      categories: input.categories ?? null,
      duration_text: tour.duration ?? null,
      price_per_person: Number.isFinite(price) ? price : 0,
      max_group_size: parseInt(input.groupSize ?? "", 10) || null,
      languages: input.languages ?? null,
      is_active: true,
    });
    if (error) return saveError();
  }

  const customerEmail = input.email ?? profileResult.profile.email;
  await notifyIntakeSubmission({
    kind: "provider_application",
    requestId: guideResult.guideId,
    customerName: input.fullName,
    customerEmail,
    userId: profileResult.profile.id,
    supportSubject: "Tour guide onboarding completed",
    fields: [
      { label: "Provider type", value: "Tour Guide" },
      { label: "City", value: input.city },
      { label: "Country", value: input.country },
      { label: "Languages", value: input.languages?.join(", ") },
      { label: "Categories", value: input.categories?.join(", ") },
      { label: "Tours", value: tours.map((t) => t.title).join(", ") },
      { label: "Group size", value: input.groupSize },
      { label: "Available days", value: input.availableDays?.join(", ") },
      { label: "Start time", value: input.startTime },
      { label: "Advance booking", value: input.advanceBooking },
      { label: "Bio", value: input.bio },
    ],
  });

  return { ok: true };
}

export interface HostOnboardingInput {
  propertyType: string;
  listingType: string;
  title: string;
  city: string;
  country?: string;
  neighborhood?: string;
  beds?: string;
  baths?: string;
  maxGuests?: string;
  sqft?: string;
  pricePerNight?: string;
  pricePerMonth?: string;
  askingPrice?: string;
  description?: string;
  selectedAmenities?: string[];
  checkIn?: string;
  checkOut?: string;
  minStay?: string;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  instantBook?: boolean;
}

function mapPropertyType(value: string): string {
  if (value === "hotel") return "hotel_room";
  return value || "other";
}

function mapListingType(value: string): string {
  if (value === "short") return "short_stay";
  if (value === "long") return "long_term";
  if (value === "sell") return "for_sale";
  return value || "short_stay";
}

function parseMinStay(value?: string): number {
  if (!value) return 1;
  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

function parseOptionalInt(value?: string): number | null {
  if (!value) return null;
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalFloat(value?: string): number | null {
  if (!value) return null;
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function completeHostOnboarding(input: HostOnboardingInput): Promise<OnboardingResult> {
  const profileResult = await ensureUserProfile({
    city: input.city ?? null,
    country: input.country ?? null,
    role: "property_host",
  });

  if (!profileResult.ok) return saveError(profileResult.error);

  const roleBlocked = await syncRole(profileResult.profile.id, "property_host");
  if (roleBlocked) return roleBlocked;

  const listingType = mapListingType(input.listingType);
  const hostResult = await upsertPropertyHostForProfile(profileResult.profile, {
    title: input.title,
    description: input.description ?? null,
    property_type: mapPropertyType(input.propertyType),
    listing_type: listingType,
    city: input.city,
    country: input.country ?? null,
    neighborhood: input.neighborhood ?? null,
    beds: parseOptionalInt(input.beds),
    baths: parseOptionalInt(input.baths),
    max_guests: parseOptionalInt(input.maxGuests),
    sqft: parseOptionalInt(input.sqft),
    price_per_night: listingType !== "for_sale" ? parseOptionalFloat(input.pricePerNight) : null,
    price_per_month: parseOptionalFloat(input.pricePerMonth),
    asking_price: listingType === "for_sale" ? parseOptionalFloat(input.askingPrice ?? input.pricePerNight) : null,
    amenities: input.selectedAmenities ?? null,
    check_in_time: input.checkIn ?? null,
    check_out_time: input.checkOut ?? null,
    min_stay_nights: parseMinStay(input.minStay),
    pet_friendly: input.petFriendly ?? false,
    smoking_allowed: input.smokingAllowed ?? false,
    instant_book: input.instantBook ?? true,
  });

  if (!hostResult.ok) return saveError();

  await notifyIntakeSubmission({
    kind: "provider_application",
    requestId: hostResult.propertyId ?? hostResult.hostId,
    customerName: profileResult.profile.full_name ?? "Property Host",
    customerEmail: profileResult.profile.email,
    userId: profileResult.profile.id,
    supportSubject: "Property host onboarding completed",
    fields: [
      { label: "Provider type", value: "Property Host" },
      { label: "Listing title", value: input.title },
      { label: "Property type", value: input.propertyType },
      { label: "Listing type", value: input.listingType },
      { label: "City", value: input.city },
      { label: "Country", value: input.country },
      { label: "Neighborhood", value: input.neighborhood },
      { label: "Beds", value: input.beds },
      { label: "Baths", value: input.baths },
      { label: "Max guests", value: input.maxGuests },
      { label: "Price per night", value: input.pricePerNight },
      { label: "Asking price", value: input.askingPrice },
      { label: "Amenities", value: input.selectedAmenities?.join(", ") },
      { label: "Description", value: input.description },
    ],
  });

  return { ok: true };
}

export interface CustomerOnboardingInput {
  nationality?: string;
  passportCountry?: string;
  basedIn?: string;
  currency?: string;
  selectedInterests?: string[];
  travelFreq?: string;
  groupType?: string;
  budgetRange?: string;
  visaCountries?: string[];
  notifications?: boolean;
  aiSuggestions?: boolean;
  language?: string;
}

export async function completeCustomerOnboarding(input: CustomerOnboardingInput): Promise<OnboardingResult> {
  const profileResult = await ensureUserProfile({
    role: "customer",
    nationality: input.nationality ?? null,
    passportCountry: input.passportCountry ?? null,
    preferredCurrency: input.currency ?? "USD",
    preferredLanguage: input.language ?? "en",
    travelInterests: input.selectedInterests ?? null,
    city: input.basedIn ?? null,
  });

  if (!profileResult.ok) return saveError(profileResult.error);

  const roleBlocked = await syncRole(profileResult.profile.id, "customer");
  if (roleBlocked) return roleBlocked;

  const admin = createAdminClient();
  if (admin) {
    await admin.auth.admin.updateUserById(profileResult.profile.id, {
      user_metadata: {
        onboarding_preferences: {
          travel_freq: input.travelFreq ?? null,
          group_type: input.groupType ?? null,
          budget_range: input.budgetRange ?? null,
          visa_countries: input.visaCountries ?? [],
          notifications: input.notifications ?? true,
          ai_suggestions: input.aiSuggestions ?? true,
        },
      },
    });
  }

  return { ok: true };
}
