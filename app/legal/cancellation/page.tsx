import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation Policy — Globe Travel Voyage",
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/terms" className="text-sm text-charcoal/50 hover:text-navy">← Legal</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Cancellation Policy</h1>
        <div className="mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>You may cancel a pending booking or lead request before a provider confirms it by contacting support or updating status in your dashboard when available.</p>
          <p>Confirmed third-party bookings follow the cancellation rules of the airline, hotel, tour operator, or agency involved.</p>
          <p>Featured listings and subscription services may be cancelled before renewal; access continues until the paid period ends.</p>
          <p className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs">
            Globe Travel Voyage is not a government agency, embassy, immigration lawyer, airline, cruise company, travel supplier, real estate broker, or official visa authority.
          </p>
        </div>
      </div>
    </div>
  );
}
