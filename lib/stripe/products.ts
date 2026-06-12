// =============================================================================
// Globe Travel Voyage — Stripe Checkout products (price_data at checkout)
// =============================================================================

export type CheckoutProductKey =
  | "usa_visa_consultation"
  | "usa_b1b2_document_review"
  | "full_visa_application_support"
  | "canada_visa_consultation"
  | "uk_visitor_visa_support"
  | "schengen_visa_support"
  | "visa_expert_consultation"
  | "visa_document_review"
  | "visa_application_prep"
  | "premium_ai_trip_plan"
  | "family_vacation_plan"
  | "concierge_travel_planning"
  | "expert_featured_listing"
  | "agency_featured_listing"
  | "verified_badge_fee"
  | "property_featured_listing"
  | "guide_featured_listing"
  | "flight_quote_request"
  | "hotel_booking_help"
  | "cruise_yacht_quote"
  | "tour_booking_deposit"
  | "tour_booking_request"
  | "property_rental_inquiry"
  | "property_reservation_deposit"
  | "cruise_booking_request"
  | "provider_subscription"
  | "provider_service";

export interface CheckoutProduct {
  key: CheckoutProductKey;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  emoji: string;
  category: string;
  priceLabel?: string;
  ctaLabel?: string;
}

export const CHECKOUT_PRODUCTS: CheckoutProduct[] = [
  // Visa Services
  {
    key: "usa_visa_consultation",
    name: "USA Visa Consultation",
    description: "1-on-1 consultation with a verified expert for USA visa preparation.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🇺🇸",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "usa_b1b2_document_review",
    name: "USA B1/B2 Document Review",
    description: "Expert review of your USA B1/B2 visitor visa documents and checklist.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📄",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "full_visa_application_support",
    name: "Full Visa Application Support",
    description: "End-to-end guided support for your visa application with a verified expert.",
    amountCents: 19900,
    currency: "usd",
    emoji: "🛂",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "canada_visa_consultation",
    name: "Canada Visa Consultation",
    description: "Consultation for Canada visitor, study, and work visa pathways.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🇨🇦",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "uk_visitor_visa_support",
    name: "UK Visitor Visa Support",
    description: "Document review and application guidance for UK Standard Visitor visas.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🇬🇧",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "schengen_visa_support",
    name: "Schengen Visa Support",
    description: "Schengen visa preparation support with itinerary and document checklist.",
    amountCents: 12900,
    currency: "usd",
    emoji: "🇪🇺",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  // Legacy visa keys (same catalog, used by older pages)
  {
    key: "visa_expert_consultation",
    name: "Visa Expert Consultation",
    description: "1-on-1 session with a verified visa preparation expert.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "visa_document_review",
    name: "Visa Document Review",
    description: "Expert review of your visa application documents.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📄",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  {
    key: "visa_application_prep",
    name: "Visa Application Preparation",
    description: "Guided visa application preparation with a verified expert.",
    amountCents: 19900,
    currency: "usd",
    emoji: "🛂",
    category: "Visa Services",
    ctaLabel: "Book now",
  },
  // AI Travel
  {
    key: "premium_ai_trip_plan",
    name: "Premium AI Trip Plan",
    description: "Full AI-generated luxury itinerary with hotels, routes, and activities.",
    amountCents: 1900,
    currency: "usd",
    emoji: "✈️",
    category: "AI Travel",
    ctaLabel: "Pay now",
  },
  {
    key: "family_vacation_plan",
    name: "Family Vacation Plan",
    description: "AI-crafted family vacation itinerary with kid-friendly activities and budgets.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👨‍👩‍👧‍👦",
    category: "AI Travel",
    ctaLabel: "Pay now",
  },
  {
    key: "concierge_travel_planning",
    name: "Luxury Travel Concierge Plan",
    description: "Human concierge planning session for complex multi-city luxury trips.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🧳",
    category: "AI Travel",
    ctaLabel: "Pay now",
  },
  // Provider Services
  {
    key: "expert_featured_listing",
    name: "Featured Visa Expert Listing",
    description: "Featured placement for your visa expert profile on the marketplace.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Provider Services",
    priceLabel: "$49/month",
    ctaLabel: "Pay now",
  },
  {
    key: "agency_featured_listing",
    name: "Featured Travel Agency Listing",
    description: "Featured placement for your travel agency on the marketplace.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🏢",
    category: "Provider Services",
    priceLabel: "$99/month",
    ctaLabel: "Pay now",
  },
  {
    key: "verified_badge_fee",
    name: "Verified Provider Badge Review",
    description: "One-time admin review fee for your verified provider badge.",
    amountCents: 2900,
    currency: "usd",
    emoji: "✅",
    category: "Provider Services",
    ctaLabel: "Pay now",
  },
  {
    key: "property_featured_listing",
    name: "Featured Property Listing",
    description: "Boost your property listing visibility and receive qualified leads.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🏠",
    category: "Provider Services",
    ctaLabel: "Pay now",
  },
  {
    key: "guide_featured_listing",
    name: "Featured Tour Guide Listing",
    description: "Featured placement for your tour guide profile on the marketplace.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🧭",
    category: "Provider Services",
    ctaLabel: "Pay now",
  },
  // Travel Requests
  {
    key: "flight_quote_request",
    name: "Flight Quote Request",
    description: "Platform-assisted flight quote request with route comparison support.",
    amountCents: 1000,
    currency: "usd",
    emoji: "✈️",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "hotel_booking_help",
    name: "Hotel Booking Help",
    description: "Assisted hotel and stay booking support from our travel team.",
    amountCents: 1500,
    currency: "usd",
    emoji: "🏨",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "cruise_yacht_quote",
    name: "Cruise / Yacht Quote",
    description: "Cruise or private yacht charter quote request with verified agencies.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🛳️",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "tour_booking_deposit",
    name: "Tour Guide Booking Deposit",
    description: "Refundable deposit to reserve your tour with a verified local guide.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🗺️",
    category: "Travel Requests",
    ctaLabel: "Pay deposit",
  },
  {
    key: "property_rental_inquiry",
    name: "Property Rental Inquiry",
    description: "Platform fee for a property rental or stay inquiry with verified hosts.",
    amountCents: 1000,
    currency: "usd",
    emoji: "🔑",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "property_reservation_deposit",
    name: "Property Reservation Deposit",
    description: "Reservation deposit for a property stay or rental.",
    amountCents: 5000,
    currency: "usd",
    emoji: "🏡",
    category: "Travel Requests",
    ctaLabel: "Pay deposit",
  },
  {
    key: "tour_booking_request",
    name: "Tour Booking Request",
    description: "Platform fee for a tour booking request with a verified guide.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🗺️",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "cruise_booking_request",
    name: "Cruise Booking Request",
    description: "Platform fee for a cruise booking enquiry with a verified agency.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🚢",
    category: "Travel Requests",
    ctaLabel: "Pay now",
  },
  {
    key: "provider_subscription",
    name: "Provider Subscription",
    description: "Monthly marketplace subscription for agencies, guides, and hosts.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📦",
    category: "Provider Services",
    priceLabel: "$99/month",
    ctaLabel: "Pay now",
  },
];

const productMap = new Map(CHECKOUT_PRODUCTS.map((p) => [p.key, p]));

export function getCheckoutProduct(key: string): CheckoutProduct | undefined {
  if (key === "provider_service") return undefined;
  return productMap.get(key as CheckoutProductKey);
}

export function formatProductPrice(product: CheckoutProduct): string {
  if (product.priceLabel) return product.priceLabel;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency.toUpperCase(),
  }).format(product.amountCents / 100);
}

