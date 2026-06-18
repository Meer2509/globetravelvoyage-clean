"use client";

import { useState } from "react";
import Link from "next/link";
import {
  saveGroupTour,
  submitGroupTourForReview,
  parseCommaList,
} from "@/lib/supabase/group-tour-actions";
import { type GroupTourRow } from "@/lib/supabase/group-tour-types";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-soft text-charcoal/60",
  pending: "bg-gold/10 text-gold",
  approved: "bg-blue/10 text-blue",
  active: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  closed: "bg-charcoal/10 text-charcoal/55",
};

const EMPTY_FORM = {
  title: "",
  destination: "",
  description: "",
  startDate: "",
  endDate: "",
  price: "",
  currency: "USD",
  seatLimit: "20",
  itinerary: "",
  includedItems: "",
  excludedItems: "",
  cancellationPolicy: "",
};

export function AgentGroupToursPanel({
  initialTours,
  requests,
  profileError,
}: {
  initialTours: GroupTourRow[];
  requests: Array<Record<string, unknown>>;
  profileError?: string;
}) {
  const [tours, setTours] = useState(initialTours);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit(tour: GroupTourRow) {
    setEditingId(tour.id);
    setForm({
      title: tour.title,
      destination: tour.destination,
      description: tour.description ?? "",
      startDate: tour.start_date ?? "",
      endDate: tour.end_date ?? "",
      price: tour.price != null ? String(tour.price) : "",
      currency: tour.currency,
      seatLimit: String(tour.seat_limit),
      itinerary: tour.itinerary ?? "",
      includedItems: tour.included_items.join(", "),
      excludedItems: tour.excluded_items.join(", "),
      cancellationPolicy: tour.cancellation_policy ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave(submitForReview: boolean) {
    setBusy(true);
    setError("");
    const result = await saveGroupTour({
      id: editingId ?? undefined,
      title: form.title,
      destination: form.destination,
      description: form.description,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      seatLimit: parseInt(form.seatLimit, 10) || 20,
      itinerary: form.itinerary,
      includedItems: parseCommaList(form.includedItems),
      excludedItems: parseCommaList(form.excludedItems),
      cancellationPolicy: form.cancellationPolicy,
      status: submitForReview ? "pending" : "draft",
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    showToast(submitForReview ? "Tour submitted for admin review" : "Tour saved");
    resetForm();
    window.location.reload();
  }

  async function handleSubmitExisting(id: string) {
    setBusy(true);
    const result = await submitGroupTourForReview(id);
    setBusy(false);
    if (!result.ok) {
      showToast(result.error ?? "Submit failed");
      return;
    }
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, status: "pending" } : t)));
    showToast("Submitted for review");
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-premium)]">
          {toast}
        </div>
      )}

      {profileError && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-navy">
          {profileError}{" "}
          <Link href="/dashboard/agent/marketplace" className="font-semibold text-blue hover:underline">
            Set up your agent profile →
          </Link>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-extrabold text-navy">{editingId ? "Edit group tour" : "Create group tour"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Tour title *</label>
            <input className="input text-sm" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Destination *</label>
            <input className="input text-sm" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
          </div>
          <div>
            <label className="label">Seat limit *</label>
            <input type="number" min={1} className="input text-sm" value={form.seatLimit} onChange={(e) => setForm((f) => ({ ...f, seatLimit: e.target.value }))} />
          </div>
          <div>
            <label className="label">Start date</label>
            <input type="date" className="input text-sm" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">End date</label>
            <input type="date" className="input text-sm" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Price per person</label>
            <input className="input text-sm" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="2500" />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className="input text-sm" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-20 text-sm" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Itinerary</label>
            <textarea className="input min-h-28 text-sm font-mono" value={form.itinerary} onChange={(e) => setForm((f) => ({ ...f, itinerary: e.target.value }))} placeholder="Day 1: …&#10;Day 2: …" />
          </div>
          <div>
            <label className="label">Included (comma-separated)</label>
            <input className="input text-sm" value={form.includedItems} onChange={(e) => setForm((f) => ({ ...f, includedItems: e.target.value }))} />
          </div>
          <div>
            <label className="label">Excluded (comma-separated)</label>
            <input className="input text-sm" value={form.excludedItems} onChange={(e) => setForm((f) => ({ ...f, excludedItems: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Cancellation policy</label>
            <textarea className="input min-h-16 text-sm" value={form.cancellationPolicy} onChange={(e) => setForm((f) => ({ ...f, cancellationPolicy: e.target.value }))} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy || !form.title || !form.destination} onClick={() => void handleSave(false)} className="btn-outline px-4 py-2 text-sm disabled:opacity-50">
            Save draft
          </button>
          <button type="button" disabled={busy || !form.title || !form.destination} onClick={() => void handleSave(true)} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
            Submit for review
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-charcoal/50 hover:text-navy">
              Cancel edit
            </button>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-navy">Your tours ({tours.length})</h2>
        {tours.length === 0 ? (
          <p className="text-sm text-charcoal/55">No group tours yet. Create your first departure above.</p>
        ) : (
          tours.map((t) => (
            <div key={t.id} className="card p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-navy">{t.title}</p>
                  <p className="text-sm text-muted">{t.destination} · {t.seat_limit - t.seats_booked} seats left</p>
                </div>
                <span className={`chip text-xs ${STATUS_STYLE[t.status] ?? ""}`}>{t.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["draft", "rejected"].includes(t.status) && (
                  <button type="button" disabled={busy} onClick={() => void handleSubmitExisting(t.id)} className="rounded-lg border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-semibold text-blue">
                    Submit for review
                  </button>
                )}
                {["draft", "pending", "rejected"].includes(t.status) && (
                  <button type="button" onClick={() => startEdit(t)} className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy">
                    Edit
                  </button>
                )}
                <Link href={`/group-tours/${t.id}`} className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-charcoal/60">
                  Preview
                </Link>
              </div>
            </div>
          ))
        )}
      </section>

      {requests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-navy">Join requests ({requests.length})</h2>
          {requests.map((r) => {
            const row = r as { id: string; full_name: string; email: string; traveler_count: number; status: string; created_at: string };
            return (
              <div key={row.id} className="rounded-xl border border-soft-200 bg-white p-4 text-sm">
                <p className="font-semibold text-navy">{row.full_name} · {row.traveler_count} traveler(s)</p>
                <p className="text-xs text-muted">{row.email} · {row.status} · {new Date(row.created_at).toLocaleString()}</p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
