// =============================================================================
// Globe Travel Voyage — Pricing Data
// =============================================================================
// All prices are in USD. Change/localize at checkout time.
// When Stripe is connected, map plan.id → STRIPE_PRICE_IDS[plan.stripeKey]
// =============================================================================

export interface PricingPlan {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  priceSuffix: string;       // "per application" | "/month" | "/hour" | etc.
  originalPrice?: number;    // for showing strikethrough
  badge?: string;
  emoji: string;
  features: string[];
  cta: string;
  popular?: boolean;
  stripeKey?: string;
}

export interface PricingBundle {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  badge: string;
  emoji: string;
  includes: string[];
  popular?: boolean;
  stripeKey?: string;
}

// ── Individual services ───────────────────────────────────────────────────────

export const pricingPlans: PricingPlan[] = [
  // Visa services
  {
    id: "ai-visa-guidance",
    category: "Visa",
    name: "AI Visa Preparation Guidance",
    description: "AI-powered checklist, document guide and timeline for your specific visa case.",
    price: 29,
    priceSuffix: "per application",
    badge: "Most popular",
    emoji: "🤖",
    popular: true,
    features: [
      "Country-specific document checklist",
      "AI-generated cover letter template",
      "Step-by-step timeline guide",
      "Common mistakes to avoid",
      "Approval probability estimate",
      "Email PDF export",
    ],
    cta: "Get AI guidance",
    stripeKey: "ai_visa_guidance",
  },
  {
    id: "premium-checklist",
    category: "Visa",
    name: "Premium Document Checklist",
    description: "Detailed, verified document checklist with instructions for any visa type.",
    price: 9,
    priceSuffix: "per report",
    emoji: "📋",
    features: [
      "40+ document types covered",
      "Certified translations guidance",
      "Financial proof templates",
      "Sponsor letter template",
      "Downloadable PDF checklist",
    ],
    cta: "Buy checklist",
    stripeKey: "premium_checklist",
  },
  {
    id: "expert-consultation",
    category: "Visa",
    name: "Visa Expert Consultation",
    description: "1-on-1 session with a verified visa preparation expert on the platform.",
    price: 49,
    priceSuffix: "per hour",
    badge: "High value",
    emoji: "👔",
    features: [
      "30 or 60-minute video call",
      "Expert reviews your documents",
      "Personalized action plan",
      "Follow-up Q&A (48h)",
      "Choose from 100+ verified experts",
    ],
    cta: "Book consultation",
    stripeKey: "expert_consultation",
  },

  // Travel services
  {
    id: "agency-lead",
    category: "Travel",
    name: "Travel Agency Package Lead",
    description: "Receive qualified leads from travelers looking for packaged tours.",
    price: 99,
    priceSuffix: "per lead",
    emoji: "🏢",
    features: [
      "Verified traveler contact info",
      "Budget and dates pre-qualified",
      "Destination preferences included",
      "Group size and travel style data",
      "48h lead delivery guarantee",
    ],
    cta: "Buy lead credit",
    stripeKey: "agency_lead",
  },
  {
    id: "cruise-booking",
    category: "Travel",
    name: "Cruise Booking Request",
    description: "Promote your cruise package and receive qualified booking enquiries.",
    price: 49,
    priceSuffix: "per request",
    emoji: "🚢",
    features: [
      "Traveler name and contact",
      "Preferred sailing dates",
      "Cabin type and group size",
      "Special requirements noted",
      "Direct messaging enabled",
    ],
    cta: "Enable cruise bookings",
    stripeKey: "cruise_booking",
  },
  {
    id: "tour-booking",
    category: "Travel",
    name: "Tour Guide Booking Request",
    description: "Promote your tour and receive direct booking requests from travelers.",
    price: 19,
    priceSuffix: "per booking",
    emoji: "🧭",
    features: [
      "Traveler name and contact",
      "Requested tour date and time",
      "Group size confirmed",
      "Special requirements noted",
      "Direct messaging enabled",
    ],
    cta: "Enable booking",
    stripeKey: "tour_booking",
  },
  {
    id: "property-lead",
    category: "Property",
    name: "Property Rental Lead",
    description: "Get qualified tenants and buyers for your listed property.",
    price: 29,
    priceSuffix: "per lead",
    emoji: "🏠",
    features: [
      "Verified renter/buyer contact",
      "Move-in date and budget confirmed",
      "Property type preference matched",
      "Length of stay or intent captured",
      "24h average delivery",
    ],
    cta: "Buy lead",
    stripeKey: "property_lead",
  },

  // AI & Platform
  {
    id: "ai-trip-premium",
    category: "AI",
    name: "AI Trip Plan Premium",
    description: "Full AI-generated itinerary with hotels, flights, tours, budgets and tips.",
    price: 19,
    priceSuffix: "per plan",
    badge: "Fan favorite",
    emoji: "✈️",
    popular: true,
    features: [
      "Day-by-day luxury itinerary",
      "Flight route recommendations",
      "Hotel shortlist with prices",
      "Restaurant and activity picks",
      "Visa & entry requirements",
      "Offline PDF export",
    ],
    cta: "Generate plan",
    stripeKey: "ai_trip_premium",
  },
  {
    id: "featured-agency",
    category: "Marketplace",
    name: "Featured Agency Listing",
    description: "Get your travel agency listed at the top of search results and homepage.",
    price: 199,
    priceSuffix: "/month",
    badge: "Business",
    emoji: "⭐",
    features: [
      "Homepage marketplace spotlight",
      "Priority search placement",
      "\"Featured\" badge on profile",
      "3× more visibility in filters",
      "Monthly performance report",
      "Cancel anytime",
    ],
    cta: "Get featured",
    stripeKey: "featured_agency",
  },
  {
    id: "featured-expert",
    category: "Marketplace",
    name: "Featured Expert Listing",
    description: "Boost your visa expert profile to the top for maximum lead generation.",
    price: 149,
    priceSuffix: "/month",
    emoji: "🏅",
    features: [
      "Top placement in visa expert search",
      "\"Featured Expert\" badge",
      "2× profile visibility",
      "Priority lead delivery",
      "Monthly analytics report",
      "Cancel anytime",
    ],
    cta: "Boost my profile",
    stripeKey: "featured_expert",
  },
];

