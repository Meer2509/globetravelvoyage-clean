import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { Icon } from "@/components/Icon";
import { flights, cheapRoutes, usaRoutes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Flights — Compare Cheap Routes Worldwide",
  description:
    "Compare sample flight routes across the Middle East, South Asia, Southeast Asia and the West. Prices are estimates — no price guarantee.",
};

export default function FlightsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flights"
        title="Compare flights across the globe"
        subtitle="Find budget routes from the Gulf to Pakistan, India, the Philippines, Bangladesh and the West. Sample data for demonstration — always confirm final prices."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Flights" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "From (city or airport)" },
            { placeholder: "To (city or airport)" },
            { placeholder: "Departure", type: "date" },
            { placeholder: "Travelers" },
          ]}
          chips={["Direct only", "1 stop", "Economy", "Business", "Refundable"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Sample results"
            title="Popular flights right now"
          />
          <div className="space-y-3">
            {flights.map((f) => (
              <div
                key={f.id}
                className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-navy">
                    <Icon name="flight" className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold text-navy">{f.airline}</p>
                    <p className="text-sm text-navy/55">{f.cabin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-navy">{f.depart}</p>
                    <p className="text-xs text-navy/50">{f.from}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy/45">{f.duration}</p>
                    <div className="my-1 h-px w-16 bg-soft-200" />
                    <p className="text-xs text-navy/50">{f.stops}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-navy">{f.arrive}</p>
                    <p className="text-xs text-navy/50">{f.to}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-xl font-extrabold text-navy">{f.price}</p>
                  <button className="btn-blue px-5 py-2 text-sm">Select</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Hot routes"
            title="Cheapest: Middle East → Asia"
            subtitle="Budget routes to Pakistan, India, the Philippines and Bangladesh."
          />
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
          />
        </div>
      </section>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Long-haul focus"
            title="Pakistan → USA routes"
            linkHref="/visa/usa-from-pakistan"
            linkLabel="USA visa from Pakistan"
          />
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

      <CTASection />
    </>
  );
}
