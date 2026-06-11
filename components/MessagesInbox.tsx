"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { Panel } from "@/components/DashboardLayout";
import { sendMessage } from "@/lib/supabase/mvp-actions";
import { fetchUserMessages, type MessageRow } from "@/lib/supabase/mvp-queries";

export function MessagesInbox({ title = "Messages" }: { title?: string }) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function reload() {
    fetchUserMessages().then((rows) => {
      setMessages(rows);
      setLoading(false);
    });
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError("");
    setSuccess("");
    const result = await sendMessage({
      receiverId: receiverId.trim(),
      body,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("Message saved.");
    setBody("");
    reload();
  }

  return (
    <div className="space-y-5">
      <Panel title={title} subtitle="Secure messaging — saved to Supabase">
        {loading ? (
          <p className="text-sm text-charcoal/50 py-4">Loading messages…</p>
        ) : messages.length === 0 ? (
          <DashboardEmpty
            title="No messages yet"
            message="When you contact a provider or receive a reply, messages appear here."
            action={<Link href="/support" className="btn-primary px-5 py-2.5 text-sm">Contact support</Link>}
          />
        ) : (
          <div className="divide-y divide-soft-200">
            {messages.map((m) => (
              <div key={m.id} className="py-3">
                <p className="text-xs text-charcoal/45">
                  {new Date(m.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="mt-1 text-sm text-navy">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Send a message">
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="label">Recipient user ID (optional for support)</label>
            <input className="input text-sm" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Provider or support user UUID" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-24" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <button type="submit" disabled={sending} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
