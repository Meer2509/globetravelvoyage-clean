// Price IDs for legacy /pricing plan checkout (optional env overrides)

export const STRIPE_PRICE_IDS = {
  ai_visa_guidance: process.env.STRIPE_PRICE_AI_VISA ?? "",
  premium_checklist: process.env.STRIPE_PRICE_CHECKLIST ?? "",
  expert_consultation: process.env.STRIPE_PRICE_CONSULTATION ?? "",
  agency_lead: process.env.STRIPE_PRICE_AGENCY_LEAD ?? "",
  tour_booking: process.env.STRIPE_PRICE_TOUR_BOOKING ?? "",
  property_lead: process.env.STRIPE_PRICE_PROPERTY_LEAD ?? "",
  ai_trip_premium: process.env.STRIPE_PRICE_AI_TRIP ?? "",
  featured_agency: process.env.STRIPE_PRICE_FEATURED_AGENCY ?? "",
  featured_expert: process.env.STRIPE_PRICE_FEATURED_EXPERT ?? "",
  starter_bundle: process.env.STRIPE_PRICE_STARTER_BUNDLE ?? "",
  pro_bundle: process.env.STRIPE_PRICE_PRO_BUNDLE ?? "",
  agency_pro: process.env.STRIPE_PRICE_AGENCY_PRO ?? "",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICE_IDS;
