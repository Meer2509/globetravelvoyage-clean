import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { properties } from "@/lib/data";

export const metadata: Metadata = {
  title: "Properties — Rent, Buy & Travel Stays",
  description:
    "Houses and apartments for rent or sale, plus travel stay rentals. We are not a real estate broker — listings connect you with hosts and sellers.",
};

export default function PropertiesPage() {
  const rentals = properties.filter((p) => p.listingType !== "For Sale");
  const sales = properties.filter((p) => p.listingType === "For Sale");

  return (
    <>
      <PageHeader
        eyebrow="Properties"
        title="Rent, buy/sell & travel stays"
        subtitle="Houses and apartments for rent or sale, plus short and long-term travel stays. We connect you with hosts and sellers — we are not a real estate broker."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Properties" }]}
      />

      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "City or area" },
            { placeholder: "Min price" },
            { placeholder: "Max price" },
            { placeholder: "Bedrooms" },
          ]}
          chips={["For rent", "For sale", "Travel stay", "Apartment", "House", "Villa"]}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Rentals & stays" title="Homes for rent & travel stays" />
          <ListingGrid
            items={rentals.map((p) => ({
              id: p.id,
              emoji: p.emoji,
              title: p.title,
              subtitle: `${p.city}, ${p.country}`,
              price: p.price,
              badge: p.listingType,
              tags: [`${p.beds} bd`, `${p.baths} ba`, p.area],
              ctaLabel: "Contact host",
            }))}
          />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Buy & sell"
            title="Property for sale"
            subtitle="Submit a buying or selling inquiry — sellers and hosts respond directly through lead forms."
          />
          <ListingGrid
            columns={3}
            items={sales.map((p) => ({
              id: p.id,
              emoji: p.emoji,
              title: p.title,
              subtitle: `${p.city}, ${p.country}`,
              price: p.price,
              badge: p.listingType,
              tags: [`${p.beds} bd`, `${p.baths} ba`, p.area],
              ctaLabel: "Inquire",
            }))}
          />
          <div className="mt-8">
            <Disclaimer>
              Globe Travel Voyage is not a real estate broker, agent or legal
              advisor. Property listings are provided by hosts and sellers. Always
              perform your own due diligence and verify ownership and terms
              independently before any payment.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="List your property for rent or sale"
        subtitle="Create a host account to publish listings, capture leads and manage inquiries."
        primary={{ label: "Become a host", href: "/register" }}
        secondary={{ label: "Open host dashboard", href: "/dashboard/agency" }}
      />
    </>
  );
}
