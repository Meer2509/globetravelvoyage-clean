import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { cars } from "@/lib/data";

export const metadata: Metadata = {
  title: "Car Rentals — Self-Drive & Chauffeur",
  description:
    "Rent economy to luxury cars with or without a driver in 90+ countries. Sample listings for demonstration.",
};

export default function CarRentalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Car rentals"
        title="Self-drive & chauffeur car rentals"
        subtitle="From economy hatchbacks to luxury sedans and vans — with or without a driver."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Car Rentals" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "Pick-up city" },
            { placeholder: "Pick-up date", type: "date" },
            { placeholder: "Return date", type: "date" },
          ]}
          chips={["Economy", "SUV", "Luxury", "Van", "With driver", "Self-drive"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Available now" title="Featured cars" />
          <ListingGrid
            items={cars.map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.model,
              subtitle: `${c.category} · ${c.city}`,
              price: c.pricePerDay,
              priceNote: "per day",
              tags: [
                `${c.seats} seats`,
                c.transmission,
                c.withDriver ? "With driver" : "Self-drive",
              ],
              ctaLabel: "Reserve",
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
