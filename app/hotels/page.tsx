import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { stays } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hotels & Apartment Rentals",
  description:
    "Hotels, serviced apartments, villas and long-stay rentals worldwide. Sample listings for demonstration.",
};

export default function HotelsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stays"
        title="Hotels & apartment rentals"
        subtitle="Hotels, serviced apartments, villas and long-stay rentals across the Gulf, South Asia and beyond."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hotels & Stays" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "Destination city" },
            { placeholder: "Check-in", type: "date" },
            { placeholder: "Check-out", type: "date" },
            { placeholder: "Guests" },
          ]}
          chips={["Hotels", "Apartments", "Villas", "Long stay", "Free cancellation"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Available now" title="Featured stays" />
          <ListingGrid
            items={stays.map((s) => ({
              id: s.id,
              emoji: s.emoji,
              title: s.name,
              subtitle: `${s.city}, ${s.country} · ${s.type}`,
              price: s.pricePerNight,
              priceNote: "per night",
              rating: s.rating,
              reviews: s.reviews,
              tags: s.amenities,
              ctaLabel: "View stay",
            }))}
          />
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection
        title="Host your property on Globe Travel Voyage"
        subtitle="List houses, apartments and travel stays, capture leads and manage bookings from your host dashboard."
        primary={{ label: "Become a host", href: "/register" }}
        secondary={{ label: "Browse properties", href: "/properties" }}
      />
    </>
  );
}
