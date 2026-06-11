"use client";

import { useState } from "react";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { submitVisaRequest } from "@/lib/supabase/actions";

const STEPS = ["Your details", "Destination & purpose", "Case overview"] as const;

const NATIONALITIES = ["Pakistani", "Indian", "Filipino", "Bangladeshi", "Sri Lankan", "Nepali", "Egyptian", "Jordanian", "Lebanese", "Moroccan", "Nigerian", "Other"];
const CURRENT_COUNTRIES = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "United Kingdom", "United States", "Canada", "Germany", "Other"];
const DESTINATIONS = ["United States (USA)", "United Kingdom (UK)", "Canada", "Schengen Area", "Australia", "Germany", "France", "UAE", "Saudi Arabia", "Qatar", "Other"];
const PURPOSES = ["Tourism / Vacation", "Business meetings", "Family visit / Reunion", "Study / University", "Work / Employment", "Medical treatment", "Transit", "Other"];

type Step = 0 | 1 | 2;

export default function VisaStartPage() {
  const [step, setStep]         = useState<Step>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    nationality: "", currentCountry: "",
    destination: "", purpose: "", travelDate: "",
    previousRefusals: "no", message: "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canNext() {
    if (step === 0) return form.name && form.email && form.phone;
    if (step === 1) return form.nationality && form.currentCountry && form.destination && form.purpose;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitVisaRequest({
      name: form.name,
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      nationality: form.nationality,
      currentCountry: form.currentCountry,
      destination: form.destination,
      purpose: form.purpose,
      travelDate: form.travelDate,
      previousRefusals: form.previousRefusals,
      message: form.message,
    });

    setLoading(false);

    if (!result.ok) {
      if (result.demo) {
        setSubmitted(true);
        return;
      }
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-[var(--shadow-premium)]">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">✅</div>
          <h1 className="text-2xl font-extrabold text-navy">Application started!</h1>
          <p className="mt-3 text-charcoal/60 leading-relaxed">
            A verified visa expert will review your case and contact you at <strong>{form.email}</strong> within 24 hours. Check your inbox for next steps.
          </p>
          <div className="mt-6 rounded-xl bg-blue/5 border border-blue/15 p-4 text-left text-sm text-charcoal/60 space-y-2">
            <p className="font-semibold text-navy">What happens next:</p>
            <p>1. Expert reviews your case (within 24 hrs)</p>
            <p>2. You receive a personalised document checklist</p>
            <p>3. Expert guides your full application</p>
          </div>
          <Disclaimer className="mt-5 text-left" variant="compact" />
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/customer" className="btn-primary flex-1 py-3">Go to dashboard</Link>
            <Link href="/visa" className="btn-outline flex-1 py-3">Visa guides</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft/50">
      {/* Hero header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/visa" className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Back to visa marketplace
          </Link>
          <span className="eyebrow-white mb-3">Visa application</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Start your visa application</h1>
          <p className="mt-2 text-white/60 text-sm max-w-xl">
            Share your details and a verified visa expert will review your case and guide you through the full process.
          </p>
          {/* Progress */}
          <div className="mt-8 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < step ? "bg-emerald-500 text-white" :
                  i === step ? "bg-gold text-navy" :
                  "bg-white/15 text-white/50"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-gold" : "text-white/50"}`}>{label}</span>
                {i < STEPS.length - 1 && <div className="h-px w-6 sm:w-10 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-px py-10">
        <div className="mx-auto max-w-2xl">
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {/* Step 0: Personal info */}
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-navy">Your details</h2>
                  <p className="text-sm text-charcoal/55">We need basic contact information to connect you with the right expert.</p>
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
                      <label className="label">Alternative WhatsApp</label>
                      <input className="input" type="tel" placeholder="+92 300 0000000" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Destination */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-navy">Destination & purpose</h2>
                  <p className="text-sm text-charcoal/55">Tell us where you&apos;re from, where you currently live, and where you want to go.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Your nationality *</label>
                      <select className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} required>
                        <option value="">Select nationality</option>
                        {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Country you live in *</label>
                      <select className="input" value={form.currentCountry} onChange={(e) => set("currentCountry", e.target.value)} required>
                        <option value="">Select country</option>
                        {CURRENT_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Visa destination *</label>
                      <select className="input" value={form.destination} onChange={(e) => set("destination", e.target.value)} required>
                        <option value="">Select destination</option>
                        {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Purpose of travel *</label>
                      <select className="input" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} required>
                        <option value="">Select purpose</option>
                        {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Planned travel date</label>
                      <input className="input" type="date" value={form.travelDate} onChange={(e) => set("travelDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Previous visa refusals?</label>
                      <select className="input" value={form.previousRefusals} onChange={(e) => set("previousRefusals", e.target.value)}>
                        <option value="no">No previous refusals</option>
                        <option value="yes-same">Yes — same country</option>
                        <option value="yes-other">Yes — different country</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Additional info */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-navy">Case overview</h2>
                  <div className="rounded-xl bg-blue/5 border border-blue/15 p-4 text-sm">
                    <div className="grid grid-cols-2 gap-2 text-charcoal/60">
                      <div><span className="font-semibold text-navy">Name:</span> {form.name}</div>
                      <div><span className="font-semibold text-navy">Email:</span> {form.email}</div>
                      <div><span className="font-semibold text-navy">Nationality:</span> {form.nationality}</div>
                      <div><span className="font-semibold text-navy">Based in:</span> {form.currentCountry}</div>
                      <div><span className="font-semibold text-navy">Destination:</span> {form.destination}</div>
                      <div><span className="font-semibold text-navy">Purpose:</span> {form.purpose}</div>
                    </div>
                  </div>
                  <div>
                    <label className="label">Additional information</label>
                    <textarea
                      className="input min-h-[100px] resize-y"
                      placeholder="Any other context about your situation — employment status, assets, previous travel history, family ties, etc."
                      rows={4}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                  </div>
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-xs text-charcoal/55 leading-relaxed">
                    ⚠ <strong>Important:</strong> Globe Travel Voyage is an independent marketplace. We are NOT a government agency, embassy, or immigration authority. Submitting this form does not guarantee visa approval or any immigration outcome. We connect you with independent visa experts on our marketplace. Always consult a qualified immigration lawyer for your specific case.
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span className="text-xs text-charcoal/60">I understand Globe Travel Voyage is an independent marketplace and does not guarantee visa approval. I agree to the <Link href="/legal/terms" className="text-blue underline">Terms of Service</Link> and <Link href="/legal/disclaimer" className="text-blue underline">Disclaimer</Link>.</span>
                  </label>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="btn-outline py-3 px-6">
                    ← Back
                  </button>
                ) : (
                  <Link href="/visa" className="btn-outline py-3 px-6">Cancel</Link>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    disabled={!canNext()}
                    onClick={() => setStep((s) => (s + 1) as Step)}
                    className="btn-primary py-3 px-8 disabled:opacity-40"
                  >
                    Continue →
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn-primary py-3 px-8 disabled:opacity-60">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : "Submit application →"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center">
            {[
              { icon: "🛡️", text: "Identity-verified experts" },
              { icon: "🔒", text: "Secure & confidential" },
              { icon: "⏱️", text: "Response within 24 hours" },
            ].map((b) => (
              <div key={b.text} className="card p-3 text-xs text-charcoal/55">
                <span className="text-xl">{b.icon}</span>
                <p className="mt-1 font-semibold text-navy">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
