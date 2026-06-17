"use client";

import { useState } from "react";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { submitLeadRequest } from "@/lib/supabase/actions";
import { FORM_SUBMIT_SUCCESS_MESSAGE, FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

const EXPERT_TYPES = [
  { value: "visa_agent",   label: "Visa agent",       emoji: "🛂", desc: "Document prep & interview guidance" },
  { value: "travel_agency", label: "Travel agency",   emoji: "🏢", desc: "Packages, tours & bookings" },
  { value: "tour_guide",   label: "Tour guide",        emoji: "🗺️", desc: "Local guided experiences" },
  { value: "property_host", label: "Property host",   emoji: "🏠", desc: "Rentals & accommodation" },
];

const PURPOSES = ["Get a quote", "Ask a question", "Request a consultation", "Follow up on previous enquiry", "Other"];

export default function LeadContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    expertType: "", name: "", email: "", phone: "",
    purpose: "", message: "", preferredTime: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitLeadRequest({
      expertType: form.expertType,
      name: form.name,
      email: form.email,
      phone: form.phone,
      purpose: form.purpose,
      message: form.message,
      preferredTime: form.preferredTime,
      leadType: "contact_expert",
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-premium)]">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">📨</div>
          <h1 className="text-2xl font-extrabold text-navy">Thank you!</h1>
          <p className="mt-3 text-charcoal/60 leading-relaxed">
            {FORM_SUBMIT_SUCCESS_MESSAGE}
          </p>
          <Disclaimer className="mt-5 text-left" variant="compact" />
          <div className="mt-6 flex gap-3">
            <Link href="/agents" className="btn-primary flex-1 py-3">Browse experts</Link>
            <Link href="/dashboard/customer" className="btn-outline flex-1 py-3">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft/50">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/agents" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Browse experts
          </Link>
          <span className="eyebrow-white mb-3">Connect</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Contact an expert</h1>
          <p className="mt-2 text-white/60 text-sm max-w-xl">
            Choose the type of expert you need and submit your enquiry. All experts on our platform are identity-verified.
          </p>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="mx-auto max-w-2xl">
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Expert type */}
              <div>
                <label className="label">Type of expert *</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXPERT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("expertType", t.value)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        form.expertType === t.value
                          ? "border-blue bg-blue/5 shadow-sm"
                          : "border-soft-200 bg-white hover:border-navy/30"
                      }`}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <p className="font-semibold text-navy text-sm">{t.label}</p>
                        <p className="text-xs text-charcoal/50">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Your full name *</label>
                  <input className="input" placeholder="Ahmed Khan" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Email address *</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input className="input" type="tel" placeholder="+971 50 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className="label">Purpose of contact</label>
                  <select className="input" value={form.purpose} onChange={(e) => set("purpose", e.target.value)}>
                    <option value="">Select…</option>
                    {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Your message *</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  placeholder="Describe your requirements, questions, or situation…"
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>

              <div>
                <label className="label">Preferred contact time (optional)</label>
                <input className="input" placeholder="E.g. Weekday mornings, after 5pm UAE time…" value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} />
              </div>

              <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/55 leading-relaxed">
                ⚠ Globe Travel Voyage connects you with independent experts. We verify identity but do not guarantee the quality of services. Always agree terms in writing before making any payment.
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button type="submit" disabled={loading || !form.expertType || !form.name || !form.email || !form.message} className="btn-primary w-full py-3.5 disabled:opacity-50">
                {loading ? "Sending…" : "Send message to expert →"}
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: "🛡️", label: "Identity verified", desc: "All experts verified" },
              { icon: "💬", label: "Fast response", desc: "Avg < 3 hours" },
              { icon: "⭐", label: "Reviewed", desc: "Real client reviews" },
            ].map((b) => (
              <div key={b.label} className="card p-3 text-center text-xs">
                <span className="text-2xl">{b.icon}</span>
                <p className="mt-1 font-semibold text-navy">{b.label}</p>
                <p className="text-charcoal/50">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
