"use client";

import { useState } from "react";
import Link from "next/link";
import { moderateReview } from "@/lib/admin/phase1-actions";

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

  async function handleAction(id: string, action: "hide" | "show" | "delete") {
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
        prev.map((r) => (r.id === id ? { ...r, is_hidden: action === "hide" } : r))
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
          <p className="mt-1 text-sm text-muted">Moderate marketplace reviews from Supabase.</p>
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
                  <span className={`chip text-xs ${r.is_hidden ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                    {r.is_hidden ? "Hidden" : "Visible"}
                  </span>
                </div>
                {r.title && <p className="text-sm font-semibold text-navy">{r.title}</p>}
                {r.body && <p className="text-sm text-charcoal/65">{r.body}</p>}
                <div className="flex flex-wrap gap-2 border-t border-soft-200 pt-3">
                  {!r.is_hidden ? (
                    <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "hide")} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
                      Hide
                    </button>
                  ) : (
                    <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "show")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      Show
                    </button>
                  )}
                  <button type="button" disabled={busyId === r.id} onClick={() => handleAction(r.id, "delete")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                    Delete
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
