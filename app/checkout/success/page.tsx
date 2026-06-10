"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const planName = params.get("plan") ?? "Your purchase";
  const amount = params.get("amount") ?? "";

  return (
    <div className="mx-auto max-w-lg text-center">
      {/* Animated checkmark */}
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="eyebrow mb-4">Order confirmed</span>
      <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Payment successful!</h1>

      <p className="mt-4 text-charcoal/60 leading-relaxed">
        Thank you! Your order for <strong className="text-navy">{planName}</strong>
        {amount ? ` ($${amount})` : ""} has been confirmed.
        {" "}A receipt has been sent to your email.
      </p>

      {/* Order details */}
      <div className="mt-6 rounded-2xl border border-soft-200 bg-white p-5 text-left">
        <h2 className="font-bold text-navy mb-3">What happens next?</h2>
        <ul className="space-y-3">
          {[
            { emoji: "📧", text: "Check your email for your receipt and access link" },
            { emoji: "🔑", text: "Access your purchase from your customer dashboard" },
            { emoji: "🤖", text: "AI features are available immediately after purchase" },
            { emoji: "👔", text: "Expert consultations will be scheduled within 24 hours" },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-3 text-sm text-charcoal/65">
              <span className="text-xl">{item.emoji}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Demo notice */}
      <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-3">
        <p className="text-xs text-charcoal/60">
          🔧 <strong>Demo mode</strong> — No real payment was processed. This is a preview of the payment success flow.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link href="/dashboard/customer" className="btn-primary py-3 px-6">
          Open my dashboard
        </Link>
        <Link href="/pricing" className="btn-outline py-3 px-6 text-sm">
          Browse more services
        </Link>
      </div>

      <p className="mt-6 text-xs text-charcoal/40">
        Order ID: GTV-{Math.random().toString(36).slice(2, 10).toUpperCase()} ·{" "}
        Questions?{" "}
        <Link href="/contact" className="text-blue hover:underline">Contact support</Link>
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-soft py-16 px-5">
      <Suspense fallback={<div className="skeleton mx-auto h-64 max-w-lg rounded-2xl" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
