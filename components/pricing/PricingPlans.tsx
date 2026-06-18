"use client";

import Link from "next/link";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { V5_PLANS, type V5Plan } from "@/lib/v5/plans";
import { isStripeConfigured } from "@/lib/stripe";

function PlanCard({ plan }: { plan: V5Plan }) {
  const isFree = plan.billing === "free";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-[var(--shadow-soft)] transition-all ${
        plan.highlighted
          ? "border-gold/50 bg-gradient-to-b from-gold/5 to-white ring-1 ring-gold/20"
          : "border-soft-200 bg-white"
      }`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
          Popular
        </span>
      )}
      <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
        {plan.audience === "traveler" ? "Traveler" : "Provider"}
      </p>
      <h3 className="mt-2 text-xl font-extrabold text-navy">{plan.name}</h3>
      <p className="mt-1 text-sm text-charcoal/55">{plan.tagline}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-navy">{plan.priceLabel}</span>
        {plan.billing === "monthly" && (
          <span className="text-sm text-charcoal/45">/ month</span>
        )}
        {plan.billing === "one_time" && plan.priceLabel !== "Free" && (
          <span className="text-sm text-charcoal/45">one-time</span>
        )}
      </div>
      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-charcoal/70">
            <span className="mt-0.5 text-gold">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        {isFree ? (
          <Link href={plan.ctaHref ?? "/register"} className="btn-outline block w-full py-3 text-center text-sm">
            {plan.ctaLabel}
          </Link>
        ) : plan.productKey && isStripeConfigured ? (
          <StripeCheckoutButton
            productKey={plan.productKey}
            label={plan.ctaLabel}
            fullWidth
            className="btn-gold w-full py-3 text-sm"
          />
        ) : (
          <button type="button" disabled className="btn-outline w-full py-3 text-sm opacity-60">
            Checkout unavailable
          </button>
        )}
      </div>
    </div>
  );
}

export function PricingPlans() {
  const travelerPlans = V5_PLANS.filter((p) => p.audience === "traveler");
  const providerPlans = V5_PLANS.filter((p) => p.audience === "provider");

  return (
    <div className="space-y-16">
      <section>
        <div className="mb-8 text-center">
          <h2 className="h-section">For travelers</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Start free. Upgrade when you want smarter AI, more saves, or human concierge planning.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {travelerPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="h-section">For agents & hosts</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Free profiles and listings. Pay only for pro tools and featured marketplace placement.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {providerPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
}
