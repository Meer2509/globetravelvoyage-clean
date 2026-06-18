"use client";

import { useState } from "react";
import { captureEmailLead } from "@/lib/growth/abandoned-inquiry-actions";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function EmailCaptureStrip({
  source,
  headline = "Get visa updates & travel deals",
  subline = "Join travelers who receive curated guides and marketplace alerts. No spam.",
  className = "",
}: {
  source: string;
  headline?: string;
  subline?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await captureEmailLead({
      email,
      source,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ${className}`}>
        You&apos;re on the list — check your inbox for travel insights from Globe Travel Voyage.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/5 to-navy/[0.03] px-5 py-5 ${className}`}>
      <p className="font-extrabold text-navy">{headline}</p>
      <p className="mt-1 text-sm text-charcoal/60">{subline}</p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          className="input flex-1 text-sm"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={busy} className="btn-gold shrink-0 px-5 py-2.5 text-sm disabled:opacity-60">
          {busy ? "Saving…" : "Subscribe free"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
