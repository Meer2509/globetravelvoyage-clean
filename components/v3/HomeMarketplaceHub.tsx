import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Icon } from "@/components/Icon";
import { CONCIERGE_PATH } from "@/lib/v3/concierge-config";
import { EMPTY_MARKETPLACE_LABEL } from "@/lib/launch-trust";
import type { V3MarketplaceCounts } from "@/lib/v3/marketplace-counts";

const MARKETPLACES = [
  {
    key: "concierge" as const,
    title: "AI Concierge",
    description: "One conversation for visas, itineraries, flights, documents, and expert handoff.",
    href: CONCIERGE_PATH,
    icon: "sparkles" as const,
    accent: "from-gold/25 to-gold/5",
    badge: "Live",
  },
  {
    key: "visas" as const,
    title: "Visa Services",
    description: "AI-guided requirements, country guides, and verified visa experts.",
    href: "/visa",
    icon: "visa" as const,
    accent: "from-gold/25 to-gold/5",
  },
  {
    key: "flights" as const,
    title: "Flights & Flight Concierge",
    description: "Live fare search and verified quote requests from premium providers.",
    href: "/flights",
    icon: "flight" as const,
    accent: "from-blue/20 to-blue/5",
  },
  {
    key: "properties" as const,
    title: "Property Marketplace",
    description: "Luxury rentals, furnished stays, and investment listings worldwide.",
    href: "/properties",
    icon: "property" as const,
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    key: "agents" as const,
    title: "Travel Agents",
    description: "Verified agents for bespoke itineraries, visas, and group travel.",
    href: "/travel-agents",
    icon: "agent" as const,
    accent: "from-purple-500/20 to-purple-500/5",
  },
  {
    key: "tours" as const,
    title: "Group Tours",
    description: "Curated guided departures and premium group experiences.",
    href: "/group-tours",
    icon: "tour" as const,
    accent: "from-orange-400/20 to-orange-400/5",
  },
  {
    key: "community" as const,
    title: "Travel Community",
    description: "Free traveler stories, destination tips, and real messaging with experts.",
    href: "/community",
    icon: "users" as const,
    accent: "from-blue/15 to-gold/5",
    badge: "Live",
  },
] as const;

function countBadge(
  key: (typeof MARKETPLACES)[number]["key"],
  counts: V3MarketplaceCounts
): { text: string; isEmpty: boolean } | null {
  if (!counts.isLive && key !== "concierge" && key !== "community") return null;

  switch (key) {
    case "concierge":
      return { text: "Live", isEmpty: false };
    case "flights":
      return {
        text: counts.flightSearchLive ? "Live fare search" : "Quote requests open",
        isEmpty: false,
      };
    case "visas":
      return counts.verifiedVisaExperts > 0
        ? {
            text: `${counts.verifiedVisaExperts} verified expert${counts.verifiedVisaExperts === 1 ? "" : "s"}`,
            isEmpty: false,
          }
        : { text: EMPTY_MARKETPLACE_LABEL, isEmpty: true };
    case "properties":
      return counts.approvedProperties > 0
        ? {
            text: `${counts.approvedProperties} approved listing${counts.approvedProperties === 1 ? "" : "s"}`,
            isEmpty: false,
          }
        : { text: EMPTY_MARKETPLACE_LABEL, isEmpty: true };
    case "agents":
      return counts.verifiedTravelAgents > 0
        ? {
            text: `${counts.verifiedTravelAgents} verified agent${counts.verifiedTravelAgents === 1 ? "" : "s"}`,
            isEmpty: false,
          }
        : { text: EMPTY_MARKETPLACE_LABEL, isEmpty: true };
    case "tours":
      return counts.activeGroupTours > 0
        ? {
            text: `${counts.activeGroupTours} active departure${counts.activeGroupTours === 1 ? "" : "s"}`,
            isEmpty: false,
          }
        : { text: EMPTY_MARKETPLACE_LABEL, isEmpty: true };
    case "community":
      return { text: "Free to join", isEmpty: false };
    default:
      return null;
  }
}

export function HomeMarketplaceHub({ counts }: { counts: V3MarketplaceCounts }) {
  return (
    <section id="marketplaces" className="section bg-white">
      <div className="container-px">
        <SectionHeader
          eyebrow="Live at launch"
          title="Seven ways to plan, book, and connect"
          subtitle="AI concierge, visas, flights, properties, travel agents, group tours, and community — all in one platform."
          center
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MARKETPLACES.map((item) => {
            const badgeInfo = countBadge(item.key, counts);
            const staticBadge = "badge" in item ? item.badge : null;

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
                  {(badgeInfo || staticBadge) && (
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        badgeInfo?.isEmpty
                          ? "bg-soft text-charcoal/55"
                          : "bg-gold/10 text-gold"
                      }`}
                    >
                      {badgeInfo?.text ?? staticBadge}
                    </span>
                  )}
                  <h3 className="mt-3 text-lg font-extrabold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                    Explore
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-charcoal/50">
          Hotels, cruises, car rentals, and more —{" "}
          <Link href="/future-services" className="font-semibold text-navy hover:underline">
            request via concierge
          </Link>
        </p>
      </div>
    </section>
  );
}
