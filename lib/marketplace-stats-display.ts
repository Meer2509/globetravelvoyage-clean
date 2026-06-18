import type { MarketplaceStats } from "@/lib/supabase/marketplace-stats";
import { EMPTY_MARKETPLACE_LABEL } from "@/lib/launch-trust";

export function formatStatsForHero(stats: MarketplaceStats): Array<{ value: string; label: string; icon: string }> {
  if (!stats.isLive || stats.verifiedProviders === 0) {
    return [
      { value: "Live", label: "AI concierge & verified marketplaces", icon: "✨" },
      { value: "Open", label: EMPTY_MARKETPLACE_LABEL, icon: "🚀" },
      { value: "Secure", label: "Specialist-reviewed requests", icon: "🔒" },
      { value: "50+", label: "Visa guides", icon: "🛂" },
    ];
  }

  return [
    { value: String(stats.verifiedProviders), label: "Verified providers", icon: "✅" },
    { value: String(stats.visaExperts), label: "Visa experts", icon: "🛂" },
    { value: String(stats.completedBookings), label: "Completed bookings", icon: "📋" },
    {
      value: stats.reviews > 0 ? String(stats.reviews) : "New",
      label: stats.reviews > 0 ? "Platform reviews" : "Trust built on completed trips",
      icon: "⭐",
    },
  ];
}
