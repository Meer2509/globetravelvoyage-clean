import type { MarketplaceStats } from "@/lib/supabase/marketplace-stats";

export function formatStatsForHero(stats: MarketplaceStats): Array<{ value: string; label: string; icon: string }> {
  if (!stats.isLive || stats.verifiedProviders === 0) {
    return [
      { value: "Open", label: "Verified provider onboarding open", icon: "🚀" },
      { value: "—", label: "Reviews appear after completed bookings", icon: "⭐" },
      { value: "Live", label: "Secure requests reviewed by specialists", icon: "✨" },
      { value: "0", label: "Verified providers", icon: "✅" },
    ];
  }

  return [
    { value: String(stats.verifiedProviders), label: "Verified providers", icon: "✅" },
    { value: String(stats.visaExperts), label: "Visa experts", icon: "🛂" },
    { value: String(stats.completedBookings), label: "Completed bookings", icon: "📋" },
    {
      value: stats.reviews > 0 ? String(stats.reviews) : "—",
      label: stats.reviews > 0 ? "Platform reviews" : "Reviews appear after completed bookings",
      icon: "⭐",
    },
  ];
}
