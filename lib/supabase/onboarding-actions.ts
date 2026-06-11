"use server";

import { ensureUserProfile, upsertVisaExpertForProfile } from "./ensure-user-profile";
import { syncUserRole } from "./actions";
import type { UserRole } from "./types";

export type OnboardingResult = { ok: true } | { ok: false; error: string };

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

  if (!profileResult.ok) return { ok: false, error: profileResult.error };

  await syncUserRole(profileResult.profile.id, "visa_agent" as UserRole);

  const services: string[] = [];
  if (input.priceFrom || input.priceTo) {
    services.push(`Consultation: ${input.priceFrom ?? "—"} – ${input.priceTo ?? "—"}`);
  }
  if (input.turnaround) services.push(`Turnaround: ${input.turnaround}`);

  const expertResult = await upsertVisaExpertForProfile(profileResult.profile, {
    specializations: input.specializations ?? [],
    languages: input.spokenLanguages ?? [],
    services: services.length ? services : null,
    bio: input.bio ?? null,
    years_experience: input.yearsExp ? parseInt(input.yearsExp, 10) || null : null,
  });

  if (!expertResult.ok) return { ok: false, error: expertResult.error };
  return { ok: true };
}
