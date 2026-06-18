"use client";

import { useState } from "react";
import Link from "next/link";
import {
  adminResolveMessageReport,
  fetchAdminConversationDetail,
  type AdminConversationDetail,
} from "@/lib/supabase/messaging-actions";

export function AdminMessagesConsole({
  conversations,
  reports,
  convError,
  reportsError,
}: {
  conversations: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
  convError?: string;
  reportsError?: string;
}) {
  const [tab, setTab] = useState<"conversations" | "reports">("conversations");
  const [reportRows, setReportRows] = useState(reports);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function openConversation(id: string) {
    setDetailLoading(true);
    const { detail: d, error } = await fetchAdminConversationDetail(id);
    setDetailLoading(false);
    if (error) {
      showToast(error);
      return;
    }
    setDetail(d);
  }

  async function handleResolveReport(reportId: string, status: "reviewed" | "dismissed") {
    setBusyId(reportId);
    const result = await adminResolveMessageReport(reportId, status);
    setBusyId(null);
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setReportRows((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    showToast("Report updated");
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
          <h1 className="mt-2 text-2xl font-extrabold text-navy">Messaging oversight</h1>
          <p className="mt-1 text-sm text-muted">
            Review platform conversations and message abuse reports.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("conversations")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "conversations" ? "bg-navy text-white" : "bg-soft text-navy"}`}
            >
              Conversations ({conversations.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("reports")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "reports" ? "bg-navy text-white" : "bg-soft text-navy"}`}
            >
              Abuse reports ({reportRows.filter((r) => r.status === "pending").length} pending)
            </button>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        {tab === "conversations" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              {convError && <p className="text-sm text-red-600">{convError}</p>}
              {conversations.length === 0 ? (
                <div className="card p-12 text-center text-sm text-muted">No conversations yet.</div>
              ) : (
                conversations.map((c) => {
                  const row = c as {
                    id: string;
                    kind: string;
                    subject: string | null;
                    updated_at: string;
                  };
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => openConversation(row.id)}
                      className={`card w-full p-4 text-left transition-colors hover:border-gold/40 ${
                        detail?.id === row.id ? "border-gold/50 ring-1 ring-gold/20" : ""
                      }`}
                    >
                      <p className="font-bold text-navy">{row.subject ?? row.kind}</p>
                      <p className="text-xs text-muted font-mono">{row.id.slice(0, 8)}…</p>
                      <p className="mt-1 text-xs text-charcoal/45">{new Date(row.updated_at).toLocaleString()}</p>
                    </button>
                  );
                })
              )}
            </div>

            <div className="card p-5 min-h-[320px]">
              {detailLoading ? (
                <p className="text-sm text-muted">Loading conversation…</p>
              ) : !detail ? (
                <p className="text-sm text-muted py-12 text-center">Select a conversation to view messages.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-bold text-navy">{detail.subject ?? detail.kind}</h2>
                    <p className="mt-1 text-xs text-muted">
                      Participants:{" "}
                      {detail.participants.map((p) => p.name ?? p.user_id.slice(0, 8)).join(", ")}
                    </p>
                  </div>
                  <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-xl border border-soft-200 bg-soft/30 p-3">
                    {detail.messages.map((m) => (
                      <div key={m.id} className="rounded-lg bg-white border border-soft-200 p-3 text-sm">
                        <p className="text-xs font-semibold text-charcoal/50">{m.sender_name ?? "—"}</p>
                        <p className="mt-1 text-navy">{m.body}</p>
                        <p className="mt-1 text-[10px] text-charcoal/35">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            {reportsError && <p className="text-sm text-red-600">{reportsError}</p>}
            {reportRows.length === 0 ? (
              <div className="card p-12 text-center text-sm text-muted">No message reports yet.</div>
            ) : (
              reportRows.map((row) => {
                const r = row as {
                  id: string;
                  conversation_id: string;
                  message_id: string | null;
                  reason: string;
                  details: string | null;
                  status: string;
                  created_at: string;
                };
                return (
                  <div key={r.id} className="card p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-gold">Message report</span>
                      <span className={`text-xs font-semibold ${r.status === "pending" ? "text-gold" : "text-charcoal/45"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-navy">{r.reason}</p>
                    {r.details && <p className="text-sm text-charcoal/60">{r.details}</p>}
                    <p className="text-xs text-muted font-mono">
                      Conversation: {r.conversation_id.slice(0, 8)}…
                      {r.message_id ? ` · Message: ${r.message_id.slice(0, 8)}…` : ""}
                    </p>
                    <p className="text-xs text-charcoal/40">{new Date(r.created_at).toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => openConversation(r.conversation_id)}
                        className="text-xs font-semibold text-blue hover:underline"
                      >
                        View conversation
                      </button>
                      {r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => handleResolveReport(r.id, "reviewed")}
                            className="btn-primary px-3 py-1.5 text-xs disabled:opacity-60"
                          >
                            Mark reviewed
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => handleResolveReport(r.id, "dismissed")}
                            className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
