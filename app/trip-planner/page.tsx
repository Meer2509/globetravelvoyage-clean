import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { AIPlanner } from "@/components/AIPlanner";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { packages } from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Trip Planner — Plan by Budget & Days",
  description:
    "Tell the AI your destination, budget and travel days, and get a budget breakdown, day-by-day itinerary and visa reminders. Estimates only.",
};

export default function TripPlannerPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI trip planner"
        title="Plan your whole trip by budget & days"
        subtitle="Our AI splits your budget across flights, stays, food, tours and transport, drafts a day-by-day itinerary and flags the visa steps you'll need."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trip Planner" }]}
      />

      <section className="section">
        <div className="container-px">
          <AIPlanner />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Ready-made"
            title="Vacation packages from verified agencies"
            subtitle="Prefer a done-for-you trip? Explore curated packages including flights, stays and tours."
            linkHref="/agencies"
            linkLabel="View agencies"
          />
          <ListingGrid
            columns={4}
            items={packages.map((p) => ({
              id: p.id,
              emoji: p.emoji,
              title: p.title,
              subtitle: `${p.destinations} · ${p.nights} nights`,
              price: p.price,
              priceNote: "per person",
              tags: p.includes,
              ctaLabel: "View package",
            }))}
          />
          <div className="mt-8">
            <Disclaimer>
              The AI Trip Planner produces estimates using sample data for guidance
              only. It is not a quote, booking or financial advice, and prices are
              not guaranteed.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
