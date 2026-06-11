"use client";

import { useState } from "react";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { submitBookingRequest } from "@/lib/supabase/actions";

const SERVICE_TYPES = [
  { value: "tour",     label: "Guided tour",      emoji: "🗺️" },
  { value: "hotel",    label: "Hotel / Stay",      emoji: "🏨" },
  { value: "flight",   label: "Flight",            emoji: "✈️" },
  { value: "car",      label: "Car rental",        emoji: "🚗" },
  { value: "cruise",   label: "Cruise / Boat",     emoji: "🛳️" },
  { value: "package",  label: "Holiday package",   emoji: "📦" },
  { value: "ticket",   label: "Attraction ticket", emoji: "🎟️" },
];

export default function BookingRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    serviceType: "", serviceName: "",
    name: "", email: "", phone: "",
    date: "", endDate: "", travelers: "1",
    budget: "", message: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitBookingRequest({
      serviceType: form.serviceType,
      serviceName: form.serviceName,
      name: form.name,
      email: form.email,
      phone: form.phone,
      date: form.date,
      endDate: form.endDate,
      travelers: form.travelers,
      budget: form.budget,
      message: form.message,
    });

    setLoading(false);

    if (!result.ok) {
      if (result.demo) { setSubmitted(true); return; }
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-premium)]">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">🎉</div>
          <h1 className="text-2xl font-extrabold text-navy">Booking request sent!</h1>
          <p className="mt-3 text-charcoal/60 leading-relaxed">
            Your request has been received. The provider will confirm availability and send details to <strong>{form.email}</strong> within 24 hours.
          </p>
          <div className="mt-6 rounded-xl bg-blue/5 border border-blue/15 p-4 text-left space-y-1 text-sm">
            <p className="font-semibold text-navy">Your request summary:</p>
            <p className="text-charcoal/60"><span className="font-medium text-navy">Service:</span> {form.serviceType} {form.serviceName && `— ${form.serviceName}`}</p>
            <p className="text-charcoal/60"><span className="font-medium text-navy">Travelers:</span> {form.travelers}</p>
            {form.date && <p className="text-charcoal/60"><span className="font-medium text-navy">Date:</span> {form.date}</p>}
          </div>
          <Disclaimer className="mt-4 text-left" variant="compact" />
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/customer" className="btn-primary flex-1 py-3">View dashboard</Link>
            <Link href="/" className="btn-outline flex-1 py-3">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Booking</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Request a booking</h1>
          <p className="mt-2 text-white/60 text-sm max-w-xl">
            Submit your booking request. The provider will confirm availability and send payment details within 24 hours. No payment is taken here.
          </p>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="mx-auto max-w-2xl">
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service type */}
              <div>
                <label className="label">What are you booking? *</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SERVICE_TYPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("serviceType", s.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                        form.serviceType === s.value
                          ? "border-blue bg-blue/5 text-navy shadow-sm"
                          : "border-soft-200 bg-white text-charcoal/50 hover:border-navy/30 hover:text-navy"
                      }`}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.serviceType && (
                <div>
                  <label className="label">Specific name (optional)</label>
                  <input className="input" placeholder={`E.g. Desert Safari, Burj Khalifa…`} value={form.serviceName} onChange={(e) => set("serviceName", e.target.value)} />
                </div>
              )}

              <div className="divider-gold" />
              <h3 className="font-bold text-navy">Your contact details</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full name *</label>
                  <input className="input" placeholder="Ahmed Khan" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email address *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <input className="input" type="tel" placeholder="+971 50 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Number of travelers *</label>
                  <input className="input" type="number" min="1" placeholder="2" value={form.travelers} onChange={(e) => set("travelers", e.target.value)} required />
                </div>
                <div>
                  <label className="label">{form.serviceType === "hotel" ? "Check-in date" : "Start date"}</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                </div>
                {(form.serviceType === "hotel" || form.serviceType === "car") && (
                  <div>
                    <label className="label">{form.serviceType === "hotel" ? "Check-out date" : "Return date"}</label>
                    <input className="input" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="label">Approximate budget</label>
                  <input className="input" placeholder="$200 total, per person…" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Special requests or requirements</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  placeholder="Dietary needs, accessibility requirements, preferred times, anything else…"
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>

              <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/55 leading-relaxed">
                ⚠ This is a booking <em>request</em>, not a confirmed reservation. No payment is taken. The provider contacts you to confirm and collect payment.
              </div>

              <button type="submit" disabled={loading || !form.serviceType || !form.name || !form.email} className="btn-primary w-full py-3.5 disabled:opacity-50">
                {loading ? "Sending request…" : "Send booking request →"}
              </button>
            </form>
          </div>

          <Disclaimer className="mt-6" variant="compact" />
        </div>
      </div>
    </div>
  );
}
