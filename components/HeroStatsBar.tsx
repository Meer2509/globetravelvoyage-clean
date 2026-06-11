import { fetchMarketplaceStats } from "@/lib/supabase/marketplace-stats";
import { formatStatsForHero } from "@/lib/marketplace-stats-display";

export async function HeroStatsBar() {
  const stats = await fetchMarketplaceStats();
  const items = formatStatsForHero(stats);

  return (
    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-gold/20 hover:bg-white/8"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <span className="text-2xl">{s.icon}</span>
          <p className="mt-1 text-2xl font-extrabold text-gold sm:text-3xl">{s.value}</p>
          <p className="mt-0.5 text-xs text-muted-dark">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
