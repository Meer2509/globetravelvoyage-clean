"use client";

import { useState } from "react";
import Link from "next/link";
import { moderateReview } from "@/lib/admin/phase1-actions";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export function AdminReviewsConsole({
  initialRows,
  fetchError,
}: {
  initialRows: Array<Record<string, unknown>>;
  fetchError?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAction(
    id: string,
    action: "hide" | "show" | "delete" | "approve" | "reject"
  ) {
    setBusyId(id);
    const result = await moderateReview(id, action);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    if (action === "delete") {
      setRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (action === "approve") return { ...r, status: "approved", is_hidden: false };
          if (action === "reject" || action === "hide") return { ...r, status: "rejected", is_hidden: true };
          return { ...r, status: "approved", is_hidden: false };
        })
      );
    }
    showToast("Review updated");
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
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Reviews & reputation</h1>
          <p className="mt-1 text-sm text-muted">
            Moderate reviews for travel agents, properties, group tours, and visa experts. Only approved reviews appear publicly.
          </p>
        </div>
      </div>
      <div className="container-px py-8 space-y-4">
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{fetchError}</div>
        )}
        {rows.length === 0 ? (
          <div className="card p-12 text-center text-sm text-muted">No reviews yet.</div>
        ) : (
          rows.map((row) => {
            const r = row as {
              id: string;
              reviewer_name: string;
              target_type: string;
              target_id: string;
              rating: number;
              title: string | null;
              body: string | null;
              is_hidden: boolean;
              is_verified: boolean;
              status: string;
              created_at: string;
            };
            return (
              <div key={r.id} className="card p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">{r.reviewer_name}</p>
                    <p className="text-xs text-muted">
                      {r.target_type} · {r.rating}★ · {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`chip text-xs ${STATUS_STYLE[r.status] ?? STATUS_STYLE.pending}`}>
                    {r.status ?? "pending"}
                  </span>
                </div>
                {r.title && <p className="text-sm font-semibold text-navy">{r.title}</p>}
                {r.body && <p className="text-sm text-charcoal/65">{r.body}</p>}
                <div className="flex flex-wrap gap-2 border-t border-soft-200 pt-3">
                  {r.status !== "approved" && (
                    <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "approve")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "reject")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                      Reject
                    </button>
                  )}
                  <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "delete")} className="rounded-lg border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal/55">
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
