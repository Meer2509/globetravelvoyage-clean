import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { cruises } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cruises, Boats & Ships",
  description:
    "Ocean cruises, river boats, ferries and private yacht charters. Sample listings for demonstration.",
};

export default function CruisesPage() {
  return (
    <>
      <PageHeader
        eyebrow="On the water"
        title="Cruises, boats & ships"
        subtitle="Ocean cruises, river boats, coastal ferries and private yacht charters across the Gulf, Mediterranean and Asia."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cruises" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "Region or port" },
            { placeholder: "Departure", type: "date" },
            { placeholder: "Guests" },
          ]}
          chips={["Cruise", "Yacht", "Boat", "Ferry", "Day charter", "Multi-night"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Set sail" title="Featured cruises & charters" />
          <ListingGrid
            items={cruises.map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.name,
              subtitle: `${c.type} · ${c.region}`,
              price: c.priceFrom,
              priceNote: c.nights > 0 ? `${c.nights} nights` : "Day charter",
              tags: c.highlights,
              ctaLabel: "View",
            }))}
          />
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
