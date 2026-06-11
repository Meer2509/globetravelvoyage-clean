// =============================================================================
// Globe Travel Voyage — Stripe Checkout products (test-mode safe, price_data)
// =============================================================================

export type CheckoutProductKey =
  | "visa_expert_consultation"
  | "visa_document_review"
  | "visa_application_prep"
  | "premium_ai_trip_plan"
  | "agency_featured_listing"
  | "expert_featured_listing"
  | "property_featured_listing"
  | "guide_featured_listing"
  | "tour_booking_request"
  | "cruise_booking_request"
  | "concierge_travel_planning"
  | "provider_subscription"
  | "verified_badge_fee"
  | "provider_service";

export interface CheckoutProduct {
  key: CheckoutProductKey;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  emoji: string;
  category: string;
}

export const CHECKOUT_PRODUCTS: CheckoutProduct[] = [
  {
    key: "visa_expert_consultation",
    name: "Visa Expert Consultation",
    description: "1-on-1 session with a verified visa preparation expert.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Visa",
  },
  {
    key: "visa_document_review",
    name: "Visa Document Review",
    description: "Expert review of your visa application documents and checklist.",
    amountCents: 3900,
    currency: "usd",
    emoji: "📄",
    category: "Visa",
  },
  {
    key: "visa_application_prep",
    name: "Visa Application Preparation",
    description: "Guided visa application preparation support with a verified expert.",
    amountCents: 5900,
    currency: "usd",
    emoji: "🛂",
    category: "Visa",
  },
  {
    key: "premium_ai_trip_plan",
    name: "Premium AI Trip Plan",
    description: "Full AI-generated luxury itinerary with hotels, routes, and activities.",
    amountCents: 1900,
    currency: "usd",
    emoji: "✈️",
    category: "AI & Planning",
  },
  {
    key: "concierge_travel_planning",
    name: "Concierge Travel Planning",
    description: "Human concierge travel planning session for complex multi-city trips.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🧳",
    category: "AI & Planning",
  },
  {
    key: "agency_featured_listing",
    name: "Agency Featured Listing",
    description: "Featured placement for your travel agency on the marketplace (1 month).",
    amountCents: 19900,
    currency: "usd",
    emoji: "⭐",
    category: "Marketplace",
  },
  {
    key: "expert_featured_listing",
    name: "Visa Expert Featured Listing",
    description: "Featured placement for your visa expert profile (1 month).",
    amountCents: 14900,
    currency: "usd",
    emoji: "👔",
    category: "Marketplace",
  },
  {
    key: "guide_featured_listing",
    name: "Tour Guide Featured Listing",
    description: "Featured placement for your tour guide profile (1 month).",
    amountCents: 12900,
    currency: "usd",
    emoji: "🧭",
    category: "Marketplace",
  },
  {
    key: "property_featured_listing",
    name: "Property Featured Listing",
    description: "Boost your property listing visibility and receive qualified renter leads.",
    amountCents: 14900,
    currency: "usd",
    emoji: "🏠",
    category: "Marketplace",
  },
  {
    key: "tour_booking_request",
    name: "Tour Booking Request",
    description: "Platform fee for a tour booking request with a verified guide.",
    amountCents: 1900,
    currency: "usd",
    emoji: "🗺️",
    category: "Bookings",
  },
  {
    key: "cruise_booking_request",
    name: "Cruise Booking Request",
    description: "Platform fee for a cruise booking enquiry with a verified agency.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🚢",
    category: "Bookings",
  },
  {
    key: "provider_subscription",
    name: "Provider Subscription",
    description: "Monthly marketplace subscription for agencies, guides, and hosts.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📦",
    category: "Marketplace",
  },
  {
    key: "verified_badge_fee",
    name: "Verified Badge Fee",
    description: "One-time verification badge for your provider profile.",
    amountCents: 7900,
    currency: "usd",
    emoji: "✅",
    category: "Marketplace",
  },
];

const productMap = new Map(CHECKOUT_PRODUCTS.map((p) => [p.key, p]));

export function getCheckoutProduct(key: string): CheckoutProduct | undefined {
  if (key === "provider_service") return undefined;
  return productMap.get(key as CheckoutProductKey);
}

export function formatProductPrice(product: CheckoutProduct): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency.toUpperCase(),
  }).format(product.amountCents / 100);
}
