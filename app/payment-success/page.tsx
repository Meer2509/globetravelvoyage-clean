"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isStripeConfigured } from "@/lib/stripe";

interface VerifyData {
  paid?: boolean;
  productName?: string;
  productKey?: string;
  amount?: number | null;
  currency?: string;
  bookingId?: string;
  paymentId?: string;
  visaApplicationId?: string;
  visaCaseId?: string;
  caseNumber?: string;
  invoiceNumber?: string;
  hasVisaCase?: boolean;
  isVisaService?: boolean;
  error?: string;
}

function PaymentSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(Boolean(sessionId && isStripeConfigured));
  const [error, setError] = useState("");
  const [data, setData] = useState<VerifyData | null>(null);

  useEffect(() => {
    if (!sessionId || !isStripeConfigured) {
      setLoading(false);
      return;
    }

    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const json = (await res.json()) as VerifyData;
        if (!res.ok) {
          setError(json.error ?? "Could not verify payment.");
          return;
        }
        setData(json);
        if (!json.paid) setError("Payment was not completed. Contact support if you were charged.");
      })
      .catch(() => setError("Could not verify payment status."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const formattedAmount =
    data?.amount != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: data.currency ?? "USD",
        }).format(data.amount)
      : null;

  const steps = [
    { label: "Payment confirmed", done: data?.paid },
    {
      label: data?.caseNumber ? `Visa case ${data.caseNumber} created` : data?.hasVisaCase ? "Visa case created" : "Service activated",
      done: data?.paid && Boolean(data?.paymentId),
    },
    {
      label: data?.isVisaService ? "Upload documents when ready" : "Access your dashboard",
      done: data?.paid,
    },
  ];

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-12">
        <div className="container-px text-center">
          <p className="eyebrow-white mb-2">Payment confirmed</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Thank you for your purchase
          </h1>
        </div>
      </div>

      <div className="container-px -mt-8 pb-16 max-w-2xl mx-auto">
        <div className="card overflow-hidden shadow-[var(--shadow-premium)]">
          <div className="bg-gradient-to-br from-emerald-50 to-white px-8 py-10 text-center border-b border-soft-200">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50">
              <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {loading ? (
              <p className="text-muted">Confirming your payment…</p>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-navy">Payment successful</h2>
                <p className="mt-2 text-muted">
                  {data?.productName ?? "Your purchase"}
                  {formattedAmount ? ` · ${formattedAmount}` : ""}
                </p>
                {data?.invoiceNumber && (
                  <p className="mt-2 font-mono text-xs text-muted">Invoice {data.invoiceNumber}</p>
                )}
                {data?.caseNumber && (
                  <p className="mt-3 font-mono text-sm font-bold text-navy">Case {data.caseNumber}</p>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="mx-8 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && data?.paid && (
            <div className="px-8 py-8 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-4">Order summary</p>
                <div className="rounded-xl bg-soft p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Service</span>
                    <span className="font-semibold text-navy">{data.productName}</span>
                  </div>
                  {formattedAmount && (
                    <div className="flex justify-between">
                      <span className="text-muted">Amount</span>
                      <span className="font-semibold text-navy">{formattedAmount}</span>
                    </div>
                  )}
                  {data.caseNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted">Case number</span>
                      <span className="font-mono font-semibold text-navy">{data.caseNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-4">Next steps</p>
                <ul className="space-y-3">
                  {steps.map((s) => (
                    <li key={s.label} className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          s.done ? "bg-emerald-100 text-emerald-700" : "bg-soft text-muted"
                        }`}
                      >
                        {s.done ? "✓" : "·"}
                      </span>
                      <span className={s.done ? "font-semibold text-navy" : "text-muted"}>{s.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted leading-relaxed">
                Secure checkout powered by Stripe. Visa approval is never guaranteed. A confirmation email will be sent when configured.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                {data.hasVisaCase ? (
                  <Link href="/dashboard/customer?tab=visa-case" className="btn-primary flex-1 py-3.5 text-center">
                    Open My Visa Case
                  </Link>
                ) : (
                  <Link href="/dashboard/customer" className="btn-primary flex-1 py-3.5 text-center">
                    Open dashboard
                  </Link>
                )}
                {data.hasVisaCase && (
                  <Link href="/dashboard/customer?tab=documents" className="btn-gold flex-1 py-3.5 text-center">
                    Upload documents
                  </Link>
                )}
              </div>

              {data.paymentId && (
                <p className="text-center">
                  <a
                    href={`/api/receipt/${data.paymentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue hover:underline"
                  >
                    Download receipt →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Secure checkout powered by Stripe · Questions?{" "}
          <Link href="/support" className="text-blue hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft flex items-center justify-center"><div className="skeleton h-64 w-full max-w-lg rounded-2xl" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
