// =============================================================================
// Globe Travel Voyage — Launch-stage pricing (free-first growth model)
// =============================================================================

export type ServiceTier = "free" | "premium" | "featured";
export type LaunchAudience = "traveler" | "provider";

export interface LaunchFeature {
  title: string;
  description: string;
  emoji: string;
  href: string;
  tier: ServiceTier;
  audience: LaunchAudience;
}

/** Free for travelers at launch */
export const TRAVELER_FREE_FEATURES: LaunchFeature[] = [
  { title: "Create your account", description: "Sign up free and access your personal travel dashboard.", emoji: "👤", href: "/register", tier: "free", audience: "traveler" },
  { title: "Save trips", description: "Bookmark itineraries, properties, and destinations to your account.", emoji: "⭐", href: "/dashboard/customer?tab=saved", tier: "free", audience: "traveler" },
  { title: "Basic AI planner", description: "Generate trip ideas and day-by-day outlines at no cost.", emoji: "🤖", href: "/trip-planner", tier: "free", audience: "traveler" },
  { title: "Visa guides", description: "Country-specific visa guides and embassy fee references.", emoji: "🛂", href: "/visa", tier: "free", audience: "traveler" },
  { title: "Basic visa checklist", description: "Document checklist for popular visa types — free to use.", emoji: "📋", href: "/visa/start", tier: "free", audience: "traveler" },
  { title: "Browse providers", description: "Explore verified visa experts, agencies, guides, and hosts.", emoji: "🔍", href: "/agents", tier: "free", audience: "traveler" },
  { title: "Request quotes", description: "Contact providers for flights, hotels, tours, and stays — no platform fee.", emoji: "💬", href: "/booking/request", tier: "free", audience: "traveler" },
  { title: "Compare providers", description: "Side-by-side ratings, specialties, and response times.", emoji: "⚖️", href: "/agents", tier: "free", audience: "traveler" },
];

/** Free for providers at launch */
export const PROVIDER_FREE_FEATURES: LaunchFeature[] = [
  { title: "Visa expert account", description: "List your visa consultation services and receive leads.", emoji: "👔", href: "/register?role=agent", tier: "free", audience: "provider" },
  { title: "Travel agency account", description: "Showcase packages, tours, and group travel services.", emoji: "🏢", href: "/register?role=agency", tier: "free", audience: "provider" },
  { title: "Guide account", description: "Offer local tours and experiences to travelers worldwide.", emoji: "🧭", href: "/register?role=guide", tier: "free", audience: "provider" },
  { title: "Host account", description: "List properties, rentals, and vacation stays.", emoji: "🏠", href: "/register?role=host", tier: "free", audience: "provider" },
  { title: "Basic profile", description: "Professional profile with photo, bio, and contact details.", emoji: "✨", href: "/dashboard/profile", tier: "free", audience: "provider" },
  { title: "Up to 3 services free", description: "List three services at no cost during the launch period.", emoji: "📦", href: "/dashboard", tier: "free", audience: "provider" },
  { title: "Provider dashboard", description: "Track leads, messages, bookings, and profile performance.", emoji: "📊", href: "/dashboard", tier: "free", audience: "provider" },
  { title: "Receive leads", description: "Get quote requests and inquiries from verified travelers.", emoji: "📩", href: "/dashboard", tier: "free", audience: "provider" },
];

export const HOME_FREE_FEATURE_KEYS = [
  "Create your account",
  "Basic AI planner",
  "Visa guides",
  "Browse providers",
  "Request quotes",
  "Compare providers",
  "Guide account",
  "Receive leads",
] as const;

export function getHomeFreeFeatures(): LaunchFeature[] {
  const all = [...TRAVELER_FREE_FEATURES, ...PROVIDER_FREE_FEATURES];
  return HOME_FREE_FEATURE_KEYS.map((title) => all.find((f) => f.title === title)!).filter(Boolean);
}

export const TIER_LABELS: Record<ServiceTier, string> = {
  free: "FREE",
  premium: "Premium",
  featured: "Featured",
};

export const TIER_STYLES: Record<ServiceTier, string> = {
  free: "bg-emerald-50 text-emerald-700 border-emerald-200",
  premium: "bg-gold/15 text-gold border-gold/30",
  featured: "bg-navy/8 text-navy border-navy/15",
};
