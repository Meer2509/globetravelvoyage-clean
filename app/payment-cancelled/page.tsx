import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Cancelled — Globe Travel Voyage",
};

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-soft-200 text-5xl">
          ✋
        </div>

        <h1 className="text-3xl font-extrabold text-navy">Payment cancelled</h1>
        <p className="mt-4 text-charcoal/60 leading-relaxed">
          Your payment was not completed and you have not been charged. You can return to checkout and try again whenever you&apos;re ready.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/checkout" className="btn-primary py-3 px-6">
            Back to checkout
          </Link>
          <Link href="/pricing" className="btn-outline py-3 px-6 text-sm">
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
