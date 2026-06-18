// =============================================================================
// Globe Travel Voyage — Stripe Checkout products (price_data at checkout)
// =============================================================================

export type CheckoutProductKey =
  | "visa_document_review"
  | "visa_application_assistance"
  | "premium_visa_filing_support"
  | "urgent_visa_prep"
  | "family_visa_package"
  | "premium_ai_trip_plan"
  | "human_trip_planner"
  | "luxury_concierge_planning"
  | "honeymoon_planning"
  | "usa_visa_consultation"
  | "usa_b1b2_document_review"
  | "full_visa_application_support"
  | "canada_visa_consultation"
  | "uk_visitor_visa_support"
  | "schengen_visa_support"
  | "visa_expert_consultation"
  | "visa_application_prep"
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
  | "provider_service"
  | "ai_concierge_plus"
  | "premium_concierge_planning"
  | "travel_agent_pro"
  | "travel_agent_featured_listing"
  | "featured_group_tour_listing";

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
  // Traveler Premium — launch catalog
  {
    key: "visa_document_review",
    name: "Visa Document Review",
    description: "Expert review of your visa documents before you submit. Case tracking included.",
    amountCents: 4900,
    currency: "usd",
    emoji: "📄",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "visa_application_assistance",
    name: "Visa Application Assistance",
    description: "Guided assistance through your visa application with document checklist support.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🛂",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "premium_visa_filing_support",
    name: "Premium Visa Filing Support",
    description: "End-to-end preparation support for your complete visa application.",
    amountCents: 19900,
    currency: "usd",
    emoji: "📋",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "urgent_visa_prep",
    name: "Urgent Visa Prep Support",
    description: "Priority visa preparation for time-sensitive travel. No approval guarantee.",
    amountCents: 29900,
    currency: "usd",
    emoji: "⚡",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "family_visa_package",
    name: "Family Visa Package",
    description: "Coordinated visa preparation support for families traveling together.",
    amountCents: 39900,
    currency: "usd",
    emoji: "👨‍👩‍👧‍👦",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "premium_ai_trip_plan",
    name: "Premium AI Trip Plan",
    description: "Full luxury itinerary with hotels, routes, activities, and export.",
    amountCents: 1900,
    currency: "usd",
    emoji: "✈️",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "ai_concierge_plus",
    name: "AI Concierge Plus",
    description: "Monthly subscription — enhanced AI itineraries, 20 saved trips, priority concierge queue.",
    amountCents: 1200,
    currency: "usd",
    emoji: "✨",
    category: "V5 Concierge",
    tier: "premium",
    priceLabel: "$12/month",
    ctaLabel: "Subscribe",
  },
  {
    key: "premium_concierge_planning",
    name: "Premium Travel Concierge",
    description: "One-time white-glove planning request reviewed by our concierge team.",
    amountCents: 14900,
    currency: "usd",
    emoji: "🌟",
    category: "V5 Concierge",
    tier: "premium",
    ctaLabel: "Request planning",
  },
  {
    key: "travel_agent_pro",
    name: "Travel Agent Pro",
    description: "Monthly pro subscription — priority leads, analytics, and agent dashboard tools.",
    amountCents: 4900,
    currency: "usd",
    emoji: "💼",
    category: "V5 Provider",
    tier: "featured",
    priceLabel: "$49/month",
    ctaLabel: "Subscribe",
  },
  {
    key: "travel_agent_featured_listing",
    name: "Featured Agent Listing",
    description: "30-day featured placement for your travel agent profile in marketplace search.",
    amountCents: 5900,
    currency: "usd",
    emoji: "⭐",
    category: "V5 Provider",
    tier: "featured",
    priceLabel: "$59 / 30 days",
    ctaLabel: "Get featured",
  },
  {
    key: "featured_group_tour_listing",
    name: "Featured Group Tour",
    description: "30-day featured placement for a group tour departure on the marketplace.",
    amountCents: 3900,
    currency: "usd",
    emoji: "🗺️",
    category: "V5 Provider",
    tier: "featured",
    priceLabel: "$39 / 30 days",
    ctaLabel: "Feature tour",
  },
  {
    key: "human_trip_planner",
    name: "Human Trip Planner",
    description: "One-on-one session with a travel planner for your next journey.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🧳",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "luxury_concierge_planning",
    name: "Luxury Concierge Planning",
    description: "Concierge planning for complex multi-city luxury trips.",
    amountCents: 29900,
    currency: "usd",
    emoji: "🌟",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "honeymoon_planning",
    name: "Honeymoon Planning",
    description: "Bespoke honeymoon itinerary with premium stays and experiences.",
    amountCents: 49900,
    currency: "usd",
    emoji: "💍",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  // Provider Featured — launch catalog
  {
    key: "expert_featured_listing",
    name: "Featured Visa Expert Listing",
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
    name: "Featured Travel Agency Listing",
    description: "Priority search placement and featured badge for your agency.",
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
    name: "Verified Provider Review",
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
  // Legacy traveler keys (existing payments)
  {
    key: "usa_visa_consultation",
    name: "Visa Document Review",
    description: "Expert review of your visa documents before you submit.",
    amountCents: 4900,
    currency: "usd",
    emoji: "🇺🇸",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "usa_b1b2_document_review",
    name: "Visa Application Assistance",
    description: "Guided assistance through your visa application.",
    amountCents: 9900,
    currency: "usd",
    emoji: "📄",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "full_visa_application_support",
    name: "Premium Visa Filing Support",
    description: "End-to-end preparation support for your complete visa application.",
    amountCents: 19900,
    currency: "usd",
    emoji: "🛂",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
  },
  {
    key: "concierge_travel_planning",
    name: "Human Trip Planner",
    description: "One-on-one session with a travel planner.",
    amountCents: 9900,
    currency: "usd",
    emoji: "🧳",
    category: "Traveler Premium",
    tier: "premium",
    ctaLabel: "Purchase",
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

/** V5 Phase 5 plans shown on /pricing */
export const V5_PRICING_KEYS: CheckoutProductKey[] = [
  "ai_concierge_plus",
  "premium_concierge_planning",
  "travel_agent_pro",
  "travel_agent_featured_listing",
  "property_featured_listing",
  "featured_group_tour_listing",
];

/** Premium & featured services shown on /services (Stripe checkout). */
export const SERVICES_CATALOG_KEYS: CheckoutProductKey[] = [
  "ai_concierge_plus",
  "premium_concierge_planning",
  "travel_agent_pro",
  "travel_agent_featured_listing",
  "featured_group_tour_listing",
  "visa_document_review",
  "visa_application_assistance",
  "premium_visa_filing_support",
  "urgent_visa_prep",
  "family_visa_package",
  "premium_ai_trip_plan",
  "human_trip_planner",
  "luxury_concierge_planning",
  "honeymoon_planning",
  "expert_featured_listing",
  "agency_featured_listing",
  "verified_badge_fee",
  "homepage_placement",
];

/** Soft premium upsell on homepage (not aggressive). */
export const FEATURED_HOME_PREMIUM_KEYS: CheckoutProductKey[] = [
  "visa_document_review",
  "premium_ai_trip_plan",
  "human_trip_planner",
  "expert_featured_listing",
];

export const SERVICE_CATEGORIES = [
  "V5 Concierge",
  "V5 Provider",
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
