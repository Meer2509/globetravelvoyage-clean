export type GrowthEventType =
  | "signup"
  | "concierge_usage"
  | "visa_request"
  | "flight_request"
  | "property_inquiry"
  | "agent_inquiry"
  | "tour_request"
  | "email_capture"
  | "lead_request"
  | "booking_request"
  | "onboarding_step"
  | "provider_landing_view"
  | "provider_signup";

export type AbandonedInquiryType =
  | "visa"
  | "flight"
  | "booking"
  | "property"
  | "agent"
  | "tour"
  | "concierge"
  | "lead";

export type AbandonedInquiryStatus = "draft" | "recovery_sent" | "recovered" | "submitted" | "dismissed";

export interface GrowthAttributionTouch {
  landing_path?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export interface GrowthContext extends GrowthAttributionTouch {
  session_id?: string | null;
  source_path?: string | null;
}

export interface TrackGrowthEventInput {
  eventType: GrowthEventType;
  userId?: string | null;
  email?: string | null;
  relatedId?: string | null;
  metadata?: Record<string, unknown>;
  context?: GrowthContext;
}

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  rateFromPrevious?: number;
}

export interface SourceAttributionRow {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  signups: number;
  conversions: number;
  conversionRate: number;
}

export interface GrowthDashboardReport {
  generatedAt: string;
  periodDays: number;
  totals: {
    signups: number;
    conciergeUsage: number;
    visaRequests: number;
    flightRequests: number;
    propertyInquiries: number;
    agentInquiries: number;
    tourRequests: number;
    emailCaptures: number;
    abandonedDrafts: number;
    recoveriesSent: number;
  };
  funnels: {
    visitorToSignup: FunnelStage[];
    signupToInquiry: FunnelStage[];
    inquiryToConversion: FunnelStage[];
  };
  sources: SourceAttributionRow[];
  dailyEvents: Array<{ date: string; count: number; eventType: string }>;
  abandonedInquiries: Array<{
    id: string;
    inquiry_type: string;
    email: string | null;
    status: string;
    source_path: string | null;
    utm_source: string | null;
    created_at: string;
  }>;
}

export const ONBOARDING_STEPS = [
  { key: "complete_profile", label: "Complete your profile", href: "/dashboard/profile" },
  { key: "try_concierge", label: "Try the AI Concierge", href: "/concierge" },
  { key: "browse_visa_guides", label: "Browse visa guides", href: "/visa" },
  { key: "save_a_trip", label: "Save a trip or destination", href: "/saved" },
  { key: "submit_first_request", label: "Submit your first request", href: "/visa/start" },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];
