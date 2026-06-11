import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer Terms — Globe Travel Voyage",
};

export default function CustomerTermsPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/terms" className="text-sm text-charcoal/50 hover:text-navy">← Legal</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Customer Terms</h1>
        <div className="prose-navy mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>
            These terms apply when you use Globe Travel Voyage as a traveler or customer. By creating an account or submitting a request, you agree to these terms in addition to our general{" "}
            <Link href="/legal/terms" className="text-blue font-semibold hover:underline">Terms of Service</Link>.
          </p>
          <h2 className="text-lg font-bold text-navy pt-2">Your account</h2>
          <p>You are responsible for keeping your login credentials secure and for activity under your account. Provide accurate contact details so providers and support can reach you.</p>
          <h2 className="text-lg font-bold text-navy pt-2">Requests and bookings</h2>
          <p>Submitting a visa, tour, property, or travel request does not guarantee availability, pricing, or approval. Providers respond independently. Confirm final terms directly with the provider before paying outside the platform.</p>
          <h2 className="text-lg font-bold text-navy pt-2">Payments</h2>
          <p>Platform fees and selected services are processed via Stripe Checkout. See our <Link href="/legal/refund" className="text-blue font-semibold hover:underline">Refund Policy</Link> and <Link href="/legal/cancellation" className="text-blue font-semibold hover:underline">Cancellation Policy</Link>.</p>
          <h2 className="text-lg font-bold text-navy pt-2">Reviews and conduct</h2>
          <p>Reviews must be honest and based on real experiences. We may remove abusive, fraudulent, or misleading content.</p>
          <p className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs">
            Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority. We do not guarantee visa approval, legal outcomes, availability, or ticket prices.
          </p>
        </div>
      </div>
    </div>
  );
}
