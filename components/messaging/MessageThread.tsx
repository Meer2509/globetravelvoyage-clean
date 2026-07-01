"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchConversationMessages,
  sendConversationMessage,
  reportMessage,
  type ThreadMessage,
} from "@/lib/supabase/messaging-actions";
import { createClient, isSupabaseConfigured } from "@/lib/auth";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function MessageThread({
  conversationId,
  subject,
}: {
  conversationId: string;
  subject?: string | null;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(!isSupabaseConfigured);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportMessageId, setReportMessageId] = useState<string | undefined>();
  const [myUserId, setMyUserId] = useState<string | null>(null);

  function reload() {
    return fetchConversationMessages(conversationId).then(setMessages);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase?.auth.getUser().then(({ data }) => {
      setMyUserId(data.user?.id ?? null);
    });
    reload().finally(() => setLoading(false));
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    const result = await sendConversationMessage(conversationId, body);
    setSending(false);
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setBody("");
    await reload();
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setSending(true);
    const result = await reportMessage({
      conversationId,
      messageId: reportMessageId,
      reason: reportReason.trim(),
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReportOpen(false);
    setReportReason("");
    setReportMessageId(undefined);
    alert("Report submitted. Our team will review it.");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="card p-8 text-center text-sm text-charcoal/50">
        Messaging requires Supabase configuration.
      </div>
    );
  }

  return (
    <div className="container-px py-8 max-w-2xl mx-auto flex flex-col min-h-[60vh]">
      <Link href="/messages" className="text-xs font-semibold text-blue hover:underline">
        ← All messages
      </Link>
      <h1 className="mt-3 text-xl font-extrabold text-navy">{subject ?? "Conversation"}</h1>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-soft-200 bg-soft/30 p-4 max-h-[480px]">
        {loading ? (
          <p className="text-sm text-charcoal/50 text-center py-8">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-charcoal/50 text-center py-8">No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => {
            const isMine = myUserId !== null && m.sender_id === myUserId;
            return (
              <div
                key={m.id}
                className={`rounded-xl px-4 py-3 text-sm ${
                  isMine ? "ml-8 bg-navy text-white" : "mr-8 bg-white border border-soft-200 text-navy"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold opacity-70">{m.sender_name ?? "User"}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReportMessageId(m.id);
                      setReportOpen(true);
                    }}
                    className="text-[10px] font-semibold opacity-40 hover:opacity-100 hover:text-red-600"
                  >
                    Report
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                <p className="mt-2 text-[10px] opacity-40">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>

      {reportOpen && (
        <form onSubmit={handleReport} className="mt-4 rounded-xl border border-soft-200 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-navy">Report message</p>
          <textarea
            className="input min-h-20 text-sm"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe the issue…"
            required
          />
          <div className="flex gap-2">
            <button type="submit" disabled={sending} className="btn-outline px-4 py-2 text-sm">
              Submit
            </button>
            <button type="button" onClick={() => setReportOpen(false)} className="text-sm text-charcoal/50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <textarea
          className="input min-h-20 flex-1 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message…"
          required
        />
        <button type="submit" disabled={sending} className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-60">
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
