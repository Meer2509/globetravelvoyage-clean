// =============================================================================
// Globe Travel Voyage — Stripe Checkout products (test-mode safe, price_data)
// =============================================================================

export type CheckoutProductKey =
  | "visa_expert_consultation"
  | "visa_service_fee"
  | "premium_ai_trip_plan"
  | "agency_featured_listing"
  | "property_featured_listing"
  | "tour_booking_request"
  | "cruise_booking_request";

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
    description: "1-on-1 video session with a verified visa preparation expert.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Visa",
  },
  {
    key: "visa_service_fee",
    name: "Visa Service Fee",
    description: "AI-powered visa preparation guidance and document checklist for one application.",
    amountCents: 2900,
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
    category: "AI",
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
    key: "property_featured_listing",
    name: "Property Featured Listing",
    description: "Boost your property listing visibility and receive qualified renter leads.",
    amountCents: 14900,
    currency: "usd",
    emoji: "🏠",
    category: "Property",
  },
  {
    key: "tour_booking_request",
    name: "Tour Booking Request",
    description: "Receive direct tour booking requests from travelers on the platform.",
    amountCents: 1900,
    currency: "usd",
    emoji: "🧭",
    category: "Travel",
  },
  {
    key: "cruise_booking_request",
    name: "Cruise Booking Request",
    description: "Promote your cruise package and receive qualified booking enquiries.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🚢",
    category: "Travel",
  },
];

const productMap = new Map(CHECKOUT_PRODUCTS.map((p) => [p.key, p]));

export function getCheckoutProduct(key: string): CheckoutProduct | undefined {
  return productMap.get(key as CheckoutProductKey);
}

export function formatProductPrice(product: CheckoutProduct): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency.toUpperCase(),
  }).format(product.amountCents / 100);
}
