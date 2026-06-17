"use client";

import { useState } from "react";
import { updateProviderVerification } from "@/lib/supabase/mvp-actions";
import type { AdminVerificationItem } from "@/lib/supabase/queries";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  under_review: "bg-blue/10 text-blue",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export function AdminProviderQueue({
  initialItems,
}: {
  initialItems: AdminVerificationItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAction(
    item: AdminVerificationItem,
    status: "verified" | "rejected" | "under_review"
  ) {
    setBusyId(item.id);
    const result = await updateProviderVerification(item.providerTable, item.id, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setItems((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, status } : v))
    );
    showToast(status === "verified" ? "Provider approved" : status === "rejected" ? "Application rejected" : "Marked under review");
  }

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center text-sm text-muted">
        No providers waiting for review.
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
          {toast}
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy/5 text-sm font-bold text-navy">
                {item.type[0]}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-navy">{item.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                      STATUS_STYLE[item.status] ?? "bg-soft text-charcoal/50"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-charcoal/55">
                  {item.country ?? "—"} · {item.type} · Submitted {item.submitted}
                </p>
              </div>
            </div>
            {(item.status === "pending" || item.status === "under_review") && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleAction(item, "under_review")}
                  className="rounded-lg border border-blue/20 bg-blue/10 px-3 py-1.5 text-xs font-semibold text-blue hover:bg-blue/15 transition-colors disabled:opacity-50"
                >
                  Under review
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleAction(item, "verified")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleAction(item, "rejected")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
