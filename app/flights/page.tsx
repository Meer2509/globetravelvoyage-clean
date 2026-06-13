"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { Icon } from "@/components/Icon";
import { flights, cheapRoutes, usaRoutes } from "@/lib/data";
import { SampleCatalogBanner } from "@/components/SampleCatalogBanner";
import { SamplePrice } from "@/components/PriceEstimateLabel";

type Flight = (typeof flights)[0];
type Route  = (typeof cheapRoutes)[0];

export default function FlightsPage() {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedRoute, setSelectedRoute]   = useState<Route | null>(null);
  const [search, setSearch]     = useState({ from: "", to: "" });
  const [chips, setChips]       = useState<string[]>([]);

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch({ from: values["from"] ?? "", to: values["to"] ?? "" });
    setChips(selectedChips);
  }

  const filteredFlights = useMemo(() => {
    let list = flights;
    if (search.from.trim()) {
      const q = search.from.toLowerCase();
      list = list.filter((f) => f.from.toLowerCase().includes(q));
    }
    if (search.to.trim()) {
      const q = search.to.toLowerCase();
      list = list.filter((f) => f.to.toLowerCase().includes(q));
    }
    if (chips.includes("Direct only")) list = list.filter((f) => f.stops === "Non-stop");
    if (chips.includes("1 stop"))      list = list.filter((f) => f.stops.includes("1"));
    if (chips.includes("Economy"))     list = list.filter((f) => f.cabin === "Economy");
    if (chips.includes("Business"))    list = list.filter((f) => f.cabin.toLowerCase().includes("business"));
    return list;
  }, [search, chips]);

  const flightLabel = (f: Flight) =>
    `${f.airline} · ${f.from} → ${f.to} · ${f.depart}–${f.arrive} · ${f.stops}`;

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Flights</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Compare flights across the globe</h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Find budget routes from the Gulf to Pakistan, India, the Philippines, Bangladesh and the West. Sample data — always confirm final prices.
          </p>
        </div>
      </div>

      <div className="container-px space-y-4">
        <SampleCatalogBanner />
        <FilterBar
          fields={[
            { key: "from",     placeholder: "From (city or airport)" },
            { key: "to",       placeholder: "To (city or airport)" },
            { key: "depart",   placeholder: "Departure", type: "date" },
            { key: "travelers", placeholder: "Travelers" },
          ]}
          chips={["Direct only", "1 stop", "Economy", "Business"]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5">
            <span className="eyebrow mb-1">Sample results</span>
            <h2 className="text-xl font-extrabold text-navy">
              Popular flights{" "}
              <span className="text-sm font-normal text-charcoal/40">({filteredFlights.length} results)</span>
            </h2>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">✈️</span>
              <p className="font-semibold text-navy">No flights match your search</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different airports or remove filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFlights.map((f) => (
                <div
                  key={f.id}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:shadow-[var(--shadow-premium)] transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <Icon name="flight" className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-bold text-navy">{f.airline}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="chip text-[10px]">{f.cabin}</span>
                        {f.stops === "Non-stop" && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Direct</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-navy">{f.depart}</p>
                      <p className="text-xs text-navy/50">{f.from}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-navy/45">{f.duration}</p>
                      <div className="relative my-1 flex items-center">
                        <div className="h-px w-16 bg-soft-200" />
                        <svg className="absolute left-1/2 -translate-x-1/2 h-3 w-3 text-navy/30" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                      </div>
                      <p className="text-xs text-navy/50">{f.stops}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-navy">{f.arrive}</p>
                      <p className="text-xs text-navy/50">{f.to}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <SamplePrice value={f.price} size="md" />
                    <button
                      onClick={() => setSelectedFlight(f)}
                      className="btn-blue px-5 py-2 text-sm"
                    >
                      Select flight
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cheap routes */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="mb-6">
            <span className="eyebrow mb-1">Hot routes</span>
            <h2 className="text-xl font-extrabold text-navy">Cheapest: Middle East → Asia</h2>
            <p className="text-sm text-charcoal/50">Budget routes to Pakistan, India, the Philippines and Bangladesh.</p>
          </div>
          <ListingGrid
            columns={4}
            items={cheapRoutes.map((r) => ({
              id: r.id,
              emoji: "✈️",
              title: `${r.from} → ${r.to}`,
              subtitle: `${r.fromCode} – ${r.toCode} · ${r.stops}`,
              price: r.priceFrom,
              priceNote: r.duration,
              badge: r.tag,
              tags: r.airlines,
              ctaLabel: "View deal",
            }))}
            onCta={(id) => {
              const route = cheapRoutes.find((r) => r.id === id);
              if (route) setSelectedRoute(route);
            }}
          />
        </div>
      </section>

      {/* USA routes */}
      <section className="section">
        <div className="container-px">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-1">Long-haul focus</span>
              <h2 className="text-xl font-extrabold text-navy">Pakistan → USA routes</h2>
            </div>
            <Link href="/visa/usa-from-pakistan" className="btn-outline py-2 px-4 text-sm">USA visa from Pakistan →</Link>
          </div>
          <ListingGrid
            columns={3}
            items={usaRoutes.map((r) => ({
              id: r.id,
              emoji: "🛫",
              title: `${r.from} → ${r.to}`,
              subtitle: `${r.fromCode} – ${r.toCode} · ${r.stops}`,
              price: r.priceFrom,
              priceNote: r.duration,
              badge: r.tag,
              tags: r.airlines,
              ctaLabel: "View route",
            }))}
            onCta={(id) => {
              const route = usaRoutes.find((r) => r.id === id);
              if (route) setSelectedRoute(route);
            }}
          />
          <div className="mt-8">
            <Disclaimer>
              Globe Travel Voyage is not an airline or ticketing authority. All fares
              are sample estimates and can change at any time. We do not guarantee
              ticket prices or availability.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="Become one of the first verified providers."
        subtitle="Travel agencies and visa experts can list services and receive verified leads from travelers."
        primary={{ label: "Start provider onboarding", href: "/register?role=agent" }}
        secondary={{ label: "Request a flight quote", href: "/booking/request" }}
      />

      {/* Flight request modal */}
      <ContactModal
        open={!!selectedFlight}
        onClose={() => setSelectedFlight(null)}
        mode="buy_ticket"
        subjectName={selectedFlight ? `${selectedFlight.airline} – ${selectedFlight.from} → ${selectedFlight.to}` : undefined}
        subjectMeta={selectedFlight ? `${selectedFlight.depart}–${selectedFlight.arrive} · ${selectedFlight.price}` : undefined}
      />

      {/* Route request modal */}
      <ContactModal
        open={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        mode="buy_ticket"
        subjectName={selectedRoute ? `${selectedRoute.from} → ${selectedRoute.to}` : undefined}
        subjectMeta={selectedRoute ? `From ${selectedRoute.priceFrom} · ${selectedRoute.stops}` : undefined}
      />
    </>
  );
}
