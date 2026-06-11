"use client";

import Link from "next/link";
import { PayoutSetupPanel } from "@/components/PayoutSetupPanel";

export default function PayoutsPage() {
  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-10">
        <div className="container-px">
          <Link href="/dashboard" className="text-xs text-white/50 hover:text-white/80">← Dashboard</Link>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Provider payouts</h1>
          <p className="mt-1 text-sm text-white/60">Stripe Connect payouts and marketplace payment policy</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-6 max-w-2xl">
        <div className="rounded-xl border border-gold/25 bg-gold/5 px-5 py-4 text-sm text-charcoal/70">
          <p className="font-bold text-navy">Provider payouts are not active yet</p>
          <p className="mt-2">
            The platform currently collects customer payments via Stripe Checkout. Provider payouts through Stripe Connect are coming next.
            You can still list services, receive leads, and track payments in your dashboard.
          </p>
        </div>

        <PayoutSetupPanel />

        <div className="card p-5 text-sm text-charcoal/65 space-y-2">
          <p className="font-bold text-navy">How payments work today</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customers pay platform and provider services through secure Stripe Checkout.</li>
            <li>Payment records are saved in Supabase and appear in your payment history.</li>
            <li>Provider revenue share and automated payouts require Stripe Connect (next phase).</li>
          </ul>
          <Link href="/legal/payment-terms" className="inline-block mt-2 text-blue font-semibold hover:underline text-sm">
            Read payment terms →
          </Link>
        </div>
      </div>
    </div>
  );
}
