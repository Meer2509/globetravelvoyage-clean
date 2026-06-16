import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { TrustBadge } from "@/components/TrustBadge";
import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";
import { fetchMarketplaceStats } from "@/lib/supabase/marketplace-stats";
import { formatStatsForHero } from "@/lib/marketplace-stats-display";

export const metadata: Metadata = {
  title: "About Globe Travel Voyage",
  description:
    "Globe Travel Voyage is an AI-first global travel marketplace for visas, flights, tours, rentals and more — built on verification and transparency.",
};

const values = [
  { title: "AI-first", text: "We use AI to simplify complex travel decisions — visas, budgets, routes and itineraries." },
  { title: "Verified & transparent", text: "Identity-checked providers and honest reviews, with clear disclaimers everywhere." },
  { title: "Global & inclusive", text: "Built for travelers worldwide, with a focus on Middle East, South & Southeast Asia and the West." },
];

export default async function AboutPage() {
  const { trustItems } = await loadCatalogBundle();
  const marketplaceStats = await fetchMarketplaceStats();
  const stats = formatStatsForHero(marketplaceStats);

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Your AI travel command center"
        subtitle="Globe Travel Voyage is an independent, AI-powered global travel marketplace where you can search, plan, apply, book, compare and get help for almost every travel-related service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="section">
        <div className="container-px grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="h-section">Our mission</h2>
            <p className="mt-4 text-navy/70">
              Travel is full of friction — confusing visa rules, scattered bookings,
              and uncertainty about who to trust. We bring it all together into one
              premium, AI-powered platform, and connect you with verified human
              experts when you need them.
            </p>
            <p className="mt-4 text-navy/70">
              We believe in honesty over hype. That&apos;s why we&apos;re clear about what we
              are — a marketplace and guidance platform — and what we&apos;re not.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <p className="text-3xl font-extrabold text-blue">{s.value}</p>
                <p className="mt-1 text-sm text-navy/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader eyebrow="What we value" title="Principles that guide us" center />
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <h3 className="text-lg font-bold text-navy">{v.title}</h3>
                <p className="mt-2 text-sm text-navy/60">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Trust & safety" title="How we keep you protected" center />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((t) => (
              <TrustBadge key={t.title} icon={t.icon} title={t.title} text={t.text} />
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <Disclaimer />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
