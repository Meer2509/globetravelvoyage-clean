"use client";

import { useState } from "react";
import { submitCaseSupportMessage } from "@/lib/visa-case-document-client";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";

export function CaseSupportForm({ caseId }: { caseId: string; caseNumber: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const result = await submitCaseSupportMessage({ caseId, message });
    setBusy(false);

    if (!result.ok) {
      setFeedback({ type: "err", text: result.error ?? "Could not send your message." });
      return;
    }

    setFeedback({
      type: "ok",
      text: FORM_SUBMIT_SUCCESS_MESSAGE,
    });
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-muted">
        Questions about your documents, timeline, or payment? Send a message and we will follow up promptly.
      </p>
      <textarea
        className="input min-h-28 text-sm"
        placeholder="Describe your question or request…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        disabled={busy}
      />
      {feedback && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            feedback.type === "ok"
              ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
              : "text-red-700 bg-red-50 border border-red-200"
          }`}
        >
          {feedback.text}
        </p>
      )}
      <button type="submit" disabled={busy || !message.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
        {busy ? "Sending…" : "Message support"}
      </button>
    </form>
  );
}
