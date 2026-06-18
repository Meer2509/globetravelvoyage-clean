import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Icon } from "@/components/Icon";

const MARKETPLACES = [
  {
    title: "Flights",
    description: "Compare live routes and request verified quotes from premium providers.",
    href: "/flights",
    icon: "flight" as const,
    accent: "from-blue/20 to-blue/5",
  },
  {
    title: "Visas",
    description: "AI-guided requirements, country guides and verified visa experts.",
    href: "/visa",
    icon: "visa" as const,
    accent: "from-gold/25 to-gold/5",
  },
  {
    title: "Properties",
    description: "Luxury rentals, furnished stays and investment listings worldwide.",
    href: "/properties",
    icon: "property" as const,
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    title: "Travel Agents",
    description: "Verified agents for bespoke itineraries, visas and group travel.",
    href: "/travel-agents",
    icon: "agent" as const,
    accent: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "Group Tours",
    description: "Curated guided experiences, day trips and premium group departures.",
    href: "/tours",
    icon: "tour" as const,
    accent: "from-orange-400/20 to-orange-400/5",
  },
] as const;

export function HomeMarketplaceHub() {
  return (
    <section id="marketplaces" className="section bg-white">
      <div className="container-px">
        <SectionHeader
          eyebrow="Verified marketplaces"
          title="Everything your concierge connects to"
          subtitle="Flights, visas, properties, agents and group tours — one premium platform, verified providers, real inquiries."
          center
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETPLACES.map((item) => (
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
                <h3 className="mt-4 text-lg font-extrabold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue">
                  Browse {item.title.toLowerCase()}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </Link>
          ))}

          <div className="relative overflow-hidden rounded-2xl border border-dashed border-gold/35 bg-gold/5 p-6 sm:col-span-2 lg:col-span-1">
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              V3 roadmap
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
