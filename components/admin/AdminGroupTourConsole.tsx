"use client";

import { useState } from "react";
import Link from "next/link";
import {
  adminApproveGroupTour,
  adminRejectGroupTour,
  adminFeatureGroupTour,
  adminCloseGroupTour,
  adminUpdateGroupTourStatus,
  adminUpdateGroupTourNotes,
  adminUpdateGroupTourRequestStatus,
} from "@/lib/supabase/group-tour-actions";
import { GROUP_TOUR_STATUSES, type GroupTourRow } from "@/lib/supabase/group-tour-types";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-soft text-charcoal/60",
  pending: "bg-gold/10 text-gold",
  approved: "bg-blue/10 text-blue",
  active: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  closed: "bg-charcoal/10 text-charcoal/55",
};

export function AdminGroupTourConsole({
  tours,
  requests,
  toursError,
  requestsError,
}: {
  tours: GroupTourRow[];
  requests: Array<Record<string, unknown>>;
  toursError?: string;
  requestsError?: string;
}) {
  const [rows, setRows] = useState(tours);
  const [requestRows, setRequestRows] = useState(requests);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>, onSuccess: () => void) {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error ?? "Action failed");
      return;
    }
    onSuccess();
    showToast("Updated");
  }

  function patchTour(id: string, patch: Partial<GroupTourRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">← Command center</Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Group tours marketplace</h1>
          <p className="mt-1 text-sm text-muted">Approve, feature, close, and manage group tour listings.</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy">All tours ({rows.length})</h2>
            <Link href="/group-tours" className="text-xs font-semibold text-blue hover:underline">View public marketplace →</Link>
          </div>
          {toursError && <p className="text-sm text-red-600">{toursError}</p>}
          {rows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No group tours in Supabase yet.</div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="card space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-navy">{r.title}</p>
                      {r.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Featured</span>}
                    </div>
                    <p className="text-sm text-muted">{r.destination} · {r.agent_name ?? "Agent"} · {r.seats_booked}/{r.seat_limit} seats</p>
                  </div>
                  <span className={`chip text-xs ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminApproveGroupTour(r.id), () => patchTour(r.id, { status: "active" }))} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Approve & activate</button>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminRejectGroupTour(r.id), () => patchTour(r.id, { status: "rejected", featured: false }))} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">Reject</button>
                    </>
                  )}
                  {(r.status === "approved" || r.status === "active") && (
                    <>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminFeatureGroupTour(r.id, !r.featured), () => patchTour(r.id, { featured: !r.featured }))} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">{r.featured ? "Unfeature" : "Feature"}</button>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminCloseGroupTour(r.id), () => patchTour(r.id, { status: "closed", featured: false }))} className="rounded-lg border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-charcoal/60">Close</button>
                    </>
                  )}
                  <select
                    className="input select py-1.5 text-xs w-auto"
                    value={r.status}
                    disabled={busyId === r.id}
                    onChange={(e) => {
                      const status = e.target.value as GroupTourRow["status"];
                      void run(r.id, () => adminUpdateGroupTourStatus(r.id, status), () => patchTour(r.id, { status }));
                    }}
                  >
                    {GROUP_TOUR_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Link href={`/group-tours/${r.id}`} className="rounded-lg border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-semibold text-blue">View public</Link>
                </div>
                <div>
                  <label className="label">Internal notes</label>
                  <textarea
                    className="input min-h-16 text-xs"
                    value={notesDraft[r.id] ?? r.admin_notes ?? ""}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                  />
                  <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminUpdateGroupTourNotes(r.id, notesDraft[r.id] ?? ""), () => patchTour(r.id, { admin_notes: notesDraft[r.id] ?? null }))} className="mt-2 text-xs font-semibold text-blue hover:underline">Save notes</button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-navy">Join requests ({requestRows.length})</h2>
          {requestsError && <p className="text-sm text-red-600">{requestsError}</p>}
          {requestRows.length === 0 ? (
            <div className="card p-6 text-center text-sm text-muted">No join requests yet.</div>
          ) : (
            requestRows.map((row) => {
              const r = row as {
                id: string;
                tour_id: string;
                full_name: string;
                email: string;
                phone: string | null;
                traveler_count: number;
                status: string;
                created_at: string;
                message: string | null;
              };
              return (
                <div key={r.id} className="card p-4 space-y-2 text-sm">
                  <p className="font-bold text-navy">{r.full_name} · {r.traveler_count} traveler(s)</p>
                  <p className="text-xs text-muted">{r.email} · {r.phone ?? "—"} · {new Date(r.created_at).toLocaleString()}</p>
                  {r.message && <p className="text-charcoal/65">{r.message}</p>}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <select
                      className="input select py-1 text-xs w-auto"
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => {
                        const status = e.target.value;
                        void run(r.id, () => adminUpdateGroupTourRequestStatus(r.id, status), () => {
                          setRequestRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
                        });
                      }}
                    >
                      {["pending", "confirmed", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
