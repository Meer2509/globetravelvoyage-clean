import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { FreeFeatureCard } from "@/components/FreeFeatureCard";
import { ServiceCard } from "@/components/ServiceCard";
import { TierBadge } from "@/components/TierBadge";
import { getHomeFreeFeatures } from "@/lib/launch-pricing";
import { FEATURED_HOME_PREMIUM_KEYS } from "@/lib/stripe/products";

export function HomeServicesSection() {
  const freeFeatures = getHomeFreeFeatures();

  return (
    <section className="section bg-soft/40">
      <div className="container-px">
        <SectionHeader
          eyebrow="Launch pricing"
          title="Start Free — Upgrade When Ready"
          subtitle="Explore visa guides, plan trips, browse providers, and request quotes at no cost. Premium upgrades are optional when you need expert help or featured visibility."
          linkHref="/services"
          linkLabel="View all services"
          center
        />

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <TierBadge tier="free" />
          <TierBadge tier="premium" />
          <TierBadge tier="featured" />
        </div>

        <div className="mb-10">
          <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-muted">
            Free for travelers & providers
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {freeFeatures.map((f) => (
              <FreeFeatureCard key={f.title} feature={f} compact />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-muted">
            Optional premium upgrades
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_HOME_PREMIUM_KEYS.map((key) => (
              <ServiceCard key={key} productKey={key} compact />
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Secure checkout powered by Stripe — only when you choose to upgrade.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/register" className="btn-primary px-8 py-3">
            Create free account
          </Link>
          <Link href="/services#premium" className="btn-outline px-8 py-3">
            Explore premium options
          </Link>
        </div>
      </div>
    </section>
  );
}
