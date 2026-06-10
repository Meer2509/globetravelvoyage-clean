import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { agencies, packages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Verified Travel Agencies & Packages",
  description:
    "Discover verified travel agencies and their vacation packages, tickets and tours. Transparent reviews and verification badges.",
};

export default function AgenciesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Verified agencies"
        title="Travel agencies you can trust"
        subtitle="Verified agencies offering packages, tickets, tours and visa support — with verification badges and transparent reviews."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Agencies" }]}
      />

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Top agencies" title="Browse verified agencies" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {agencies.map((a) => (
              <MarketplaceCard
                key={a.id}
                initials={a.initials}
                name={a.name}
                subtitle={`${a.city}, ${a.country}`}
                rating={a.rating}
                reviews={a.reviews}
                verified={a.verified}
                tags={a.services}
                meta={`${a.packages} active packages`}
                ctaLabel="View agency"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Curated trips"
            title="Vacation packages"
            linkHref="/trip-planner"
            linkLabel="Plan your own"
          />
          <ListingGrid
            columns={4}
            items={packages.map((p) => ({
              id: p.id,
              emoji: p.emoji,
              title: p.title,
              subtitle: `${p.agency} · ${p.nights} nights`,
              price: p.price,
              priceNote: "per person",
              tags: p.includes,
              ctaLabel: "View package",
            }))}
          />
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection
        title="Grow your travel agency with us"
        subtitle="List packages, tickets and tours, manage leads and bookings, and earn a verification badge."
        primary={{ label: "Register your agency", href: "/register" }}
        secondary={{ label: "Open agency dashboard", href: "/dashboard/agency" }}
      />
    </>
  );
}
