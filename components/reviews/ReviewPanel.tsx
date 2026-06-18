"use client";

import { useState } from "react";
import { submitReview } from "@/lib/supabase/review-actions";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { Stars } from "@/components/Stars";

export function ReviewForm({
  targetType,
  targetId,
  targetName,
  onSubmitted,
}: {
  targetType: "visa_agent" | "agency" | "tour_guide" | "property" | "tour" | "travel_agent";
  targetId: string;
  targetName: string;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await submitReview({
      targetType,
      targetId,
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error.includes("Sign in") ? result.error : FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setDone(true);
    onSubmitted?.();
  }

  if (done) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Thank you. Your review of {targetName} has been submitted.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-soft-200 bg-soft/40 p-4">
      <p className="text-sm font-bold text-navy">Leave a review for {targetName}</p>
      <div>
        <label className="label">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-xl ${n <= rating ? "text-gold" : "text-charcoal/20"}`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Title (optional)</label>
        <input className="input text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="label">Your experience</label>
        <textarea className="input min-h-20 text-sm" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

export function ReviewList({
  reviews,
}: {
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_verified: boolean;
    created_at: string;
    reviewer_name: string;
  }>;
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-charcoal/50">No reviews yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-soft-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-navy">{r.reviewer_name}</p>
            <Stars rating={r.rating} />
          </div>
          {r.title && <p className="mt-1 text-sm font-medium text-navy">{r.title}</p>}
          {r.body && <p className="mt-1 text-sm text-charcoal/65">{r.body}</p>}
          <p className="mt-2 text-[10px] text-charcoal/40">
            {new Date(r.created_at).toLocaleDateString()}
            {r.is_verified ? " · Verified booking" : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
