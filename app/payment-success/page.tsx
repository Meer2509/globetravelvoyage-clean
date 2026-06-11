"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isStripeConfigured } from "@/lib/stripe";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(Boolean(sessionId && isStripeConfigured));
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("Your purchase");
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (!sessionId || !isStripeConfigured) {
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          paid?: boolean;
          productName?: string;
          amount?: number | null;
          currency?: string;
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "Could not verify payment.");
          return;
        }
        if (data.productName) setProductName(data.productName);
        if (data.amount != null) setAmount(data.amount);
        if (data.currency) setCurrency(data.currency);
        if (!data.paid) setError("Payment was not completed. Contact support if you were charged.");
      })
      .catch(() => setError("Could not verify payment status."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const formattedAmount =
    amount != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
      : null;

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="eyebrow mb-4">Order confirmed</span>
      <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Payment successful!</h1>

      {loading ? (
        <p className="mt-4 text-sm text-charcoal/55">Verifying your payment…</p>
      ) : (
        <p className="mt-4 text-charcoal/60 leading-relaxed">
          Thank you! Your order for <strong className="text-navy">{productName}</strong>
          {formattedAmount ? ` (${formattedAmount})` : ""} has been confirmed.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isStripeConfigured && (
        <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/60">
          Stripe is not configured — this page is shown for preview only.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link href="/dashboard/customer" className="btn-primary py-3 px-6">
          Open my dashboard
        </Link>
        <Link href="/checkout" className="btn-outline py-3 px-6 text-sm">
          Browse more services
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-soft py-16 px-5">
      <Suspense fallback={<div className="skeleton mx-auto h-64 max-w-lg rounded-2xl" />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
