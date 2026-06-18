"use client";

import { useState } from "react";
import Link from "next/link";
import {
  adminApproveTravelAgent,
  adminRejectTravelAgent,
  adminFeatureTravelAgent,
  adminVerifyTravelAgent,
  adminUpdateTravelAgentNotes,
  adminUpdateTravelAgentStatus,
} from "@/lib/supabase/travel-agent-actions";
import { TRAVEL_AGENT_STATUSES, type TravelAgentProfileRow } from "@/lib/supabase/travel-agent-types";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  under_review: "bg-blue/10 text-blue",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export function AdminTravelAgentConsole({
  agents,
  inquiries,
  agentsError,
  inquiriesError,
}: {
  agents: TravelAgentProfileRow[];
  inquiries: Array<Record<string, unknown>>;
  agentsError?: string;
  inquiriesError?: string;
}) {
  const [rows, setRows] = useState(agents);
  const [inquiryRows] = useState(inquiries);
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
  }

  function patch(id: string, patch: Partial<TravelAgentProfileRow>) {
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
          <Link href="/dashboard/admin" className="text-xs font-semibold text-blue hover:underline">
            ← Command center
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Travel agent marketplace</h1>
          <p className="mt-1 text-sm text-muted">Approve, verify, feature, and manage travel agent profiles.</p>
        </div>
      </div>
      <div className="container-px py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-navy">All agents ({rows.length})</h2>
            <Link href="/travel-agents" className="text-xs font-semibold text-blue hover:underline">
              View public marketplace →
            </Link>
          </div>
          {agentsError && <p className="text-sm text-red-600">{agentsError}</p>}
          {rows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No travel agent profiles yet.</div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="card space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-navy">{r.full_name}</p>
                      {r.featured && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      {r.agency_name ?? "Independent"} · {r.specialties.slice(0, 3).join(", ") || "—"}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/45">
                      {new Date(r.created_at).toLocaleString()} · Rating {r.rating ?? 0} ({r.review_count ?? 0})
                    </p>
                  </div>
                  <span className={`chip text-xs capitalize ${STATUS_STYLE[r.verification_status] ?? ""}`}>
                    {r.verification_status}
                  </span>
                </div>
                {r.bio && <p className="text-sm text-charcoal/65 line-clamp-2">{r.bio}</p>}
                <div className="flex flex-wrap gap-2">
                  {r.verification_status !== "verified" && (
                    <>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminApproveTravelAgent(r.id), () => { patch(r.id, { verification_status: "verified" }); showToast("Approved"); })} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Approve
                      </button>
                      <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminVerifyTravelAgent(r.id), () => { patch(r.id, { verification_status: "verified" }); showToast("Verified"); })} className="rounded-lg border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-semibold text-blue">
                        Verify
                      </button>
                    </>
                  )}
                  {r.verification_status !== "rejected" && (
                    <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminRejectTravelAgent(r.id), () => { patch(r.id, { verification_status: "rejected", featured: false }); showToast("Rejected"); })} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                      Reject
                    </button>
                  )}
                  {r.verification_status === "verified" && !r.featured && (
                    <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminFeatureTravelAgent(r.id, true), () => { patch(r.id, { featured: true }); showToast("Featured"); })} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
                      Feature
                    </button>
                  )}
                  {r.verification_status === "verified" && r.featured && (
                    <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminFeatureTravelAgent(r.id, false), () => { patch(r.id, { featured: false }); showToast("Unfeatured"); })} className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-charcoal/60">
                      Unfeature
                    </button>
                  )}
                  {r.verification_status === "verified" && (
                    <Link href={`/travel-agents/${r.id}`} className="rounded-lg border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-semibold text-blue">
                      View live →
                    </Link>
                  )}
                  <select
                    className="input select py-1.5 text-xs"
                    value={r.verification_status}
                    disabled={busyId === r.id}
                    onChange={(e) => {
                      const status = e.target.value;
                      run(
                        r.id,
                        () => adminUpdateTravelAgentStatus(r.id, status),
                        () => {
                          patch(r.id, {
                            verification_status: status,
                            featured: status === "verified" ? r.featured : false,
                          });
                          showToast("Status updated");
                        }
                      );
                    }}
                  >
                    {TRAVEL_AGENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="border-t border-soft-200 pt-3">
                  <label className="label text-xs">Admin notes</label>
                  <textarea className="input min-h-16 text-sm" value={notesDraft[r.id] ?? r.admin_notes ?? ""} onChange={(e) => setNotesDraft((d) => ({ ...d, [r.id]: e.target.value }))} />
                  <button type="button" disabled={busyId === r.id} onClick={() => run(r.id, () => adminUpdateTravelAgentNotes(r.id, notesDraft[r.id] ?? r.admin_notes ?? ""), () => { patch(r.id, { admin_notes: notesDraft[r.id] ?? null }); showToast("Notes saved"); })} className="mt-2 rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy">
                    Save notes
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-navy">Agent inquiries</h2>
          {inquiriesError && <p className="text-sm text-red-600">{inquiriesError}</p>}
          {inquiryRows.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">No inquiries yet.</div>
          ) : (
            inquiryRows.map((row) => {
              const inq = row as {
                id: string;
                full_name: string;
                email: string;
                message: string;
                status: string;
                created_at: string;
                travel_agent_profiles?: { full_name: string; agency_name: string | null } | null;
              };
              return (
                <div key={inq.id} className="card p-5">
                  <p className="font-bold text-navy">{inq.travel_agent_profiles?.full_name ?? "Agent"}</p>
                  <p className="text-sm text-muted">{inq.full_name} · {inq.email}</p>
                  <p className="mt-2 text-sm text-charcoal/65">{inq.message}</p>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
