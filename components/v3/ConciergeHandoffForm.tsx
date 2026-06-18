"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { submitConciergeHandoff } from "@/lib/v3/concierge-handoff-actions";
import type { ConciergeHandoffTopic } from "@/lib/v3/concierge-intent";
import { FORM_SUBMIT_ERROR_MESSAGE, FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";

const TOPIC_LABELS: Record<ConciergeHandoffTopic, string> = {
  visa: "Visa expert handoff",
  property: "Property help request",
  trip_planning: "Concierge planning help",
};

export function ConciergeHandoffForm({
  open,
  onClose,
  topic,
  conversationSummary,
  defaultDestination,
}: {
  open: boolean;
  onClose: () => void;
  topic: ConciergeHandoffTopic;
  conversationSummary?: string;
  defaultDestination?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState(defaultDestination ?? "");
  const [budget, setBudget] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await submitConciergeHandoff({
      topic,
      name,
      email,
      phone: phone || undefined,
      destination: destination || undefined,
      budget: budget || undefined,
      travelDates: travelDates || undefined,
      message: message || undefined,
      aiConversationSummary: conversationSummary,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/50 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={() => !loading && onClose()}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[var(--shadow-premium)]">
        <div className="border-b border-soft-200 bg-hero-gradient px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gold">
                AI Concierge handoff
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-white">{TOPIC_LABELS[topic]}</h2>
              <p className="mt-1 text-xs text-white/60">
                A verified specialist will follow up. Your AI conversation is included.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
              ✓
            </div>
            <p className="mt-4 text-sm font-semibold text-navy">{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
            <p className="mt-2 text-xs text-charcoal/55 leading-relaxed">
              Our team at support@globetravelvoyage.com has been notified. Expect a response shortly.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 px-6 py-2.5 text-sm">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full name *</label>
                <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Destination</label>
                <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Dubai, USA, Istanbul" />
              </div>
              <div>
                <label className="label">Budget</label>
                <input className="input" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $3,000 USD" />
              </div>
              <div>
                <label className="label">Travel dates</label>
                <input className="input" value={travelDates} onChange={(e) => setTravelDates(e.target.value)} placeholder="e.g. March 2026, 7 nights" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Additional message</label>
                <textarea className="input min-h-[88px] resize-y" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Anything else we should know?" />
              </div>
            </div>

            {conversationSummary && (
              <div className="rounded-xl border border-blue/15 bg-blue/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue">AI conversation included</p>
                <p className="mt-1 line-clamp-4 text-[11px] leading-relaxed text-charcoal/60 whitespace-pre-wrap">
                  {conversationSummary}
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold flex w-full min-h-[48px] items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Icon name="sparkles" className="h-4 w-4 animate-pulse" />
                  Submitting…
                </>
              ) : (
                "Submit request"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
