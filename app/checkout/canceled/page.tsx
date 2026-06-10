import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Canceled — Globe Travel Voyage",
};

export default function CheckoutCanceledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-soft px-5 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-soft-200 text-5xl">
          ✋
        </div>

        <h1 className="text-3xl font-extrabold text-navy">Payment canceled</h1>
        <p className="mt-4 text-charcoal/60 leading-relaxed">
          Your payment was not completed and you have not been charged. You can go back and try again whenever you&apos;re ready.
        </p>

        <div className="mt-6 rounded-2xl border border-soft-200 bg-white p-5 text-left">
          <h2 className="mb-3 font-bold text-navy">Having trouble?</h2>
          <ul className="space-y-2 text-sm text-charcoal/65">
            <li className="flex items-start gap-2">
              <span className="text-blue">•</span>
              Check that your card details are correct and the card has sufficient funds
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue">•</span>
              Try a different card or payment method
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue">•</span>
              Contact your bank if the issue persists
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue">•</span>
              <Link href="/contact" className="text-blue hover:underline">
                Contact our support team
              </Link>{" "}
              for assistance
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/pricing" className="btn-primary py-3 px-6">
            Back to pricing
          </Link>
          <Link href="/" className="btn-outline py-3 px-6 text-sm">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
