"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { FlightOfferList } from "@/components/FlightOfferList";
import { useCatalog } from "@/lib/catalog/context";
import type { Route } from "@/lib/data";
import { SampleCatalogBanner } from "@/components/SampleCatalogBanner";
import { parsePassengerCount } from "@/lib/flights/airport";
import { searchFlightsClient } from "@/lib/flights/search-client";
import type { FlightCabinClass, FlightOffer } from "@/lib/flights/types";

function cabinFromChips(chips: string[]): FlightCabinClass {
  if (chips.includes("Business")) return "business";
  if (chips.includes("Economy")) return "economy";
  return "economy";
}

function filterByChips(flights: FlightOffer[], chips: string[]): FlightOffer[] {
  let list = flights;
  if (chips.includes("Direct only")) list = list.filter((f) => f.stops === 0);
  if (chips.includes("1 stop")) list = list.filter((f) => f.stops === 1);
  return list;
}

export default function FlightsPage() {
  const { cheapRoutes, usaRoutes } = useCatalog();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setHasSearched(true);
    setLoading(true);
    setFallbackMessage(null);
    setFlights([]);

    try {
      const result = await searchFlightsClient({
        origin: values.from ?? "",
        destination: values.to ?? "",
        departureDate: values.depart ?? "",
        passengers: parsePassengerCount(values.travelers),
        cabinClass: cabinFromChips(selectedChips),
      });

      if (!result.ok) {
        setFallbackMessage(result.message);
        setFlights([]);
      } else {
        setFlights(filterByChips(result.flights, selectedChips));
      }
    } finally {
      setLoading(false);
    }
  }

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
            Search live fares from the Gulf to Pakistan, India, the Philippines, Bangladesh and beyond. Request a verified quote — provider confirmation required.
          </p>
        </div>
      </div>

      <div className="container-px space-y-4">
        <SampleCatalogBanner />
        <FilterBar
          fields={[
            { key: "from", placeholder: "From (city or airport, e.g. Dubai (DXB))" },
            { key: "to", placeholder: "To (city or airport, e.g. Karachi (KHI))" },
            { key: "depart", placeholder: "Departure", type: "date" },
            { key: "travelers", placeholder: "Travelers (e.g. 2)" },
          ]}
          chips={["Direct only", "1 stop", "Economy", "Business"]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5">
            <span className="eyebrow mb-1">Live search</span>
            <h2 className="text-xl font-extrabold text-navy">
              Flight results{" "}
              {hasSearched && !loading && !fallbackMessage && (
                <span className="text-sm font-normal text-charcoal/40">({flights.length} offers)</span>
              )}
            </h2>
          </div>

          <FlightOfferList
            flights={hasSearched ? flights : []}
            loading={loading}
            fallbackMessage={hasSearched ? fallbackMessage : null}
          />
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
              Globe Travel Voyage is not an airline or ticketing authority. Live pricing is sourced via Duffel.
              Request a verified quote — provider confirmation required before booking.
              We do not guarantee ticket prices or availability.
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
