import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { FreeFeatureCard } from "@/components/FreeFeatureCard";
import { ServiceCard } from "@/components/ServiceCard";
import { TierBadge } from "@/components/TierBadge";
import { StripeTrustBanner } from "@/components/ServicesCatalog";
import {
  PROVIDER_FREE_FEATURES,
  TRAVELER_FREE_FEATURES,
} from "@/lib/launch-pricing";
import { SERVICES_CATALOG_KEYS } from "@/lib/stripe/products";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing — Globe Travel Voyage",
  description: "Free travel tools and provider accounts at launch. Optional premium upgrades for expert help and featured visibility.",
};

export default function PricingPage() {
  const premiumKeys = SERVICES_CATALOG_KEYS.filter((k) =>
    ["usa_visa_consultation", "usa_b1b2_document_review", "full_visa_application_support", "premium_ai_trip_plan", "concierge_travel_planning"].includes(k)
  );
  const featuredKeys = SERVICES_CATALOG_KEYS.filter((k) =>
    ["expert_featured_listing", "agency_featured_listing", "verified_badge_fee", "homepage_placement"].includes(k)
  );

  return (
    <>
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container-px text-center">
          {!isStripeConfigured && (
            <div className="mx-auto mb-6 flex max-w-lg items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3">
              <span className="text-lg">🔧</span>
              <p className="text-sm text-white/70">
                Premium checkout unavailable until Stripe is configured.{" "}
                <Link href="/admin/setup" className="font-semibold text-gold hover:underline">
                  View setup guide →
                </Link>
              </p>
            </div>
          )}
          <span className="eyebrow-white mb-4">Launch pricing</span>
          <h1 className="h-hero text-white">
            Start free.{" "}
            <span className="text-gradient-gold">Upgrade when ready.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
            Grow users and providers fast with free core tools. Revenue comes from optional premium services — never required to get started.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <TierBadge tier="free" />
            <TierBadge tier="premium" />
            <TierBadge tier="featured" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px max-w-5xl">
          <div className="mb-8 text-center">
            <TierBadge tier="free" className="mb-3" />
            <h2 className="h-section">Free for travelers</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              Account, planning, guides, and quote requests — no credit card needed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRAVELER_FREE_FEATURES.map((f) => (
              <FreeFeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/40">
        <div className="container-px max-w-5xl">
          <div className="mb-8 text-center">
            <TierBadge tier="free" className="mb-3" />
            <h2 className="h-section">Free for providers</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              List your business, add up to 3 services, and receive leads at no cost.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROVIDER_FREE_FEATURES.map((f) => (
              <FreeFeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px max-w-5xl">
          <div className="mb-8 text-center">
            <TierBadge tier="premium" className="mb-3" />
            <h2 className="h-section">Traveler premium</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              Optional expert help and premium AI when you need more than free tools.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {premiumKeys.map((key) => (
              <ServiceCard key={key} productKey={key} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/40">
        <div className="container-px max-w-5xl">
          <div className="mb-8 text-center">
            <TierBadge tier="featured" className="mb-3" />
            <h2 className="h-section">Provider featured</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              Stand out with featured placement, verified badges, and homepage visibility.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredKeys.map((key) => (
              <ServiceCard key={key} productKey={key} />
            ))}
          </div>
          <StripeTrustBanner className="mt-8" />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-navy">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Do I need to pay to use Globe Travel Voyage?",
                a: "No. Creating an account, browsing providers, using visa guides, the basic AI planner, and requesting quotes are all free at launch.",
              },
              {
                q: "What is Premium vs Featured?",
                a: "Premium is for travelers who want expert visa help or a full AI itinerary. Featured is for providers who want more visibility — featured listings, verified badges, and homepage placement.",
              },
              {
                q: "When does Stripe charge me?",
                a: "Only when you explicitly choose a premium or featured upgrade. You are redirected to secure Stripe Checkout before any charge.",
              },
              {
                q: "Can providers list services for free?",
                a: "Yes. Provider accounts, basic profiles, up to 3 services, dashboards, and lead delivery are free during launch.",
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
        Globe Travel Voyage is an independent marketplace platform. Free features and premium upgrades are subject to change as the platform grows.
      </Disclaimer>

      <CTASection
        title="Start free today"
        subtitle="Create your account and explore the platform. Upgrade only when you need premium help or featured visibility."
        primary={{ label: "Create free account", href: "/register" }}
        secondary={{ label: "Browse all services", href: "/services" }}
      />
    </>
  );
}
