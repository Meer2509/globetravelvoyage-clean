import { parseExpertServices } from "@/lib/expert-services";
import type { UserRole, VisaExpert } from "./types";

export interface ProfileFields {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  company_name?: string | null;
  business_type?: string | null;
  bio?: string | null;
}

export interface VisaExpertFields {
  languages?: string[] | null;
  specializations?: string[] | null;
  services?: string[] | null;
  bio?: string | null;
  years_experience?: number | null;
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "GT";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinCommaList(values: string[] | null | undefined): string {
  return values?.join(", ") ?? "";
}

/** True only when a whole table/relation is missing — not column or permission errors. */
export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  const lower = msg.toLowerCase();

  if (error.code === "42P01" || error.code === "PGRST205") return true;
  if (/relation .+ does not exist/i.test(msg)) return true;
  if (lower.includes("could not find the table") && lower.includes("schema cache")) return true;

  return false;
}

/** @deprecated Use isMissingTableError — kept for gradual migration */
export function isDatabaseSetupError(error: { code?: string; message?: string } | null): boolean {
  return isMissingTableError(error);
}

export function computeProfileCompletion(
  profile: ProfileFields,
  role: UserRole,
  visaExpert?: VisaExpertFields | null
): { percent: number; missing: string[] } {
  const checks: { label: string; done: boolean }[] = [
    { label: "Full name", done: Boolean(profile.full_name?.trim()) },
    { label: "Email", done: Boolean(profile.email?.trim()) },
    { label: "Phone", done: Boolean(profile.phone?.trim()) },
    { label: "Country", done: Boolean(profile.country?.trim()) },
    { label: "City", done: Boolean(profile.city?.trim()) },
  ];

  if (role === "travel_agency" || role === "property_host" || role === "tour_guide") {
    checks.push({ label: "Company / business name", done: Boolean(profile.company_name?.trim()) });
  }

  if (role === "visa_agent") {
    checks.push(
      { label: "Specializations", done: Boolean(visaExpert?.specializations?.length) },
      { label: "Languages", done: Boolean(visaExpert?.languages?.length) },
      {
        label: "Services",
        done: Boolean(
          parseExpertServices(visaExpert?.services).length ||
          visaExpert?.services?.some((s) => s.trim() && !s.startsWith("gtv-service:"))
        ),
      },
      { label: "Professional bio", done: Boolean(visaExpert?.bio?.trim() || profile.bio?.trim()) }
    );
  } else {
    checks.push({ label: "Bio", done: Boolean(profile.bio?.trim()) });
  }

  const done = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  const percent = checks.length ? Math.round((done / checks.length) * 100) : 0;

  return { percent, missing };
}
