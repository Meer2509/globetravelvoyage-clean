import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { tickets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Attraction Tickets — Skip the Line",
  description:
    "Skip-the-line tickets to top global attractions, landmarks and museums. Sample listings for demonstration.",
};

export default function TicketsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Attractions"
        title="Attraction tickets, skip the line"
        subtitle="Book entry to landmarks, museums and family attractions worldwide. Sample prices for demonstration."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tickets" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "City or attraction" },
            { placeholder: "Date", type: "date" },
            { placeholder: "Tickets" },
          ]}
          chips={["Landmark", "Museum", "Family", "Heritage", "Skip the line"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Popular" title="Featured attraction tickets" />
          <ListingGrid
            items={tickets.map((t) => ({
              id: t.id,
              emoji: t.emoji,
              title: t.attraction,
              subtitle: `${t.city} · ${t.category}`,
              price: t.price,
              priceNote: "per ticket",
              tags: t.skipLine ? ["Skip the line"] : ["Standard entry"],
              ctaLabel: "Get tickets",
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
