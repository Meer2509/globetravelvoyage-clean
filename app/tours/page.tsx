import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { tours, tickets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Local Tours & Experiences",
  description:
    "Guided experiences led by verified local tour guides, plus skip-the-line attraction tickets. Sample listings for demonstration.",
};

export default function ToursPage() {
  return (
    <>
      <PageHeader
        eyebrow="Experiences"
        title="Local tours led by verified guides"
        subtitle="Discover cities, food, heritage and adventure with identity-checked local guides — plus attraction tickets."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tours" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "City or experience" },
            { placeholder: "Date", type: "date" },
            { placeholder: "Travelers" },
          ]}
          chips={["Food", "Heritage", "Adventure", "City tour", "Half day", "Full day"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Top rated" title="Featured tours" />
          <ListingGrid
            items={tours.map((t) => ({
              id: t.id,
              emoji: t.emoji,
              title: t.title,
              subtitle: `${t.city}, ${t.country} · ${t.duration}`,
              price: t.price,
              priceNote: "per person",
              rating: t.rating,
              reviews: t.reviews,
              tags: [`Guide: ${t.guide}`],
              ctaLabel: "Book tour",
            }))}
          />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Skip the line"
            title="Attraction tickets"
            linkHref="/tickets"
            linkLabel="All tickets"
          />
          <ListingGrid
            columns={3}
            items={tickets.slice(0, 3).map((t) => ({
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

      <CTASection
        title="Are you a local tour guide?"
        subtitle="List your tours, set pricing and availability, and grow your reviews on Globe Travel Voyage."
        primary={{ label: "Become a guide", href: "/register" }}
        secondary={{ label: "View verified guides", href: "/agents" }}
      />
    </>
  );
}
