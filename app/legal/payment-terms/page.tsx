import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Terms — Globe Travel Voyage",
};

export default function PaymentTermsPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/terms" className="text-sm text-charcoal/50 hover:text-navy">← Legal</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Payment Terms</h1>
        <div className="prose-navy mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>
            These terms apply to payments made on Globe Travel Voyage through Stripe Checkout for platform services, provider services, and featured listings.
          </p>
          <h2 className="text-lg font-bold text-navy pt-2">Stripe secure checkout</h2>
          <p>
            Payments are processed by Stripe. Card details are entered on Stripe&apos;s hosted checkout page. Globe Travel Voyage does not store full card numbers.
          </p>
          <h2 className="text-lg font-bold text-navy pt-2">What you are paying for</h2>
          <p>Platform fees may include visa consultations, document review, AI trip plans, booking request fees, featured listings, and provider marketplace services listed at checkout.</p>
          <h2 className="text-lg font-bold text-navy pt-2">Provider payouts</h2>
          <p>
            Provider payouts via Stripe Connect are not active yet. The platform collects customer payments today. Automated provider payouts will be introduced in a future release with clear revenue-share terms.
          </p>
          <h2 className="text-lg font-bold text-navy pt-2">Refunds</h2>
          <p>
            See our <Link href="/legal/refund" className="text-blue font-semibold hover:underline">Refund Policy</Link> for platform payment refund requests.
          </p>
          <p className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs">
            Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority.
          </p>
        </div>
      </div>
    </div>
  );
}
