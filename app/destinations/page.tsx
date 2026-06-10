import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { Icon } from "@/components/Icon";
import { destinations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Luxury Destinations — Explore the World",
  description:
    "Discover top global travel destinations from Dubai to Switzerland, Maldives to Pakistan. Visa info, best times and flight prices for every destination.",
};

const categories = ["All", "City", "Beach", "Culture", "Adventure", "Religious"] as const;

export default function DestinationsPage() {
  const categoryGroups: Record<string, typeof destinations> = {};
  for (const cat of categories.slice(1)) {
    categoryGroups[cat] = destinations.filter((d) => d.category === cat);
  }

  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Explore luxury destinations worldwide"
        subtitle="From the glittering towers of Dubai to the peaks of the Swiss Alps, from Maldivian overwater villas to the spiritual serenity of Makkah — discover where to go next."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
      />

      <section className="section">
        <div className="container-px">
          {/* All destinations grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((d) => (
              <div key={d.city} className="card card-hover group overflow-hidden">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-navy/8 to-blue/8 text-6xl transition-transform duration-300 group-hover:scale-105">
                  {d.emoji}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-navy">{d.city}</h3>
                      <p className="text-xs text-charcoal/50">{d.country}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[10px] font-medium text-charcoal/60">
                      {d.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-charcoal/65">{d.tagline}</p>

                  {/* Highlights */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.highlights.slice(0, 2).map((h) => (
                      <span key={h} className="chip text-xs">{h}</span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-soft-200 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/50">Flights from</span>
                      <span className="font-bold text-navy">{d.fromPrice}</span>
                    </div>
                    {d.visaRequired && (
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal/50">Visa</span>
                        <span className="text-navy/80">{d.visaRequired}</span>
                      </div>
                    )}
                    {d.bestTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal/50">Best time</span>
                        <span className="text-navy/80">{d.bestTime}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/flights" className="btn-primary py-2 text-xs text-center">
                      Flights
                    </Link>
                    <Link href="/visa" className="btn-outline py-2 text-xs text-center">
                      Visa guide
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      {Object.entries(categoryGroups).map(([cat, dests]) =>
        dests.length === 0 ? null : (
          <section key={cat} className="section bg-soft">
            <div className="container-px">
              <SectionHeader
                eyebrow={cat}
                title={`${cat} destinations`}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dests.map((d) => (
                  <div key={d.city} className="card flex gap-5 p-5">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy/8 to-blue/8 text-4xl">
                      {d.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-navy">{d.city}, {d.country}</h3>
                      <p className="mt-0.5 text-sm text-charcoal/60">{d.tagline}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="font-semibold text-blue">from {d.fromPrice}</span>
                        {d.bestTime && (
                          <>
                            <span className="text-charcoal/30">·</span>
                            <span className="text-charcoal/55">Best: {d.bestTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* AI Planner CTA */}
      <section className="section">
        <div className="container-px">
          <div className="overflow-hidden rounded-3xl bg-hero-gradient p-8 text-white sm:p-12">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <span className="eyebrow-gold">
                  <Icon name="sparkles" className="h-3.5 w-3.5" /> AI trip planner
                </span>
                <h2 className="mt-4 text-3xl font-extrabold">
                  Know your destination. Let AI plan the rest.
                </h2>
                <p className="mt-3 text-base text-white/70">
                  Enter your destination, budget and travel days — our AI builds a
                  complete itinerary with flights, hotels, tours, restaurants and visa steps.
                </p>
                <Link href="/trip-planner" className="btn-gold mt-6 px-6 py-3">
                  Open AI Planner
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center text-7xl opacity-40">
                🗺️
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
