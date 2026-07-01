"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { Panel } from "@/components/DashboardLayout";
import {
  fetchUserConversations,
  fetchConversationMessages,
  sendConversationMessage,
  type ConversationSummary,
  type ThreadMessage,
} from "@/lib/supabase/messaging-actions";
import { isSupabaseConfigured } from "@/lib/auth";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function ConversationsInbox({ title = "Messages" }: { title?: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(!isSupabaseConfigured);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function reloadConversations() {
    fetchUserConversations().then((rows) => {
      setConversations(rows);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    reloadConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetchConversationMessages(activeId).then(setMessages);
  }, [activeId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !body.trim()) return;
    setSending(true);
    setError("");
    const result = await sendConversationMessage(activeId, body);
    setSending(false);
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setBody("");
    const updated = await fetchConversationMessages(activeId);
    setMessages(updated);
    reloadConversations();
  }

  if (!isSupabaseConfigured) {
    return (
      <Panel title={title}>
        <p className="text-sm text-charcoal/50">Messaging requires Supabase configuration.</p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Panel title="Inbox" noPad>
        {loading ? (
          <p className="p-4 text-sm text-charcoal/50">Loading…</p>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <DashboardEmpty
              title="No conversations yet"
              message="Message a travel agent or agency from the marketplace to start a thread."
              action={<Link href="/agencies" className="btn-primary px-5 py-2.5 text-sm">Browse agents</Link>}
            />
          </div>
        ) : (
          <div className="divide-y divide-soft-200 max-h-[480px] overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-soft ${
                  activeId === c.id ? "bg-blue/5 border-l-2 border-blue" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-navy truncate">
                    {c.other_user_name ?? c.subject ?? "Conversation"}
                  </p>
                  {c.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue" />}
                </div>
                <p className="mt-0.5 text-xs text-charcoal/45 truncate">{c.last_message ?? "—"}</p>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={activeId ? "Conversation" : "Select a thread"}>
        {!activeId ? (
          <p className="text-sm text-charcoal/50 py-8 text-center">Select a conversation to view messages.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-soft-200 bg-soft/40 p-4">
              {messages.map((m) => (
                <div key={m.id} className="text-sm">
                  <p className="text-xs font-semibold text-charcoal/45">{m.sender_name ?? "User"}</p>
                  <p className="mt-0.5 text-navy">{m.body}</p>
                  <p className="mt-1 text-[10px] text-charcoal/35">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex flex-col gap-2 sm:flex-row">
              <textarea
                className="input min-h-20 flex-1 text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message…"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </Panel>
    </div>
  );
}
