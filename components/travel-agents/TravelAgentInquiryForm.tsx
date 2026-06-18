"use client";

import { useState } from "react";
import { submitTravelAgentInquiry } from "@/lib/supabase/travel-agent-actions";
import { FORM_SUBMIT_ERROR_MESSAGE, FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";
import type { TravelAgentServiceRow } from "@/lib/supabase/travel-agent-types";

export function TravelAgentInquiryForm({
  profileId,
  agentName,
  services = [],
}: {
  profileId: string;
  agentName: string;
  services?: TravelAgentServiceRow[];
}) {
  const [form, setForm] = useState({
    serviceId: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await submitTravelAgentInquiry({
      profileId,
      serviceId: form.serviceId || undefined,
      fullName: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message,
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
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {FORM_SUBMIT_SUCCESS_MESSAGE} {agentName} will be notified via our support team.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-bold text-navy">Send inquiry to {agentName}</p>
      {services.length > 0 && (
        <div>
          <label className="label">Service (optional)</label>
          <select
            className="input text-sm"
            value={form.serviceId}
            onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}
          >
            <option value="">General inquiry</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Full name *</label>
          <input
            className="input text-sm"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            className="input text-sm"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Phone / WhatsApp</label>
        <input
          className="input text-sm"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea
          className="input min-h-24 text-sm"
          required
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Trip dates, destinations, budget, visa needs…"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full py-3 text-sm font-bold disabled:opacity-60">
        {busy ? "Sending…" : "Send secure inquiry"}
      </button>
    </form>
  );
}