/** Primary catalog shown on /services (no legacy duplicate keys). */
export const SERVICES_CATALOG_KEYS: CheckoutProductKey[] = [
  "usa_visa_consultation",
  "usa_b1b2_document_review",
  "full_visa_application_support",
  "canada_visa_consultation",
  "uk_visitor_visa_support",
  "schengen_visa_support",
  "premium_ai_trip_plan",
  "family_vacation_plan",
  "concierge_travel_planning",
  "expert_featured_listing",
  "agency_featured_listing",
  "verified_badge_fee",
  "property_featured_listing",
  "flight_quote_request",
  "hotel_booking_help",
  "cruise_yacht_quote",
  "tour_booking_deposit",
  "property_rental_inquiry",
];

export const FEATURED_HOME_SERVICE_KEYS: CheckoutProductKey[] = [
  "usa_visa_consultation",
  "usa_b1b2_document_review",
  "premium_ai_trip_plan",
  "family_vacation_plan",
  "concierge_travel_planning",
  "tour_booking_deposit",
  "flight_quote_request",
  "property_rental_inquiry",
];

export const SERVICE_CATEGORIES = [
  "Visa Services",
  "AI Travel",
  "Provider Services",
  "Travel Requests",
] as const;

export function getProductsByCategory(category: string): CheckoutProduct[] {
  return CHECKOUT_PRODUCTS.filter(
    (p) => p.category === category && SERVICES_CATALOG_KEYS.includes(p.key)
  );
}

export function getFeaturedHomeProducts(): CheckoutProduct[] {
  return FEATURED_HOME_SERVICE_KEYS.map((k) => productMap.get(k)!).filter(Boolean);
}
