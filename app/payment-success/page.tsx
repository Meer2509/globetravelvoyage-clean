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
    { label: "Payment confirmed — receipt saved to your account", done: data?.paid },
    {
      label: data?.hasVisaCase
        ? data.caseNumber
          ? `Visa case ${data.caseNumber} created`
          : "Visa case created — upload documents next"
        : "Service activated in your dashboard",
      done: data?.paid && Boolean(data?.paymentId),
    },
    {
      label: data?.isVisaService
        ? "Upload required documents from your checklist"
        : "Track your service from your dashboard",
      done: false,
    },
    {
      label: "Confirmation email sent when email is configured",
      done: data?.paid,
    },
  ];

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-12 sm:py-16">
        <div className="container-px text-center">
          <p className="eyebrow-white mb-2">Order confirmed</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Payment confirmed</h1>
          <p className="mt-3 text-sm text-white/60 max-w-lg mx-auto">
            Your purchase is active. Secure checkout powered by Stripe.
          </p>
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
            ) : data?.paid ? (
              <>
                <h2 className="text-2xl font-extrabold text-navy">Thank you</h2>
                <p className="mt-2 text-muted">{data.productName}</p>
                {formattedAmount && (
                  <p className="mt-3 text-2xl font-extrabold text-navy">{formattedAmount}</p>
                )}
              </>
            ) : (
              <h2 className="text-xl font-bold text-navy">Awaiting confirmation</h2>
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
                <div className="rounded-xl border border-soft-200 bg-soft/50 p-4 text-sm space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted shrink-0">Service</span>
                    <span className="font-semibold text-navy text-right">{data.productName}</span>
                  </div>
                  {formattedAmount && (
                    <div className="flex justify-between">
                      <span className="text-muted">Amount paid</span>
                      <span className="font-semibold text-navy">{formattedAmount}</span>
                    </div>
                  )}
                  {data.paymentId && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted shrink-0">Payment ID</span>
                      <span className="font-mono text-xs font-semibold text-navy text-right break-all">
                        {data.paymentId}
                      </span>
                    </div>
                  )}
                  {data.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted">Invoice</span>
                      <span className="font-mono font-semibold text-navy">{data.invoiceNumber}</span>
                    </div>
                  )}
                  {data.caseNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted">Case number</span>
                      <span className="font-mono font-bold text-gold">{data.caseNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-4">Next steps</p>
                <ul className="space-y-3">
                  {steps.map((s) => (
                    <li key={s.label} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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

              <p className="text-xs text-muted leading-relaxed">
                Visa approval is never guaranteed. Globe Travel Voyage is not a government agency or embassy.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={data.hasVisaCase ? "/dashboard/customer?tab=visa-case" : "/dashboard/customer"}
                  className="btn-primary py-3.5 text-center text-sm"
                >
                  Go to dashboard
                </Link>
                {data.hasVisaCase && (
                  <Link href="/dashboard/customer?tab=visa-case" className="btn-gold py-3.5 text-center text-sm">
                    Upload documents
                  </Link>
                )}
                <Link href="/support" className="btn-outline py-3.5 text-center text-sm">
                  Contact support
                </Link>
                {data.paymentId ? (
                  <a
                    href={`/api/receipt/${data.paymentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-3.5 text-center text-sm"
                  >
                    View receipt
                  </a>
                ) : (
                  <span className="btn-outline py-3.5 text-center text-sm opacity-50 cursor-not-allowed">
                    Receipt pending
                  </span>
                )}
              </div>
            </div>
          )}

          {!loading && !data?.paid && !sessionId && (
            <div className="px-8 py-8 text-center">
              <p className="text-sm text-muted mb-4">No payment session found.</p>
              <Link href="/dashboard/customer?tab=billing" className="btn-primary px-6 py-3 text-sm">
                View billing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-soft flex items-center justify-center">
          <div className="skeleton h-64 w-full max-w-lg rounded-2xl" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
