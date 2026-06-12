"use client";

import { use } from "react";
import Link from "next/link";
import { getPlanById, isPricingPlan } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { checkoutProductKeyForPlan } from "@/lib/stripe/plan-map";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { Icon } from "@/components/Icon";

export default function CheckoutPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const plan = getPlanById(planId);

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-extrabold text-navy">Plan not found</h1>
          <p className="mt-2 text-sm text-charcoal/60">The pricing plan you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/pricing" className="btn-primary mt-6 inline-flex py-3 px-6">
            View all plans
          </Link>
        </div>
      </div>
    );
  }

  const planEmoji = plan.emoji;
  const planPrice = plan.price;
  const planSuffix = isPricingPlan(plan) ? plan.priceSuffix : "one-time payment";
  const planFeatures = isPricingPlan(plan) ? plan.features : ("includes" in plan ? plan.includes : []);
  const stripeProductKey = checkoutProductKeyForPlan(planId);

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px flex items-center justify-between py-4">
          <Link href="/pricing" className="flex items-center gap-2 text-sm text-charcoal/50 hover:text-navy transition-colors">
            <Icon name="check" className="h-4 w-4 rotate-180" />
            Back to pricing
          </Link>
          <p className="text-xs text-charcoal/40">🔒 Stripe secure checkout</p>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h1 className="mb-2 text-2xl font-extrabold text-navy">Complete your order</h1>
            <p className="mb-6 text-sm text-charcoal/55">
              Payments are processed securely via Stripe Checkout. You will be redirected to Stripe to enter card details.
            </p>

            {!isStripeConfigured ? (
              <div className="card p-6 border border-gold/25 bg-gold/5">
                <p className="font-bold text-navy">Stripe is not configured yet</p>
                <p className="mt-2 text-sm text-charcoal/60">
                  Add Stripe keys in your environment to enable payments. No demo card form is shown — only real Stripe checkout is supported.
                </p>
                <Link href="/admin/setup" className="btn-primary mt-4 inline-flex px-5 py-2.5 text-sm">
                  View setup guide
                </Link>
              </div>
            ) : stripeProductKey ? (
              <div className="card p-6">
                <StripeCheckoutButton
                  productKey={stripeProductKey}
                  label={`Pay $${planPrice} with Stripe`}
                  fullWidth
                />
                <p className="mt-3 text-xs text-charcoal/45">
                  Secure checkout powered by Stripe. Payment records save to Supabase automatically.
                </p>
              </div>
            ) : (
              <div className="card p-6">
                <p className="text-sm text-charcoal/60">This plan is not mapped to a Stripe product yet.</p>
                <Link href="/services" className="btn-primary mt-4 inline-flex px-5 py-2.5 text-sm">
                  Browse all services
                </Link>
              </div>
            )}
          </div>

          <div className="h-fit lg:sticky lg:top-20">
            <div className="card p-5">
              <div className="flex items-center gap-3 border-b border-soft-200 pb-4">
                <span className="text-3xl">{planEmoji}</span>
                <div>
                  <p className="font-extrabold text-navy">{plan.name}</p>
                  <p className="text-sm text-charcoal/50">{planSuffix}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-charcoal/65">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-soft-200 pt-4">
                <span className="font-bold text-navy">Total</span>
                <span className="text-2xl font-extrabold text-navy">${planPrice}</span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-charcoal/40">
              <Link href="/legal/payment-terms" className="hover:underline">Payment terms</Link>
              {" · "}
              <Link href="/legal/refund" className="hover:underline">Refund policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