// ── Bundles ───────────────────────────────────────────────────────────────────

export const pricingBundles: PricingBundle[] = [
  {
    id: "starter-bundle",
    name: "Traveler Starter",
    tagline: "Everything a traveler needs for one trip",
    price: 49,
    originalPrice: 77,
    badge: "Save 36%",
    emoji: "🧳",
    includes: [
      "AI Visa Preparation Guidance",
      "Premium Document Checklist",
      "AI Trip Plan Premium",
    ],
    stripeKey: "starter_bundle",
  },
  {
    id: "pro-bundle",
    name: "Traveler Pro",
    tagline: "For frequent travelers and visa applicants",
    price: 149,
    originalPrice: 216,
    badge: "Save 31%",
    emoji: "✈️",
    popular: true,
    includes: [
      "3× AI Visa Preparation Guidance",
      "3× Premium Document Checklist",
      "2× AI Trip Plan Premium",
      "1× Expert Consultation (30 min)",
    ],
    stripeKey: "pro_bundle",
  },
  {
    id: "agency-pro",
    name: "Agency Pro",
    tagline: "For travel agencies and visa experts",
    price: 299,
    originalPrice: 447,
    badge: "Save 33%",
    emoji: "🏢",
    includes: [
      "Featured Agency Listing (1 month)",
      "5× Agency Package Leads",
      "Priority verification badge",
      "Dedicated account support",
    ],
    stripeKey: "agency_pro",
  },
];

// ── Referral commission rates ─────────────────────────────────────────────────

export interface CommissionRate {
  service: string;
  emoji: string;
  rate: string;
  condition: string;
}

export const commissionRates: CommissionRate[] = [
  { service: "New user signup",           emoji: "👤", rate: "$2",   condition: "Per verified signup" },
  { service: "First paid purchase",       emoji: "💳", rate: "15%",  condition: "Of first transaction value" },
  { service: "Visa Expert subscription",  emoji: "👔", rate: "20%",  condition: "First month commission" },
  { service: "Agency subscription",       emoji: "🏢", rate: "20%",  condition: "First month commission" },
  { service: "AI Visa Guidance sale",     emoji: "🤖", rate: "10%",  condition: "Per sale referred" },
  { service: "Property lead sale",        emoji: "🏠", rate: "10%",  condition: "Per lead referred" },
  { service: "Bundle purchase",           emoji: "📦", rate: "12%",  condition: "Of bundle value" },
];

// ── Categories ────────────────────────────────────────────────────────────────

export const planCategories = [...new Set(pricingPlans.map((p) => p.category))];

// ── All plan IDs (for generateStaticParams) ───────────────────────────────────

export const allPlanIds = [
  ...pricingPlans.map((p) => p.id),
  ...pricingBundles.map((b) => b.id),
];

export function getPlanById(id: string): PricingPlan | PricingBundle | undefined {
  return (
    pricingPlans.find((p) => p.id === id) ??
    pricingBundles.find((b) => b.id === id)
  );
}

export function isPricingPlan(p: PricingPlan | PricingBundle): p is PricingPlan {
  return "category" in p && "priceSuffix" in p;
}
