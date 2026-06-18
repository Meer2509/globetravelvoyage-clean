"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPaymentAmount, formatPaymentDate, paymentServiceLabel } from "@/lib/payments-display";
import {
  adminReviewPremiumRequest,
  adminUpdateFeaturedListing,
} from "@/lib/supabase/premium-actions";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-gold/10 text-gold",
  failed: "bg-red-50 text-red-600",
  expired: "bg-charcoal/10 text-charcoal/60",
  active: "bg-emerald-50 text-emerald-700",
  canceled: "bg-red-50 text-red-600",
};

export function AdminPaymentsConsole({
  payments,
  premiumRequests,
  featuredListings,
  paymentsError,
  requestsError,
  listingsError,
}: {
  payments: Array<Record<string, unknown>>;
  premiumRequests: Array<Record<string, unknown>>;
  featuredListings: Array<Record<string, unknown>>;
  paymentsError?: string;
  requestsError?: string;
  listingsError?: string;
}) {
  const [tab, setTab] = useState<"payments" | "requests" | "featured">("payments");
  const [requestRows, setRequestRows] = useState(premiumRequests);
  const [listingRows, setListingRows] = useState(featuredListings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const paid = payments.filter((p) => p.status === "paid");
  const revenue = paid.reduce((s, p) => s + Number(p.amount ?? 0), 0);

  async function handleReviewRequest(id: string, status: "in_review" | "completed" | "canceled") {
    setBusyId(id);
    const result = await adminReviewPremiumRequest(id, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setRequestRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast("Request updated");
  }

  async function handleFeaturedStatus(id: string, status: "active" | "expired" | "canceled") {
    setBusyId(id);
    const result = await adminUpdateFeaturedListing(id, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setListingRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast("Listing updated");
  }

  return (
    <div className="min-h-screen bg-soft">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
          {toast}
        </div>
      )}
      <div className="border-b border-soft-200 bg-white">
        <div className="container-px py-6">
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Payments & revenue</h1>
          <p className="mt-1 text-sm text-muted">Real Stripe payments — no mock data.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["payments", "requests", "featured"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                  tab === t ? "bg-navy text-white" : "bg-soft text-navy"
                }`}
              >
                {t === "payments" ? `Payments (${payments.length})` : t === "requests" ? `Concierge requests (${requestRows.length})` : `Featured (${listingRows.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-px py-8 space-y-6">
        {tab === "payments" && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="card p-5 text-center">
                <p className="text-xs font-bold uppercase text-muted">Paid revenue</p>
                <p className="mt-2 text-2xl font-extrabold text-gold">{formatPaymentAmount(revenue)}</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-xs font-bold uppercase text-muted">Total records</p>
                <p className="mt-2 text-2xl font-extrabold text-navy">{payments.length}</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-xs font-bold uppercase text-muted">Pending</p>
                <p className="mt-2 text-2xl font-extrabold text-navy">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
            {paymentsError && <p className="text-sm text-red-600">{paymentsError}</p>}
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-soft-200 bg-soft/50 text-left text-xs font-bold uppercase text-muted">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Stripe IDs</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted">
                        No payments yet. Completed checkouts appear here after Stripe confirms.
                      </td>
                    </tr>
                  ) : (
                    payments.map((row) => {
                      const p = row as {
                        id: string;
                        email: string | null;
                        service_type: string | null;
                        description: string | null;
                        amount: number;
                        currency: string;
                        status: string;
                        stripe_session_id: string | null;
                        stripe_payment_intent_id: string | null;
                        stripe_customer_id: string | null;
                        invoice_number: string | null;
                        created_at: string;
                      };
                      return (
                        <tr key={p.id} className="hover:bg-soft/30">
                          <td className="px-4 py-3 font-medium text-navy">
                            {paymentServiceLabel(p.service_type, p.description)}
                          </td>
                          <td className="px-4 py-3 text-muted">{p.email ?? "—"}</td>
                          <td className="px-4 py-3 font-semibold">
                            {formatPaymentAmount(Number(p.amount), p.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[p.status] ?? ""}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-charcoal/50 max-w-[140px] truncate">
                            {p.stripe_payment_intent_id?.slice(0, 16) ?? p.stripe_session_id?.slice(0, 16) ?? "—"}
                            {p.stripe_customer_id ? ` · cus…` : ""}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted">{formatPaymentDate(p.created_at)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "requests" && (
          <>
            {requestsError && <p className="text-sm text-red-600">{requestsError}</p>}
            {requestRows.length === 0 ? (
              <div className="card p-12 text-center text-sm text-muted">No premium concierge requests yet.</div>
            ) : (
              requestRows.map((row) => {
                const r = row as {
                  id: string;
                  plan_key: string;
                  status: string;
                  request_type: string;
                  created_at: string;
                };
                return (
                  <div key={r.id} className="card p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-navy">{r.plan_key.replace(/_/g, " ")}</span>
                      <span className={`text-xs font-bold uppercase ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-muted">{r.request_type} · {new Date(r.created_at).toLocaleString()}</p>
                    {r.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button type="button" disabled={busyId === r.id} onClick={() => handleReviewRequest(r.id, "in_review")} className="btn-primary px-3 py-1.5 text-xs">Mark in review</button>
                        <button type="button" disabled={busyId === r.id} onClick={() => handleReviewRequest(r.id, "completed")} className="btn-outline px-3 py-1.5 text-xs">Complete</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {tab === "featured" && (
          <>
            {listingsError && <p className="text-sm text-red-600">{listingsError}</p>}
            {listingRows.length === 0 ? (
              <div className="card p-12 text-center text-sm text-muted">No featured listing purchases yet.</div>
            ) : (
              listingRows.map((row) => {
                const r = row as {
                  id: string;
                  listing_type: string;
                  listing_id: string;
                  status: string;
                  expires_at: string | null;
                  created_at: string;
                };
                return (
                  <div key={r.id} className="card p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-navy capitalize">{r.listing_type.replace(/_/g, " ")}</span>
                      <span className={`text-xs font-bold uppercase ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                    </div>
                    <p className="text-xs font-mono text-muted">Listing: {r.listing_id.slice(0, 12)}…</p>
                    <p className="text-xs text-charcoal/45">
                      Expires: {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"}
                    </p>
                    {r.status === "active" && (
                      <button type="button" disabled={busyId === r.id} onClick={() => handleFeaturedStatus(r.id, "expired")} className="text-xs font-semibold text-red-600 hover:underline">
                        Mark expired
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
