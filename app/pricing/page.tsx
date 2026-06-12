import type { Metadata } from "next";
import Link from "next/link";
import { pricingPlans, pricingBundles, planCategories, commissionRates } from "@/lib/pricing";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing — Globe Travel Voyage",
  description: "Transparent pricing for AI visa guidance, trip planning, expert consultations, featured listings and more.",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  Visa: "🛂",
  Travel: "✈️",
  Property: "🏠",
  AI: "🤖",
  Marketplace: "⭐",
};

function PlanCard({ plan }: { plan: (typeof pricingPlans)[0] }) {
  return (
    <div className={`card card-hover flex flex-col p-6 ${plan.popular ? "ring-2 ring-blue shadow-[var(--shadow-glow)]" : ""}`}>
      {plan.badge && (
        <span className={`mb-3 w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${
          plan.popular ? "bg-blue text-white" : "bg-gold/15 text-gold"
        }`}>
          {plan.badge}
        </span>
      )}

      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-2xl">
          {plan.emoji}
        </span>
        <div>
          <h3 className="font-extrabold text-navy">{plan.name}</h3>
          <p className="mt-0.5 text-xs text-charcoal/55">{plan.description}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-navy">${plan.price}</span>
        <span className="text-sm text-charcoal/50">{plan.priceSuffix}</span>
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-charcoal/70">
            <span className="mt-0.5 text-blue text-sm">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout/${plan.id}`}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
          plan.popular
            ? "bg-navy text-white hover:bg-navy-800 shadow-[0_6px_20px_-6px_rgba(8,28,58,0.4)]"
            : "border border-navy/20 bg-white text-navy hover:bg-soft hover:border-navy/40"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-hero-gradient py-16 sm:py-20">
        <div className="container-px text-center">
          {!isStripeConfigured && (
            <div className="mx-auto mb-6 flex max-w-lg items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3">
              <span className="text-lg">🔧</span>
              <p className="text-sm text-white/70">
                Stripe not connected — payments unavailable.{" "}
                <Link href="/admin/setup" className="font-semibold text-gold hover:underline">
                  View setup guide →
                </Link>
              </p>
            </div>
          )}
          <span className="eyebrow-white mb-4">Transparent pricing</span>
          <h1 className="h-hero text-white">
            Simple, honest{" "}
            <span className="text-gradient-gold">pricing</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
            Pay only for what you use. No subscriptions required for traveler services.
            Expert and agency features are available monthly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">✓ No hidden fees</span>
            <span className="flex items-center gap-1.5">✓ Instant access</span>
            <span className="flex items-center gap-1.5">✓ Cancel anytime</span>
            <span className="flex items-center gap-1.5">✓ Secure payments</span>
          </div>
        </div>
      </section>

      {/* ── Bundles ── */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="text-center mb-10">
            <span className="eyebrow mb-3">Best value</span>
            <h2 className="h-section">Service bundles — save up to 36%</h2>
            <p className="mt-3 text-charcoal/55 max-w-xl mx-auto text-sm">
              Bundle popular services for significant savings. Perfect for first-time travelers or growing agencies.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingBundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`card card-hover flex flex-col p-6 ${bundle.popular ? "ring-2 ring-blue shadow-[var(--shadow-glow)]" : ""}`}
              >
                {bundle.popular && (
                  <span className="mb-3 w-fit rounded-full bg-blue px-3 py-0.5 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-2xl">
                    {bundle.emoji}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-navy">{bundle.name}</h3>
                    <p className="text-xs text-charcoal/50">{bundle.tagline}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-navy">${bundle.price}</span>
                  <span className="text-sm line-through text-charcoal/35">${bundle.originalPrice}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {bundle.badge}
                  </span>
                </div>
                <p className="mb-4 text-xs text-charcoal/50">one-time payment</p>

                <ul className="flex-1 space-y-2">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-charcoal/70">
                      <span className="text-blue text-sm mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/checkout/${bundle.id}`}
                  className={`mt-5 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition-all ${
                    bundle.popular
                      ? "bg-gold text-navy hover:bg-gold-light shadow-[var(--shadow-gold)]"
                      : "bg-navy text-white hover:bg-navy-800"
                  }`}
                >
                  Get {bundle.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Individual plans by category ── */}
      {planCategories.map((category) => {
        const plans = pricingPlans.filter((p) => p.category === category);
        return (
          <section key={category} className="section">
            <div className="container-px">
              <div className="mb-8 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/8 text-xl">
                  {CATEGORY_EMOJI[category] ?? "📦"}
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-navy">{category} Services</h2>
                  <p className="text-sm text-charcoal/50">{plans.length} service{plans.length !== 1 ? "s" : ""} available</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Referral commissions ── */}
      <section className="section bg-hero-gradient">
        <div className="container-px">
          <div className="text-center mb-10">
            <span className="eyebrow-white mb-3">Earn while you share</span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Referral commission rates
            </h2>
            <p className="mt-3 text-white/55 text-sm max-w-lg mx-auto">
              Share Globe Travel Voyage with friends, travelers and businesses — earn commission on every qualifying action.
            </p>
          </div>

          <div className="mx-auto max-w-3xl grid gap-3 sm:grid-cols-2">
            {commissionRates.map((r) => (
              <div key={r.service} className="card-dark rounded-2xl p-4 flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                  {r.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{r.service}</p>
                  <p className="text-xs text-white/50">{r.condition}</p>
                </div>
                <span className="text-gold font-extrabold text-lg">{r.rate}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/referrals" className="btn-gold py-3 px-8">
              View my referral dashboard
            </Link>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-white/15 bg-white/5 p-4 text-xs text-white/40 text-center leading-relaxed">
            Referral commissions are credits subject to full program terms, verification, minimum payout thresholds and fraud review. Rates shown are illustrative and may change without notice. This is not investment or income advice.
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section bg-soft/50">
        <div className="container-px max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-navy mb-8 text-center">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is payment required to use Globe Travel Voyage?",
                a: "No. Core features like browsing visa guides, exploring destinations and contacting providers are free. Premium services like AI-generated plans, expert consultations and featured listings require payment.",
              },
              {
                q: "When will Stripe payment be available?",
                a: "Platform fees and selected services are processed via Stripe Checkout when Stripe is configured. You will see a secure Stripe payment page before any charge is made.",
              },
              {
                q: "Are refunds available?",
                a: "We offer refunds within 7 days for AI plans and document checklists if the content is incorrect. Consultations are non-refundable once completed. Lead credits are non-refundable after delivery.",
              },
              {
                q: "Can I use the platform without paying?",
                a: "Yes. Travelers can browse, compare and contact providers for free. Paid services unlock premium AI guidance, guaranteed deliveries and featured placements.",
              },
              {
                q: "Are there subscription plans?",
                a: "Featured agency and expert listings are monthly subscriptions. All traveler services are pay-per-use with no monthly commitment.",
              },
            ].map((faq) => (
              <div key={faq.q} className="card p-5">
                <h3 className="font-bold text-navy text-sm">{faq.q}</h3>
                <p className="mt-2 text-sm text-charcoal/65 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Disclaimer className="container-px py-4 text-center">
        Globe Travel Voyage is an independent marketplace platform. We are not a government agency, embassy, immigration lawyer, airline, or real estate broker. No visa approval, travel outcome, or financial return is guaranteed. All prices are indicative and subject to change.
      </Disclaimer>

      <CTASection
        title="Ready to get started?"
        subtitle="Create a free account and access AI-powered travel tools. Upgrade when you need more."
        primary={{ label: "Create free account", href: "/register" }}
        secondary={{ label: "View pricing plans", href: "/pricing" }}
      />
    </>
  );
}
