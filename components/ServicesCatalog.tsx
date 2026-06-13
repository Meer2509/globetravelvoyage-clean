import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import { FreeFeatureCard } from "@/components/FreeFeatureCard";
import { TierBadge } from "@/components/TierBadge";
import {
  PROVIDER_FREE_FEATURES,
  TRAVELER_FREE_FEATURES,
} from "@/lib/launch-pricing";
import {
  SERVICE_CATEGORIES,
  getProductsByCategory,
  type CheckoutProductKey,
} from "@/lib/stripe/products";

const CATEGORY_ANCHOR: Record<string, string> = {
  "Traveler Premium": "premium",
  "Provider Featured": "featured",
};

export function ServicesCatalog({ keys }: { keys?: CheckoutProductKey[] }) {
  if (keys?.length) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keys.map((key) => (
          <ServiceCard key={key} productKey={key} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <section id="free-traveler" className="scroll-mt-28">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-navy">For travelers</h2>
          <TierBadge tier="free" />
        </div>
        <p className="mb-5 text-sm text-muted">
          Everything you need to explore, plan, and connect — free during launch.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAVELER_FREE_FEATURES.map((f) => (
            <FreeFeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </section>

      <section id="free-provider" className="scroll-mt-28">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-navy">For providers</h2>
          <TierBadge tier="free" />
        </div>
        <p className="mb-5 text-sm text-muted">
          List your business, receive leads, and manage your dashboard at no cost.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDER_FREE_FEATURES.map((f) => (
            <FreeFeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </section>

      {SERVICE_CATEGORIES.map((category) => {
        const products = getProductsByCategory(category);
        const anchor = CATEGORY_ANCHOR[category] ?? category.toLowerCase();
        const tier = category === "Provider Featured" ? "featured" : "premium";
        return (
          <section key={category} id={anchor} className="scroll-mt-28">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-navy">{category}</h2>
              <TierBadge tier={tier} />
            </div>
            <p className="mb-5 text-sm text-muted">
              {tier === "premium"
                ? "Optional upgrades for expert help and premium itineraries."
                : "Grow faster with featured placement and verified trust badges."}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ServiceCard key={p.key} productKey={p.key} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ServicesLaunchTrustBar() {
  const items = [
    "Secure checkout powered by Stripe",
    "Case tracking for paid visa services",
    "Provider review process",
    "No visa approval guarantee",
    "Transparent pricing",
  ];
  return (
    <div className="mb-8 rounded-xl border border-gold/25 bg-gradient-to-r from-navy/5 via-white to-gold/5 px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-navy mb-3">Trust at launch</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-charcoal/75">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <span className="text-gold" aria-hidden>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StripeTrustBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-soft-200 bg-white px-4 py-3 text-center text-sm text-muted ${className}`}>
      <span className="font-semibold text-navy">Secure checkout powered by Stripe</span>
      {" "}— only for optional premium and featured upgrades.
    </div>
  );
}

export function ServicesPageHeader() {
  return (
    <div className="bg-hero-gradient py-14">
      <div className="container-px">
        <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
          ← Home
        </Link>
        <span className="eyebrow-white mb-3">Launch pricing</span>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Start free. Upgrade when ready.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-dark">
          Core travel tools and provider accounts are free. Premium consultations, AI itineraries, and featured listings are optional upgrades.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="#free-traveler" className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:border-gold hover:bg-white/15 transition-colors">
            Free for travelers
          </a>
          <a href="#free-provider" className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:border-gold hover:bg-white/15 transition-colors">
            Free for providers
          </a>
          <a href="#premium" className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:border-gold hover:bg-white/15 transition-colors">
            Premium
          </a>
          <a href="#featured" className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:border-gold hover:bg-white/15 transition-colors">
            Featured
          </a>
        </div>
      </div>
    </div>
  );
}
