import type { MarketplaceStats } from "@/lib/supabase/marketplace-stats";

export function formatStatsForHero(stats: MarketplaceStats): Array<{ value: string; label: string; icon: string }> {
  if (!stats.isLive || stats.verifiedProviders === 0) {
    return [
      { value: "Open", label: "Provider onboarding", icon: "🚀" },
      { value: "190+", label: "Countries covered", icon: "🌍" },
      { value: "Live", label: "Verified marketplace", icon: "✅" },
      { value: "0", label: "Reviews (growing)", icon: "⭐" },
    ];
  }

  return [
    { value: String(stats.verifiedProviders), label: "Verified providers", icon: "✅" },
    { value: String(stats.visaExperts), label: "Visa experts", icon: "🛂" },
    { value: String(stats.completedBookings), label: "Completed bookings", icon: "📋" },
    {
      value: stats.reviews > 0 ? String(stats.reviews) : "0",
      label: stats.reviews > 0 ? "Platform reviews" : "Reviews after bookings",
      icon: "⭐",
    },
  ];
}
