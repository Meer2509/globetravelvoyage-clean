"use client";

import { useState } from "react";
import Link from "next/link";
import { startProviderConversation } from "@/lib/supabase/messaging-actions";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { isSupabaseConfigured } from "@/lib/auth";

export function MessageProviderButton({
  providerUserId,
  providerName,
  className = "btn-outline px-4 py-2 text-sm",
}: {
  providerUserId: string;
  providerName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  if (!isSupabaseConfigured) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    const result = await startProviderConversation({
      providerUserId,
      providerName,
      message: message.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error.includes("Sign in") ? `${result.error} ` : FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setConversationId(result.data.conversationId);
  }

  if (conversationId) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-emerald-700 font-semibold">Message sent securely.</p>
        <Link href={`/messages/${conversationId}`} className="text-sm font-semibold text-blue hover:underline">
          Open conversation →
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Message provider
      </button>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-2 rounded-xl border border-soft-200 bg-soft/50 p-4">
      <p className="text-sm font-semibold text-navy">Message {providerName}</p>
      <textarea
        className="input min-h-20 text-sm"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your travel requirements…"
        required
      />
      {error && (
        <p className="text-sm text-red-600">
          {error}
          {error.includes("Sign in") && (
            <Link href="/login" className="font-semibold text-blue hover:underline ml-1">
              Sign in
            </Link>
          )}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
          {busy ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
