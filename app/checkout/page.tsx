import type { Metadata } from "next";
import Link from "next/link";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { CHECKOUT_PRODUCTS, formatProductPrice } from "@/lib/stripe/products";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout — Globe Travel Voyage",
  description: "Secure Stripe checkout for visa services, AI trip plans, and marketplace listings.",
};

export default function CheckoutHubPage() {
  const categories = [...new Set(CHECKOUT_PRODUCTS.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-soft">
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px flex items-center justify-between py-4">
          <Link href="/pricing" className="text-sm text-charcoal/50 hover:text-navy transition-colors">
            ← Back to pricing
          </Link>
          <p className="text-xs text-charcoal/40">🔒 Stripe Checkout · Test mode safe</p>
        </div>
      </div>

      {!isStripeConfigured && (
        <div className="border-b border-gold/20 bg-gold/5 px-5 py-3 text-center">
          <p className="text-sm text-charcoal/70">
            Stripe keys are not set yet. Add{" "}
            <code className="rounded bg-navy/8 px-1 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
            <code className="rounded bg-navy/8 px-1 text-xs">STRIPE_SECRET_KEY</code> to enable payments.{" "}
            <Link href="/admin/setup" className="font-semibold text-blue hover:underline">
              View setup guide →
            </Link>
          </p>
        </div>
      )}

      <div className="container-px py-10 max-w-4xl">
        <div className="mb-8 text-center">
          <span className="eyebrow mb-3">Secure payments</span>
          <h1 className="text-3xl font-extrabold text-navy">Checkout</h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Pay securely via Stripe Checkout. Use Stripe test card{" "}
            <code className="rounded bg-soft px-1 text-xs">4242 4242 4242 4242</code> in test mode.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-extrabold text-navy">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {CHECKOUT_PRODUCTS.filter((p) => p.category === category).map((product) => (
                  <div key={product.key} className="card flex flex-col p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{product.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-navy">{product.name}</p>
                        <p className="mt-1 text-sm text-charcoal/55">{product.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-soft-200 pt-4">
                      <span className="text-xl font-extrabold text-navy">{formatProductPrice(product)}</span>
                      <StripeCheckoutButton
                        productKey={product.key}
                        label="Pay with Stripe"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
