import type { UserRole } from "@/lib/supabase/types";

export type ProviderAcquisitionRole = Extract<
  UserRole,
  "visa_agent" | "travel_agency" | "tour_guide" | "property_host"
>;

export type ProviderReferralStatus =
  | "pending"
  | "registered"
  | "onboarded"
  | "verified"
  | "rewarded";

export const PROVIDER_REFERRAL_REWARD_USD = 50;

export const PROVIDER_ONBOARDING_STEPS: Record<
  ProviderAcquisitionRole,
  Array<{ key: string; label: string }>
> = {
  visa_agent: [
    { key: "account_created", label: "Account created" },
    { key: "profile", label: "Professional profile" },
    { key: "services", label: "Services & pricing" },
    { key: "documents", label: "Documents" },
    { key: "submitted", label: "Application submitted" },
  ],
  travel_agency: [
    { key: "account_created", label: "Account created" },
    { key: "business", label: "Business info" },
    { key: "services", label: "Services" },
    { key: "verification", label: "Verification" },
    { key: "submitted", label: "Application submitted" },
  ],
  tour_guide: [
    { key: "account_created", label: "Account created" },
    { key: "profile", label: "Guide profile" },
    { key: "tours", label: "Tours & experiences" },
    { key: "availability", label: "Availability" },
    { key: "submitted", label: "Application submitted" },
  ],
  property_host: [
    { key: "account_created", label: "Account created" },
    { key: "property", label: "Property basics" },
    { key: "details", label: "Details & amenities" },
    { key: "policies", label: "Policies" },
    { key: "submitted", label: "Application submitted" },
  ],
};

export interface ProviderOnboardingState {
  providerRole: ProviderAcquisitionRole;
  steps: Record<string, boolean>;
  completionScore: number;
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}

export interface ProviderAnalyticsReport {
  profileViews: number;
  inquiries: number;
  bookings: number;
  reviews: number;
  averageRating: number | null;
  periodDays: number;
}

export interface ProviderReferralRow {
  id: string;
  referred_email: string | null;
  provider_role: string;
  status: ProviderReferralStatus;
  reward_usd: number;
  created_at: string;
  converted_at: string | null;
}

export interface AcquisitionDashboardReport {
  generatedAt: string;
  periodDays: number;
  providersAddedThisWeek: number;
  pendingApprovals: number;
  topReferrers: Array<{
    userId: string;
    name: string;
    referrals: number;
    rewardsUsd: number;
  }>;
  conversionRates: {
    landingToSignup: number;
    signupToOnboarding: number;
    onboardingToVerified: number;
  };
  byRole: Array<{ role: string; count: number; pending: number }>;
  recentReferrals: ProviderReferralRow[];
}

export interface ProviderLandingConfig {
  slug: string;
  role: ProviderAcquisitionRole;
  registerParam: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  emoji: string;
  benefits: Array<{ icon: string; title: string; description: string }>;
  steps: Array<{ title: string; description: string }>;
  requirements: string[];
  faq: Array<{ q: string; a: string }>;
}
