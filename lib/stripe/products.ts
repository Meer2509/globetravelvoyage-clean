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
  | "homepage_placement"
  | "provider_service";

export type ProductTier = "premium" | "featured";

export interface CheckoutProduct {
  key: CheckoutProductKey;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  emoji: string;
  category: string;
  tier: ProductTier;
  priceLabel?: string;
  ctaLabel?: string;
}

export const CHECKOUT_PRODUCTS: CheckoutProduct[] = [
  // Traveler Premium
  {
    key: "usa_visa_consultation",
    name: "Visa Consultation",
    description: "1-on-1 session with a verified expert when you need personal guidance.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🇺🇸",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "usa_b1b2_document_review",
    name: "Document Review",
    description: "Expert review of your visa documents before you submit.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📄",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "full_visa_application_support",
    name: "Full Visa Application Support",
    description: "End-to-end guided support for your complete visa application.",
    amountCents: 19900,
    currency: "usd",
    emoji: "🛂",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "premium_ai_trip_plan",
    name: "Premium AI Itinerary",
    description: "Full luxury itinerary with hotels, routes, activities, and export.",
    amountCents: 1900,
    currency: "usd",
    emoji: "✈️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "concierge_travel_planning",
    name: "Concierge Travel Planning",
    description: "Human concierge session for complex multi-city luxury trips.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🧳",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  // Provider Featured
  {
    key: "expert_featured_listing",
    name: "Featured Listing",
    description: "Top placement for your visa expert profile in search results.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Provider Featured",
    tier: "featured",
    priceLabel: "$49/month",
    ctaLabel: "Get featured",
  },
  {
    key: "agency_featured_listing",
    name: "Premium Placement",
    description: "Priority search placement and Featured badge for your agency.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🏢",
    category: "Provider Featured",
    tier: "featured",
    priceLabel: "$99/month",
    ctaLabel: "Get featured",
  },
  {
    key: "verified_badge_fee",
    name: "Verified Badge",
    description: "One-time review for your verified provider trust badge.",
    amountCents: 2900,
    currency: "usd",
    emoji: "✅",
    category: "Provider Featured",
    tier: "featured",
    ctaLabel: "Apply",
  },
  {
    key: "homepage_placement",
    name: "Homepage Placement",
    description: "Spotlight your profile on the Globe Travel Voyage homepage.",
    amountCents: 14900,
    currency: "usd",
    emoji: "⭐",
    category: "Provider Featured",
    tier: "featured",
    priceLabel: "$149/month",
    ctaLabel: "Get featured",
  },
  // Legacy keys (API / existing payments — not shown in launch catalog)
  {
    key: "canada_visa_consultation",
    name: "Canada Visa Consultation",
    description: "Consultation for Canada visitor, study, and work visa pathways.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🇨🇦",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "uk_visitor_visa_support",
    name: "UK Visitor Visa Support",
    description: "Document review and application guidance for UK Standard Visitor visas.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🇬🇧",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "schengen_visa_support",
    name: "Schengen Visa Support",
    description: "Schengen visa preparation support with itinerary and document checklist.",
    amountCents: 12900,
    currency: "usd",
    emoji: "🇪🇺",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "visa_expert_consultation",
    name: "Visa Expert Consultation",
    description: "1-on-1 session with a verified visa preparation expert.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👔",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "visa_document_review",
    name: "Visa Document Review",
    description: "Expert review of your visa application documents.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📄",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "visa_application_prep",
    name: "Visa Application Preparation",
    description: "Guided visa application preparation with a verified expert.",
    amountCents: 19900,
    currency: "usd",
    emoji: "🛂",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "family_vacation_plan",
    name: "Family Vacation Plan",
    description: "AI-crafted family vacation itinerary with kid-friendly activities.",
    amountCents: 4900,
    currency: "usd",
    emoji: "👨‍👩‍👧‍👦",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "property_featured_listing",
    name: "Featured Property Listing",
    description: "Boost your property listing visibility and receive qualified leads.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🏠",
    category: "Provider Featured",
    tier: "featured",
    ctaLabel: "Get featured",
  },
  {
    key: "guide_featured_listing",
    name: "Featured Tour Guide Listing",
    description: "Featured placement for your tour guide profile on the marketplace.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🧭",
    category: "Provider Featured",
    tier: "featured",
    ctaLabel: "Get featured",
  },
  {
    key: "provider_subscription",
    name: "Provider Subscription",
    description: "Monthly marketplace subscription for agencies, guides, and hosts.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📦",
    category: "Provider Featured",
    tier: "featured",
    priceLabel: "$99/month",
    ctaLabel: "Get featured",
  },
  // Legacy travel-request keys (free at launch — kept for existing payment records)
  {
    key: "flight_quote_request",
    name: "Flight Quote Request",
    description: "Platform-assisted flight quote request.",
    amountCents: 1000,
    currency: "usd",
    emoji: "✈️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "hotel_booking_help",
    name: "Hotel Booking Help",
    description: "Assisted hotel and stay booking support.",
    amountCents: 1500,
    currency: "usd",
    emoji: "🏨",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "cruise_yacht_quote",
    name: "Cruise / Yacht Quote",
    description: "Cruise or yacht charter quote request.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🛳️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "tour_booking_deposit",
    name: "Tour Guide Booking Deposit",
    description: "Deposit to reserve a tour with a verified guide.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🗺️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "property_rental_inquiry",
    name: "Property Rental Inquiry",
    description: "Property rental or stay inquiry fee.",
    amountCents: 1000,
    currency: "usd",
    emoji: "🔑",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "property_reservation_deposit",
    name: "Property Reservation Deposit",
    description: "Reservation deposit for a property stay.",
    amountCents: 5000,
    currency: "usd",
    emoji: "🏡",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "tour_booking_request",
    name: "Tour Booking Request",
    description: "Tour booking request with a verified guide.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🗺️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
  },
  {
    key: "cruise_booking_request",
    name: "Cruise Booking Request",
    description: "Cruise booking enquiry with a verified agency.",
    amountCents: 2500,
    currency: "usd",
    emoji: "🚢",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Upgrade",
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

/** Premium & featured services shown on /services (Stripe checkout). */
export const SERVICES_CATALOG_KEYS: CheckoutProductKey[] = [
  "usa_visa_consultation",
  "usa_b1b2_document_review",
  "full_visa_application_support",
  "premium_ai_trip_plan",
  "concierge_travel_planning",
  "expert_featured_listing",
  "agency_featured_listing",
  "verified_badge_fee",
  "homepage_placement",
];

/** Soft premium upsell on homepage (not aggressive). */
export const FEATURED_HOME_PREMIUM_KEYS: CheckoutProductKey[] = [
  "usa_visa_consultation",
  "premium_ai_trip_plan",
  "concierge_travel_planning",
  "expert_featured_listing",
];

export const SERVICE_CATEGORIES = [
  "Traveler Premium",
  "Provider Featured",
] as const;

export function getProductsByCategory(category: string): CheckoutProduct[] {
  return CHECKOUT_PRODUCTS.filter(
    (p) => p.category === category && SERVICES_CATALOG_KEYS.includes(p.key)
  );
}

export function getFeaturedHomePremiumProducts(): CheckoutProduct[] {
  return FEATURED_HOME_PREMIUM_KEYS.map((k) => productMap.get(k)!).filter(Boolean);
}
