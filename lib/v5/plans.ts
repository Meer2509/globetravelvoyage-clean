import type { CheckoutProductKey } from "@/lib/stripe/products";

export type V5PlanId =
  | "free_traveler"
  | "ai_concierge_plus"
  | "premium_concierge"
  | "agent_pro"
  | "featured_agent"
  | "featured_property"
  | "featured_group_tour";

export interface V5Plan {
  id: V5PlanId;
  name: string;
  tagline: string;
  audience: "traveler" | "provider";
  priceLabel: string;
  billing: "free" | "monthly" | "one_time";
  productKey?: CheckoutProductKey;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  highlighted?: boolean;
}

export const V5_PLANS: V5Plan[] = [
  {
    id: "free_traveler",
    name: "Free Traveler",
    tagline: "Everything you need to explore and plan",
    audience: "traveler",
    priceLabel: "Free",
    billing: "free",
    features: [
      "AI concierge (basic)",
      "Save up to 3 trips",
      "Community access",
      "Browse verified experts",
      "Basic inquiries & quotes",
    ],
    ctaLabel: "Create free account",
    ctaHref: "/register",
  },
  {
    id: "ai_concierge_plus",
    name: "AI Concierge Plus",
    tagline: "Smarter planning, more saves, priority queue",
    audience: "traveler",
    priceLabel: "$12",
    billing: "monthly",
    productKey: "ai_concierge_plus",
    features: [
      "Enhanced AI itineraries",
      "Save up to 20 trips",
      "Priority concierge requests",
      "Faster support response",
      "Export premium plans",
    ],
    ctaLabel: "Upgrade with Stripe",
    highlighted: true,
  },
  {
    id: "premium_concierge",
    name: "Premium Travel Concierge",
    tagline: "White-glove human planning for complex trips",
    audience: "traveler",
    priceLabel: "$149",
    billing: "one_time",
    productKey: "premium_concierge_planning",
    features: [
      "Dedicated planning request",
      "Human concierge review",
      "Multi-city luxury itineraries",
      "Priority support line",
      "Unlimited saved trips (30 days)",
    ],
    ctaLabel: "Request planning",
  },
  {
    id: "agent_pro",
    name: "Agent Pro",
    tagline: "Pro tools for travel agents and visa experts",
    audience: "provider",
    priceLabel: "$49",
    billing: "monthly",
    productKey: "travel_agent_pro",
    features: [
      "Pro agent dashboard tools",
      "Priority lead routing",
      "Enhanced profile analytics",
      "Featured badge eligibility",
      "Direct messaging priority",
    ],
    ctaLabel: "Subscribe with Stripe",
    highlighted: true,
  },
  {
    id: "featured_agent",
    name: "Featured Agent",
    tagline: "Top placement in the travel agent marketplace",
    audience: "provider",
    priceLabel: "$59",
    billing: "one_time",
    productKey: "travel_agent_featured_listing",
    features: [
      "Featured agent profile (30 days)",
      "Priority search placement",
      "Verified featured badge",
      "Homepage marketplace rotation",
    ],
    ctaLabel: "Get featured",
  },
  {
    id: "featured_property",
    name: "Featured Property",
    tagline: "Boost visibility for hosts and property listings",
    audience: "provider",
    priceLabel: "$49",
    billing: "one_time",
    productKey: "property_featured_listing",
    features: [
      "Featured property card (30 days)",
      "Priority in search results",
      "Qualified lead notifications",
    ],
    ctaLabel: "Feature listing",
  },
  {
    id: "featured_group_tour",
    name: "Featured Group Tour",
    tagline: "Spotlight your departure on the group tours marketplace",
    audience: "provider",
    priceLabel: "$39",
    billing: "one_time",
    productKey: "featured_group_tour_listing",
    features: [
      "Featured tour placement (30 days)",
      "Priority in destination search",
      "Join request notifications",
    ],
    ctaLabel: "Feature tour",
  },
];

export const SUBSCRIPTION_PRODUCT_KEYS = new Set<string>([
  "ai_concierge_plus",
  "travel_agent_pro",
]);

export const FREE_SAVED_TRIP_LIMIT = 3;
export const PLUS_SAVED_TRIP_LIMIT = 20;
export const PREMIUM_SAVED_TRIP_LIMIT = 999;

export function getPlanByProductKey(key: string): V5Plan | undefined {
  return V5_PLANS.find((p) => p.productKey === key);
}

export function isSubscriptionProduct(key: string): boolean {
  return SUBSCRIPTION_PRODUCT_KEYS.has(key);
}
