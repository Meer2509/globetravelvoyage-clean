"use client";

import { useState } from "react";
import { submitGroupTourRequest } from "@/lib/supabase/group-tour-actions";
import { FORM_SUBMIT_ERROR_MESSAGE, FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";
import type { GroupTourRow } from "@/lib/supabase/group-tour-types";

export function GroupTourJoinForm({ tour }: { tour: GroupTourRow }) {
  const seatsLeft = tour.seat_limit - tour.seats_booked;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelerCount: "1",
    travelerInfo: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const result = await submitGroupTourRequest({
      tourId: tour.id,
      fullName: form.name,
      email: form.email,
      phone: form.phone || undefined,
      travelerCount: parseInt(form.travelerCount, 10) || 1,
      travelerInfo: form.travelerInfo || undefined,
      message: form.message || undefined,
    });

    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-800">{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
        <p className="mt-2 text-sm text-emerald-700 leading-relaxed">
          Your request to join <strong>{tour.title}</strong> has been saved. Our team will confirm availability and send payment instructions — no charge has been made yet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-soft-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div>
        <h3 className="text-lg font-extrabold text-navy">Request to join</h3>
        <p className="mt-1 text-xs text-charcoal/55">
          {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} remaining · Pay later — booking request only
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Full name *</label>
          <input className="input text-sm" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input text-sm" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input className="input text-sm" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="label">Number of travelers *</label>
          <input
            type="number"
            min={1}
            max={seatsLeft}
            className="input text-sm"
            required
            value={form.travelerCount}
            onChange={(e) => setForm((f) => ({ ...f, travelerCount: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Traveler details</label>
        <textarea
          className="input min-h-20 text-sm"
          value={form.travelerInfo}
          onChange={(e) => setForm((f) => ({ ...f, travelerInfo: e.target.value }))}
          placeholder="Full names, passport nationalities, dietary needs, room preferences…"
        />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea
          className="input min-h-16 text-sm"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Questions or special requests…"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full py-3 text-sm font-bold disabled:opacity-60">
        {busy ? "Submitting…" : "Submit join request"}
      </button>
    </form>
  );
}
