import type { CheckoutProductKey } from "./products";

/** Maps /pricing plan ids to Stripe Checkout product keys */
export const PLAN_ID_TO_CHECKOUT: Record<string, CheckoutProductKey> = {
  "expert-consultation": "usa_visa_consultation",
  "ai-visa-guidance": "usa_b1b2_document_review",
  "visa-application-prep": "full_visa_application_support",
  "ai-trip-premium": "premium_ai_trip_plan",
  "concierge-planning": "concierge_travel_planning",
  "featured-agency": "agency_featured_listing",
  "featured-expert": "expert_featured_listing",
  "featured-guide": "guide_featured_listing",
  "property-lead": "property_featured_listing",
  "tour-booking": "tour_booking_deposit",
  "tour-deposit": "tour_booking_deposit",
  "property-deposit": "property_reservation_deposit",
  "cruise-booking": "cruise_booking_request",
};

export function checkoutProductKeyForPlan(planId: string): CheckoutProductKey | undefined {
  return PLAN_ID_TO_CHECKOUT[planId];
}
