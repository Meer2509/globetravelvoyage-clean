"use client";

import { useState } from "react";
import Link from "next/link";
import { submitSupportTicket } from "@/lib/supabase/actions";
import { FORM_SUBMIT_SUCCESS_MESSAGE, FORM_SUBMIT_ERROR_MESSAGE, SITE_CONFIG, supportMailto } from "@/lib/site-config";

const HELP_CATEGORIES = [
  { icon: "🛂", title: "Visa & immigration", desc: "Visa types, documents, application status", href: "/visa" },
  { icon: "✈️", title: "Flights", desc: "Search, quotes, and booking requests", href: "/flights" },
  { icon: "🏠", title: "Properties", desc: "Rentals, listings, and host inquiries", href: "/properties" },
  { icon: "🗺️", title: "Group tours", desc: "Departures, join requests, availability", href: "/group-tours" },
  { icon: "✨", title: "AI Concierge", desc: "Trip planning, visas, and document guidance", href: "/concierge" },
  { icon: "👔", title: "Travel agents", desc: "Verification, disputes, reviews", href: "/travel-agents" },
  { icon: "💰", title: "Payments & refunds", desc: "Billing, commission payouts, disputes", href: "/pricing" },
  { icon: "🔐", title: "Account & security", desc: "Login, profile, password, verification", href: "/dashboard" },
];

const FAQS = [
  {
    q: "Is Globe Travel Voyage a government visa authority?",
    a: "No. Globe Travel Voyage is an independent travel marketplace. We are NOT a government agency, embassy, consulate, or official visa authority. We connect travelers with information and verified third-party experts. Visa decisions are made solely by the relevant government.",
  },
  {
    q: "Do you guarantee visa approval?",
    a: "No. No platform, agent, or service can guarantee visa approval. Visa outcomes are determined exclusively by the relevant government authority. Our AI and experts provide guidance only — not guarantees.",
  },
  {
    q: "How do I contact a visa expert?",
    a: "Browse the Agents page, select an expert, and use the 'Contact expert' button. You can also visit /lead/contact to submit a direct enquiry. All experts are identity-verified.",
  },
  {
    q: "Are the flight prices guaranteed?",
    a: "No. Live pricing is not displayed on browse pages. Request a custom quote — a Globe Travel Voyage specialist will review your request before booking.",
  },
  {
    q: "How do I track my visa application?",
    a: "Log in to your Customer Dashboard to view your visa application status and document checklist. Your assigned visa expert will also send updates directly.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your unique referral link. When someone signs up and completes a qualifying action, you earn a commission (typically 5–15% depending on the service tier). Visit /referrals for your dashboard and commission details.",
  },
  {
    q: "How do I report a scam or suspicious listing?",
    a: `Use the contact form below with 'Trust & Safety' as the subject, or email our team at ${SITE_CONFIG.supportEmail}. We investigate all reports and take action including removing listings and suspending accounts.`,
  },
  {
    q: "What data do you collect?",
    a: "Please review our Privacy Policy at /legal/privacy for full details. We collect information you provide (name, email, travel preferences) and usage data to improve the platform. We do not sell your data.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function set(k: keyof typeof form, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitSupportTicket({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      category: form.subject,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-soft/30">
      {/* Header */}
      <div className="bg-hero-gradient py-14">
        <div className="container-px text-center">
          <span className="eyebrow-white mb-4">Help centre</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">How can we help?</h1>
          <p className="mt-3 text-white/60 text-sm max-w-xl mx-auto">
            Search answers, browse help categories, or contact our team.
          </p>
          <div className="mx-auto mt-6 max-w-lg">
            <Link href="/search" className="flex items-center gap-3 rounded-full bg-white/10 border border-white/20 px-5 py-3.5 text-white/60 hover:bg-white/15 transition-colors text-sm">
              <span>🔍</span> Search for answers…
            </Link>
          </div>
        </div>
      </div>

      <div className="container-px py-12 space-y-16">
        {/* Help categories */}
        <section>
          <h2 className="text-xl font-extrabold text-navy mb-6">Browse help topics</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HELP_CATEGORIES.map((c) => (
              <Link key={c.title} href={c.href} className="card card-hover flex items-start gap-3 p-5">
                <span className="text-2xl shrink-0">{c.icon}</span>
                <div>
                  <p className="font-bold text-navy text-sm">{c.title}</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-extrabold text-navy mb-6">Frequently asked questions</h2>
          <div className="mx-auto max-w-3xl space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-navy text-sm">{faq.q}</span>
                  <span className={`shrink-0 text-charcoal/40 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-soft-200 px-5 pb-5 pt-4 text-sm text-charcoal/65 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-extrabold text-navy">Still need help?</h2>
              <p className="text-sm text-charcoal/50 mt-1">Our team responds within 24–48 business hours.</p>
            </div>

            {submitted ? (
              <div className="card p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✅</div>
                <h3 className="text-xl font-extrabold text-navy">Thank you!</h3>
                <p className="mt-2 text-sm text-charcoal/60">{FORM_SUBMIT_SUCCESS_MESSAGE}</p>
                <p className="mt-3 text-sm text-charcoal/55">
                  You can also reach us at{" "}
                  <a href={supportMailto} className="font-semibold text-blue hover:underline">
                    {SITE_CONFIG.supportEmail}
                  </a>
                  .
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="btn-outline mt-6 py-2.5 px-6">Send another</button>
              </div>
            ) : (
              <div className="card p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Your name *</label>
                      <input className="input" placeholder="Ahmed Khan" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Email address *</label>
                      <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject *</label>
                    <select className="input" value={form.subject} onChange={(e) => set("subject", e.target.value)} required>
                      <option value="">Select a topic</option>
                      <option>Visa & immigration help</option>
                      <option>Booking & cancellation</option>
                      <option>Payment & refund</option>
                      <option>Account & security</option>
                      <option>Trust & safety report</option>
                      <option>Partner / agent enquiry</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea className="input min-h-[120px] resize-y" placeholder="Describe your issue or question in detail…" rows={5} required value={form.message} onChange={(e) => set("message", e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {loading ? "Sending…" : "Send message"}
                  </button>
                </form>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-charcoal/40">
              <Link href="/legal/disclaimer" className="hover:text-navy">Disclaimer</Link>
              <Link href="/legal/privacy" className="hover:text-navy">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-navy">Terms</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
