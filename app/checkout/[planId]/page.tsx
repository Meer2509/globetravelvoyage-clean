"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPlanById, isPricingPlan } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { Icon } from "@/components/Icon";

// ── Mock card input formatter ─────────────────────────────────────────────────

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ── Trust badges ──────────────────────────────────────────────────────────────

const trustBadges = [
  { icon: "🔒", text: "256-bit SSL encrypted" },
  { icon: "🛡️", text: "Secure checkout" },
  { icon: "↩️", text: "7-day refund policy" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const router = useRouter();
  const plan = getPlanById(planId);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvc, setCvc]               = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [promoCode, setPromoCode]   = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const discount = promoApplied ? Math.round((plan?.price ?? 0) * 0.1) : 0;
  const finalPrice = (plan?.price ?? 0) - discount;

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === "GLOBE10") {
      setPromoApplied(true);
    } else {
      alert("Invalid promo code. Try GLOBE10 for 10% off.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1800));
    router.push(`/checkout/success?plan=${encodeURIComponent(plan?.name ?? "")}&amount=${finalPrice}`);
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft px-5">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-extrabold text-navy">Plan not found</h1>
          <p className="mt-2 text-sm text-charcoal/60">
            The pricing plan you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/pricing" className="btn-primary mt-6 inline-flex py-3 px-6">
            View all plans
          </Link>
        </div>
      </div>
    );
  }

  const planName = plan.name;
  const planEmoji = plan.emoji;
  const planPrice = plan.price;
  const planSuffix = isPricingPlan(plan) ? plan.priceSuffix : "one-time payment";
  const planFeatures = isPricingPlan(plan) ? plan.features : ("includes" in plan ? plan.includes : []);

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px flex items-center justify-between py-4">
          <Link href="/pricing" className="flex items-center gap-2 text-sm text-charcoal/50 hover:text-navy transition-colors">
            <Icon name="check" className="h-4 w-4 rotate-180" />
            Back to pricing
          </Link>
          <Link href="/" className="font-extrabold text-navy text-sm">
            Globe<span className="text-blue">Travel</span><span className="text-gold">Voyage</span>
          </Link>
          <div className="text-xs text-charcoal/40 flex items-center gap-1">
            🔒 Secure checkout
          </div>
        </div>
      </div>

      {/* Demo banner */}
      {!isStripeConfigured && (
        <div className="border-b border-gold/20 bg-gold/5 px-5 py-3 text-center">
          <p className="text-sm text-charcoal/70">
            🔧 <strong>Demo mode</strong> — No real payment will be processed.{" "}
            <Link href="/admin/setup" className="text-blue font-semibold hover:underline">
              Connect Stripe to enable payments →
            </Link>
          </p>
        </div>
      )}

      <div className="container-px py-10">
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── Left: Payment form ── */}
          <div>
            <h1 className="mb-6 text-2xl font-extrabold text-navy">Complete your order</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact */}
              <div className="card p-5">
                <h2 className="mb-4 font-bold text-navy">Contact information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="label">Full name</label>
                    <input className="input" placeholder="Ahmed Khan" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email address</label>
                    <input type="email" className="input" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <p className="mt-1 text-[11px] text-charcoal/40">Receipt and access link will be sent here.</p>
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-navy">Payment details</h2>
                  <div className="flex items-center gap-1.5 text-xl" aria-label="Accepted cards">
                    💳 🏦
                  </div>
                </div>

                {/* Mock card UI — styled like Stripe Elements */}
                <div className="space-y-3">
                  <div>
                    <label className="label">Card number</label>
                    <div className="relative">
                      <input
                        className="input pr-12 font-mono tracking-wider"
                        placeholder="1234 5678 9012 3456"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">💳</span>
                    </div>
                  </div>
                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="label">Expiry date</label>
                      <input
                        className="input font-mono"
                        placeholder="MM/YY"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="label">Security code (CVC)</label>
                      <input
                        className="input font-mono"
                        placeholder="•••"
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-charcoal/40">
                  <span>🔒</span>
                  Your card details are encrypted and never stored on our servers.
                  {!isStripeConfigured && " (Demo mode — no real charges)"}
                </div>
              </div>

              {/* Promo code */}
              <div className="card p-5">
                <h2 className="mb-3 font-bold text-navy text-sm">Promo code</h2>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Enter promo code (try GLOBE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoApplied || !promoCode.trim()}
                    className="btn-outline px-4 py-2.5 text-sm disabled:opacity-40"
                  >
                    {promoApplied ? "Applied ✓" : "Apply"}
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-xs text-emerald-600 font-semibold">
                    🎉 GLOBE10 applied — 10% discount!
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-4 text-base font-extrabold disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Processing payment…
                  </span>
                ) : (
                  <>🔒 Pay ${finalPrice} {isStripeConfigured ? "now" : "(Demo)"}</>
                )}
              </button>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-charcoal/40">
                {trustBadges.map((b) => (
                  <span key={b.text} className="flex items-center gap-1">
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>
            </form>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="h-fit space-y-4 lg:sticky lg:top-20">
            <div className="card p-5">
              <h2 className="mb-4 font-bold text-navy">Order summary</h2>

              <div className="flex items-start gap-3 border-b border-soft-200 pb-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-2xl">
                  {planEmoji}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-navy text-sm">{planName}</p>
                  <p className="text-xs text-charcoal/50">{planSuffix}</p>
                </div>
                <p className="font-extrabold text-navy">${planPrice}</p>
              </div>

              {planFeatures.length > 0 && (
                <div className="border-b border-soft-200 py-3">
                  <p className="mb-2 text-xs font-semibold text-charcoal/50 uppercase tracking-wide">Includes</p>
                  <ul className="space-y-1.5">
                    {planFeatures.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-charcoal/65">
                        <span className="text-blue text-sm mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-charcoal/60">
                  <span>Subtotal</span>
                  <span>${planPrice}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo (GLOBE10)</span>
                    <span>−${discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal/60">
                  <span>Tax / VAT</span>
                  <span className="text-xs text-charcoal/40">Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-extrabold text-navy border-t border-soft-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>${finalPrice}</span>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="rounded-xl border border-soft-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-bold text-navy text-sm">7-day money-back guarantee</p>
                  <p className="mt-1 text-xs text-charcoal/55">
                    Not satisfied? Contact support within 7 days for a full refund on eligible services. Terms apply.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-charcoal/40 text-center leading-relaxed px-2">
              By completing your purchase you agree to our{" "}
              <Link href="/legal/terms" className="underline hover:text-navy">Terms</Link>,{" "}
              <Link href="/legal/privacy" className="underline hover:text-navy">Privacy Policy</Link>{" "}
              and{" "}
              <Link href="/legal/disclaimer" className="underline hover:text-navy">Disclaimer</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
