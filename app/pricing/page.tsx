import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { TierBadge } from "@/components/TierBadge";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { StripeTrustBanner } from "@/components/ServicesCatalog";

export const metadata: Metadata = {
  title: "Pricing — Globe Travel Voyage",
  description:
    "Free travel tools for everyone. Premium AI concierge plans, human planning, and featured marketplace placement — secure Stripe checkout.",
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container-px text-center">
          <span className="eyebrow-white mb-4">V3 Premium</span>
          <h1 className="h-hero text-white">
            Plans built for{" "}
            <span className="text-gradient-gold">real travelers & experts</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
            Start free. Upgrade only when you need smarter AI, white-glove planning, or featured marketplace visibility. Every charge goes through secure Stripe — success is confirmed only after payment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <TierBadge tier="free" />
            <TierBadge tier="premium" />
            <TierBadge tier="featured" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px max-w-6xl">
          <PricingPlans />
          <StripeTrustBanner className="mt-12" />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-navy">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "When am I charged?",
                a: "Only after you click upgrade and complete Stripe Checkout. The success page confirms payment via our server — never a fake success screen.",
              },
              {
                q: "What's included in Free Traveler?",
                a: "AI concierge (basic), up to 3 saved trips, community access, browsing verified experts, and basic inquiries — no credit card required.",
              },
              {
                q: "Can I cancel AI Concierge Plus or Agent Pro?",
                a: "Subscriptions are managed through Stripe. Contact support and we will help you cancel before your next billing period.",
              },
              {
                q: "How do featured listings work?",
                a: "One-time featured purchases activate for 30 days on your agent profile, property, or group tour. Admin can review and manage featured status.",
              },
            ].map((faq) => (
              <div key={faq.q} className="card p-5">
                <h3 className="text-sm font-bold text-navy">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Disclaimer className="container-px py-4 text-center">
        Payments are processed by Stripe. Globe Travel Voyage does not store card numbers. Visa approval is never guaranteed.
      </Disclaimer>

      <CTASection
        title="Questions about a plan?"
        subtitle="Our team can help you choose the right upgrade for your trip or business."
        primary={{ label: "Contact support", href: "/support" }}
        secondary={{ label: "Try free concierge", href: "/concierge" }}
      />
    </>
  );
}
