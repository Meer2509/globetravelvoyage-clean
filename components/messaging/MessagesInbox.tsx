"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchUserConversations,
  getOrCreateSupportConversation,
  type ConversationSummary,
} from "@/lib/supabase/messaging-actions";
import { isSupabaseConfigured } from "@/lib/auth";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function MessagesInbox() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(!isSupabaseConfigured);
  const [supportBusy, setSupportBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchUserConversations().then((rows) => {
      setConversations(rows);
      setLoading(false);
    });
  }, []);

  async function handleSupport() {
    setSupportBusy(true);
    setError("");
    const result = await getOrCreateSupportConversation();
    setSupportBusy(false);
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    window.location.href = `/messages/${result.data.conversationId}`;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="card p-12 text-center text-sm text-charcoal/50">
        Messaging requires Supabase configuration.
      </div>
    );
  }

  return (
    <div className="container-px py-8 max-w-2xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-charcoal/55">{conversations.length} conversation{conversations.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={handleSupport}
          disabled={supportBusy}
          className="btn-outline px-4 py-2 text-sm disabled:opacity-60"
        >
          {supportBusy ? "Opening…" : "Message support"}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="card p-8 text-center text-sm text-charcoal/50">Loading…</div>
      ) : conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl">💬</div>
          <h2 className="mt-4 text-xl font-extrabold text-navy">No messages yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">
            Message travel agents, property hosts, visa experts, or other travelers from their profile pages.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/travel-agents" className="btn-primary px-6 py-2.5 text-sm">
              Browse agents
            </Link>
            <Link href="/properties" className="btn-outline px-6 py-2.5 text-sm">
              Browse properties
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-soft-200 rounded-2xl border border-soft-200 bg-white overflow-hidden shadow-[var(--shadow-soft)]">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-soft/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-navy">
                    {c.other_user_name ?? c.subject ?? "Conversation"}
                  </p>
                  {c.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />}
                </div>
                <p className="mt-0.5 truncate text-xs text-charcoal/45">{c.last_message ?? "—"}</p>
              </div>
              <span className="shrink-0 text-[10px] text-charcoal/35">
                {new Date(c.updated_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
