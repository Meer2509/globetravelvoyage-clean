import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Icon } from "@/components/Icon";
import type { V3MarketplaceCounts } from "@/lib/v3/marketplace-counts";

const MARKETPLACES = [
  {
    key: "flights" as const,
    title: "Flights",
    description: "Compare live routes and request verified quotes from premium providers.",
    href: "/flights",
    icon: "flight" as const,
    accent: "from-blue/20 to-blue/5",
  },
  {
    key: "visas" as const,
    title: "Visas",
    description: "AI-guided requirements, country guides and verified visa experts.",
    href: "/visa",
    icon: "visa" as const,
    accent: "from-gold/25 to-gold/5",
  },
  {
    key: "properties" as const,
    title: "Properties",
    description: "Luxury rentals, furnished stays and investment listings worldwide.",
    href: "/properties",
    icon: "property" as const,
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    key: "agents" as const,
    title: "Travel Agents",
    description: "Verified agents for bespoke itineraries, visas and group travel.",
    href: "/travel-agents",
    icon: "agent" as const,
    accent: "from-purple-500/20 to-purple-500/5",
  },
  {
    key: "tours" as const,
    title: "Group Tours",
    description: "Curated guided experiences, day trips and premium group departures.",
    href: "/group-tours",
    icon: "tour" as const,
    accent: "from-orange-400/20 to-orange-400/5",
  },
] as const;

function countBadge(key: (typeof MARKETPLACES)[number]["key"], counts: V3MarketplaceCounts): string | null {
  if (!counts.isLive) return null;

  switch (key) {
    case "flights":
      return counts.flightSearchLive ? "Live fare search active" : "Quote requests open";
    case "visas":
      return counts.verifiedVisaExperts > 0
        ? `${counts.verifiedVisaExperts} verified expert${counts.verifiedVisaExperts === 1 ? "" : "s"}`
        : "Expert applications open";
    case "properties":
      return counts.approvedProperties > 0
        ? `${counts.approvedProperties} approved listing${counts.approvedProperties === 1 ? "" : "s"}`
        : "Be the first — list your property";
    case "agents":
      return counts.verifiedTravelAgents > 0
        ? `${counts.verifiedTravelAgents} verified agent${counts.verifiedTravelAgents === 1 ? "" : "s"}`
        : "Agent onboarding open";
    case "tours":
      return counts.activeGroupTours > 0
        ? `${counts.activeGroupTours} active tour${counts.activeGroupTours === 1 ? "" : "s"}`
        : "New departures coming soon";
    default:
      return null;
  }
}

export function HomeMarketplaceHub({ counts }: { counts: V3MarketplaceCounts }) {
  return (
    <section id="marketplaces" className="section bg-white">
      <div className="container-px">
        <SectionHeader
          eyebrow="Verified marketplaces"
          title="Everything your concierge connects to"
          subtitle="Flights, visas, properties, agents and group tours — real providers, real inquiries, no demo data."
          center
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETPLACES.map((item) => {
            const badge = countBadge(item.key, counts);
            const isEmpty =
              (item.key === "properties" && counts.approvedProperties === 0) ||
              (item.key === "agents" && counts.verifiedTravelAgents === 0) ||
              (item.key === "tours" && counts.activeGroupTours === 0) ||
              (item.key === "visas" && counts.verifiedVisaExperts === 0);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-soft-200 bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-[var(--shadow-premium)]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-gold">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  {badge && (
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        isEmpty
                          ? "bg-soft text-charcoal/55"
                          : "bg-gold/10 text-gold"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                  <h3 className="mt-3 text-lg font-extrabold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                    Browse {item.title.toLowerCase()}
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            );
          })}

          <div className="relative overflow-hidden rounded-2xl border border-dashed border-gold/35 bg-gold/5 p-6 sm:col-span-2 lg:col-span-1">
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              V3 Phase 3
            </span>
            <h3 className="mt-3 text-lg font-extrabold text-navy">Reviews & Community</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              Cross-marketplace reputation and traveler community — launching in upcoming V3 phases.
            </p>
            <Link href="/travel-agents" className="mt-4 inline-flex text-sm font-semibold text-blue hover:underline">
              See verified agent reviews →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
