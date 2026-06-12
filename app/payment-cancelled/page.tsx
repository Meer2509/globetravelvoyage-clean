"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import type { CheckoutProductKey } from "@/lib/stripe/products";

function PaymentCancelledContent() {
  const params = useSearchParams();
  const productKey = params.get("product_key") as CheckoutProductKey | null;

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-12">
        <div className="container-px text-center">
          <p className="eyebrow-white mb-2">Checkout interrupted</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">No worries — try again</h1>
        </div>
      </div>

      <div className="container-px -mt-8 pb-16 max-w-lg mx-auto">
        <div className="card p-8 text-center shadow-[var(--shadow-premium)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-4xl">
            ✋
          </div>

          <h2 className="text-2xl font-extrabold text-navy">Your payment was interrupted</h2>
          <p className="mt-4 text-muted leading-relaxed">
            You have not been charged. Your card details were not saved. Resume checkout whenever you&apos;re ready to complete your premium upgrade.
          </p>

          <div className="mt-8 space-y-3">
            {productKey ? (
              <StripeCheckoutButton
                productKey={productKey}
                label="Resume checkout"
                className="btn-primary w-full py-3.5 text-sm"
                fullWidth
              />
            ) : (
              <Link href="/services#premium" className="btn-primary block w-full py-3.5 text-sm">
                Resume checkout
              </Link>
            )}
            <Link href="/services" className="btn-outline block w-full py-3 text-sm">
              Browse services
            </Link>
            <Link href="/dashboard/customer" className="btn-ghost block w-full py-2 text-sm text-muted">
              Return to dashboard
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted">
            Need help? <Link href="/support" className="text-blue hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft flex items-center justify-center"><div className="skeleton h-48 w-full max-w-lg rounded-2xl" /></div>}>
      <PaymentCancelledContent />
    </Suspense>
  );
}
