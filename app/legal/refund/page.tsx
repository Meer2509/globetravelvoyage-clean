import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — Globe Travel Voyage",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/terms" className="text-sm text-charcoal/50 hover:text-navy">← Legal</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Refund Policy</h1>
        <div className="prose-navy mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>Refunds for platform services paid via Stripe Checkout are handled on a case-by-case basis within 7 days of purchase if the service has not been substantially delivered.</p>
          <p>Third-party travel services (flights, hotels, tours, visas) are subject to each provider&apos;s own refund and cancellation terms. Globe Travel Voyage does not control provider refunds.</p>
          <p>Contact <Link href="/support" className="text-blue font-semibold hover:underline">support</Link> with your payment reference for refund requests.</p>
          <p className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs">
            Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority. We do not guarantee visa approval, legal outcomes, availability, or ticket prices.
          </p>
        </div>
      </div>
    </div>
  );
}
