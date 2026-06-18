export type ProviderCategory =
  | "travel_agent"
  | "visa_expert"
  | "property_host"
  | "tour_organizer";

export type VerificationLevel = "basic" | "verified" | "premium_verified";

export type VerificationStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "revoked";

export type TrustBadgeTier = "none" | "basic" | "verified" | "premium" | "elite";

export type FraudFlagType =
  | "repeated_cancellations"
  | "spam_inquiries"
  | "suspicious_account"
  | "review_abuse";

export const PROVIDER_CATEGORIES: Array<{
  key: ProviderCategory;
  label: string;
  role: string;
  emoji: string;
}> = [
  { key: "travel_agent", label: "Travel Agent", role: "visa_agent", emoji: "✈️" },
  { key: "visa_expert", label: "Visa Expert", role: "visa_agent", emoji: "👔" },
  { key: "property_host", label: "Property Host", role: "property_host", emoji: "🏠" },
  { key: "tour_organizer", label: "Tour Organizer", role: "tour_guide", emoji: "🗺️" },
];

export interface VerificationProfileRow {
  id: string;
  user_id: string;
  provider_category: ProviderCategory;
  provider_role: string;
  verification_level: VerificationLevel;
  status: VerificationStatus;
  identity_doc_path: string | null;
  business_license_path: string | null;
  certifications: string[];
  social_links: Record<string, string>;
  website: string | null;
  verification_notes: string | null;
  admin_notes: string | null;
  suspended_at: string | null;
  revoked_at: string | null;
  verified_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrustScoreRow {
  user_id: string;
  provider_role: string;
  trust_score: number;
  verification_pts: number;
  profile_pts: number;
  review_pts: number;
  response_pts: number;
  completion_pts: number;
  age_pts: number;
  badge_tier: TrustBadgeTier;
  calculated_at: string;
}

export interface ReputationMetricsRow {
  user_id: string;
  provider_role: string;
  inquiries_total: number;
  inquiries_answered: number;
  bookings_completed: number;
  cancellations: number;
  avg_response_hours: number | null;
  review_average: number;
  review_count: number;
  response_rate: number;
  completion_rate: number;
  updated_at?: string;
}

export interface PublicTrustProfile {
  userId: string;
  displayName: string;
  providerCategory: ProviderCategory;
  verificationLevel: VerificationLevel;
  verificationStatus: VerificationStatus;
  trustScore: number;
  badgeTier: TrustBadgeTier;
  responseRate: number;
  reviewAverage: number;
  reviewCount: number;
  completedServices: number;
  website: string | null;
  socialLinks: Record<string, string>;
  isSuspended: boolean;
}

export interface FraudFlagRow {
  id: string;
  user_id: string;
  flag_type: FraudFlagType;
  severity: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
}
