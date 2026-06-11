import type { CheckoutProductKey } from "./products";

/** Maps /pricing plan ids to Stripe Checkout product keys */
export const PLAN_ID_TO_CHECKOUT: Record<string, CheckoutProductKey> = {
  "expert-consultation": "visa_expert_consultation",
  "ai-visa-guidance": "visa_service_fee",
  "ai-trip-premium": "premium_ai_trip_plan",
  "featured-agency": "agency_featured_listing",
  "featured-expert": "agency_featured_listing",
  "property-lead": "property_featured_listing",
  "tour-booking": "tour_booking_request",
};

export function checkoutProductKeyForPlan(planId: string): CheckoutProductKey | undefined {
  return PLAN_ID_TO_CHECKOUT[planId];
}
