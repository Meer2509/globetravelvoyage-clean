"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, StepProgress } from "@/components/AuthLayout";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";

const STEPS = ["Profile", "Services", "Documents", "Done"];

const visaSpecializations = [
  "🇺🇸 USA B1/B2", "🇺🇸 USA Student F1", "🇬🇧 UK Visitor", "🇨🇦 Canada Visitor",
  "🇩🇪 Schengen", "🇦🇪 UAE Visa", "🇸🇦 Saudi Arabia", "🇦🇺 Australia", "🇯🇵 Japan",
];

const languages = ["English", "Urdu", "Arabic", "Hindi", "Tagalog", "Bengali", "French"];

export default function AgentOnboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    yearsExp: "",
    bio: "",
    specializations: [] as string[],
    spokenLanguages: [] as string[],
    priceFrom: "",
    priceTo: "",
    turnaround: "",
    successRate: "",
    offersConsultation: true,
    availableOnWeekends: false,
    consultationFee: "",
    acceptedDocs: [] as string[],
  });

  function toggle<K extends keyof typeof data>(key: K, item: string) {
    const arr = data[key] as string[];
    setData((p) => ({ ...p, [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] }));
  }

  return (
    <AuthLayout
      eyebrow="Visa Expert"
      headline="Set up your expert profile"
      subline="Your profile is your marketplace listing. Make it compelling to attract serious clients."
      showStats={false}
    >
      <div>
        <StepProgress steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Professional profile</h2>
              <p className="mt-1 text-sm text-charcoal/55">This is what clients will see first.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Your full name" value={data.fullName} onChange={(e) => setData((p) => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="your@email.com" value={data.email} onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="e.g. Dubai" value={data.city} onChange={(e) => setData((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={data.country} onChange={(e) => setData((p) => ({ ...p, country: e.target.value }))}>
                  <option value="">Select country</option>
                  <option>🇦🇪 UAE</option>
                  <option>🇵🇰 Pakistan</option>
                  <option>🇸🇦 Saudi Arabia</option>
                  <option>🇮🇳 India</option>
                  <option>🇬🇧 UK</option>
                  <option>🇺🇸 USA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Years of experience</label>
              <select className="input" value={data.yearsExp} onChange={(e) => setData((p) => ({ ...p, yearsExp: e.target.value }))}>
                <option value="">Select experience</option>
                <option>Less than 1 year</option>
                <option>1–2 years</option>
                <option>3–5 years</option>
                <option>5–10 years</option>
                <option>10+ years</option>
              </select>
            </div>

            <div>
              <label className="label">Languages you speak</label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggle("spokenLanguages", lang)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.spokenLanguages.includes(lang) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Professional bio</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="Describe your expertise, experience and what clients can expect…"
                value={data.bio}
                onChange={(e) => setData((p) => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5">Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Services & pricing</h2>
              <p className="mt-1 text-sm text-charcoal/55">Set your specializations and rate.</p>
            </div>

            <div>
              <label className="label">Visa specializations</label>
              <div className="flex flex-wrap gap-2">
                {visaSpecializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggle("specializations", spec)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.specializations.includes(spec) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Price from (USD)</label>
                <input type="number" className="input" placeholder="e.g. 50" value={data.priceFrom} onChange={(e) => setData((p) => ({ ...p, priceFrom: e.target.value }))} />
              </div>
              <div>
                <label className="label">Price up to (USD)</label>
                <input type="number" className="input" placeholder="e.g. 300" value={data.priceTo} onChange={(e) => setData((p) => ({ ...p, priceTo: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Typical turnaround</label>
                <select className="input" value={data.turnaround} onChange={(e) => setData((p) => ({ ...p, turnaround: e.target.value }))}>
                  <option value="">Select</option>
                  <option>24 hours</option>
                  <option>2–3 days</option>
                  <option>3–5 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                </select>
              </div>
              <div>
                <label className="label">Claimed success rate</label>
                <select className="input" value={data.successRate} onChange={(e) => setData((p) => ({ ...p, successRate: e.target.value }))}>
                  <option value="">Select</option>
                  <option>70–80%</option>
                  <option>80–90%</option>
                  <option>90–95%</option>
                  <option>95%+</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-soft-200 p-4 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-navy">Free consultation</p>
                  <p className="text-xs text-charcoal/50">Offer a free 15-min initial call</p>
                </div>
                <div
                  onClick={() => setData((p) => ({ ...p, offersConsultation: !p.offersConsultation }))}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${data.offersConsultation ? "bg-blue" : "bg-soft-200"}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.offersConsultation ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-navy">Weekend availability</p>
                  <p className="text-xs text-charcoal/50">Accept client messages on weekends</p>
                </div>
                <div
                  onClick={() => setData((p) => ({ ...p, availableOnWeekends: !p.availableOnWeekends }))}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${data.availableOnWeekends ? "bg-blue" : "bg-soft-200"}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.availableOnWeekends ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">← Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Verification documents</h2>
              <p className="mt-1 text-sm text-charcoal/55">Upload documents to earn a verified badge.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: "passport", label: "Government ID / Passport", desc: "For identity verification" },
                { key: "license", label: "Travel agent license or certification", desc: "If applicable in your country" },
                { key: "experience", label: "Proof of experience", desc: "Portfolio, client letters, or website" },
                { key: "photo", label: "Professional headshot", desc: "Clear face photo, professional look" },
              ].map((doc) => (
                <label
                  key={doc.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-soft-200 p-4 hover:border-navy/25 transition-colors"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-soft-200 bg-white text-xs">
                    {data.acceptedDocs.includes(doc.key) ? <span className="text-blue">✓</span> : ""}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={data.acceptedDocs.includes(doc.key)}
                    onChange={() => toggle("acceptedDocs", doc.key)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy">{doc.label}</p>
                    <p className="text-xs text-charcoal/50">{doc.desc}</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-soft-200 px-3 py-1.5 text-xs text-charcoal/40 hover:border-blue hover:text-blue transition-colors cursor-pointer">
                    Upload
                  </div>
                </label>
              ))}
            </div>

            <div className="rounded-xl border border-gold/25 bg-gold/5 p-4">
              <p className="text-xs text-charcoal/60">
                <strong className="text-navy">📋 Disclaimer:</strong> Globe Travel Voyage is not a licensing authority. Documents are reviewed by our team only to display a &quot;Verified&quot; badge on your profile. We do not provide legal certification or government-endorsed verification.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Submit profile →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue/10 text-5xl">
              👔
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-navy">Thank you!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              {FORM_SUBMIT_SUCCESS_MESSAGE}
            </p>

            <div className="mt-4 rounded-xl border border-soft-200 bg-soft p-4 text-left text-sm">
              <p className="font-bold text-navy mb-2">While you wait:</p>
              <ul className="space-y-1.5 text-charcoal/60 text-xs">
                <li>✅ Set up your service packages in the dashboard</li>
                <li>✅ Write detailed visa preparation checklists</li>
                <li>✅ Add your authorization form template</li>
                <li>✅ Invite your first client to get a review</li>
              </ul>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link href="/dashboard/agent" className="btn-gold w-full py-3.5 text-base block">
                👔 Open Visa Expert dashboard
              </Link>
              <Link href="/" className="btn-outline w-full py-3 text-sm block">
                Explore the platform
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
