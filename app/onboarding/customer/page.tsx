"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, StepProgress } from "@/components/AuthLayout";
import { FORM_SUBMIT_SUCCESS_MESSAGE } from "@/lib/site-config";
import { completeCustomerOnboarding } from "@/lib/supabase/onboarding-actions";

const STEPS = ["Preferences", "Travel Style", "AI Settings", "Done"];

const interests = [
  "🏖️ Beach & Resorts", "🏔️ Mountain Hiking", "🏛️ History & Culture", "🍜 Food & Culinary",
  "🛍️ Shopping", "🎭 Arts & Events", "🏄 Adventure Sports", "🧘 Wellness & Spa",
  "🌿 Eco Travel", "🤿 Diving & Snorkeling", "🎿 Skiing", "📸 Photography Tours",
];

export default function CustomerOnboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    nationality: "",
    passportCountry: "",
    basedIn: "",
    currency: "USD",
    selectedInterests: [] as string[],
    travelFreq: "",
    groupType: "",
    budgetRange: "",
    visaCountries: [] as string[],
    notifications: true,
    aiSuggestions: true,
    language: "en",
  });

  function toggleInterest(item: string) {
    setData((prev) => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(item)
        ? prev.selectedInterests.filter((i) => i !== item)
        : [...prev.selectedInterests, item],
    }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const result = await completeCustomerOnboarding({
        nationality: data.nationality,
        passportCountry: data.passportCountry,
        basedIn: data.basedIn,
        currency: data.currency,
        selectedInterests: data.selectedInterests,
        travelFreq: data.travelFreq,
        groupType: data.groupType,
        budgetRange: data.budgetRange,
        visaCountries: data.visaCountries,
        notifications: data.notifications,
        aiSuggestions: data.aiSuggestions,
        language: data.language,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome aboard"
      headline="Let's personalize your experience"
      subline="A few quick questions so our AI can give you the best travel recommendations."
      showStats={false}
    >
      <div>
        <StepProgress steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Your travel profile</h2>
              <p className="mt-1 text-sm text-charcoal/55">Help us tailor visa info and routes for you.</p>
            </div>

            <div>
              <label className="label">Your nationality</label>
              <select className="input" value={data.nationality} onChange={(e) => setData((p) => ({ ...p, nationality: e.target.value }))}>
                <option value="">Select nationality</option>
                <option>🇵🇰 Pakistani</option>
                <option>🇮🇳 Indian</option>
                <option>🇵🇭 Filipino</option>
                <option>🇧🇩 Bangladeshi</option>
                <option>🇦🇪 Emirati</option>
                <option>🇸🇦 Saudi Arabian</option>
                <option>🇬🇧 British</option>
                <option>🇺🇸 American</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label">Passport country</label>
              <select className="input" value={data.passportCountry} onChange={(e) => setData((p) => ({ ...p, passportCountry: e.target.value }))}>
                <option value="">Select passport country</option>
                <option>🇵🇰 Pakistan</option>
                <option>🇮🇳 India</option>
                <option>🇵🇭 Philippines</option>
                <option>🇧🇩 Bangladesh</option>
                <option>🇦🇪 UAE</option>
                <option>🇸🇦 Saudi Arabia</option>
                <option>🇬🇧 UK</option>
                <option>🇺🇸 USA</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label">Currently based in</label>
              <input className="input" placeholder="City, Country" value={data.basedIn} onChange={(e) => setData((p) => ({ ...p, basedIn: e.target.value }))} />
            </div>

            <div>
              <label className="label">Preferred currency</label>
              <select className="input" value={data.currency} onChange={(e) => setData((p) => ({ ...p, currency: e.target.value }))}>
                <option value="USD">$ USD</option>
                <option value="AED">AED UAE Dirham</option>
                <option value="SAR">SAR Saudi Riyal</option>
                <option value="PKR">PKR Pakistani Rupee</option>
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full py-3.5">
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Travel style</h2>
              <p className="mt-1 text-sm text-charcoal/55">This helps our AI plan trips you&apos;ll love.</p>
            </div>

            <div>
              <label className="label">How often do you travel?</label>
              <div className="grid grid-cols-2 gap-2">
                {["Once a year", "2–3 times", "4–6 times", "Monthly +"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, travelFreq: opt }))}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      data.travelFreq === opt ? "border-blue bg-blue/5 text-navy" : "border-soft-200 text-charcoal/60 hover:border-navy/25"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Who do you typically travel with?</label>
              <div className="grid grid-cols-3 gap-2">
                {["Solo", "Partner", "Family", "Friends", "Business", "Group"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, groupType: opt }))}
                    className={`rounded-xl border py-2 text-sm font-medium transition-all ${
                      data.groupType === opt ? "border-blue bg-blue/5 text-navy" : "border-soft-200 text-charcoal/60 hover:border-navy/25"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Typical travel budget per trip</label>
              <div className="grid grid-cols-2 gap-2">
                {["Under $500", "$500–$1,500", "$1,500–$5,000", "$5,000+"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, budgetRange: opt }))}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      data.budgetRange === opt ? "border-blue bg-blue/5 text-navy" : "border-soft-200 text-charcoal/60 hover:border-navy/25"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Travel interests (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.selectedInterests.includes(item)
                        ? "border-blue bg-blue/8 text-navy"
                        : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
              <h2 className="text-xl font-extrabold text-navy">AI & notifications</h2>
              <p className="mt-1 text-sm text-charcoal/55">Customize how our AI assistant works for you.</p>
            </div>

            <div>
              <label className="label">Preferred language</label>
              <select className="input" value={data.language} onChange={(e) => setData((p) => ({ ...p, language: e.target.value }))}>
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 Arabic</option>
                <option value="ur">🇵🇰 Urdu</option>
                <option value="hi">🇮🇳 Hindi</option>
              </select>
            </div>

            <div>
              <label className="label">Visa countries of interest</label>
              <div className="flex flex-wrap gap-2">
                {["🇺🇸 USA", "🇬🇧 UK", "🇨🇦 Canada", "🇦🇪 UAE", "🇸🇦 Saudi", "🇩🇪 Schengen", "🇦🇺 Australia", "🇯🇵 Japan", "🇹🇭 Thailand"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setData((p) => ({
                      ...p,
                      visaCountries: p.visaCountries.includes(c) ? p.visaCountries.filter((x) => x !== c) : [...p.visaCountries, c],
                    }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      data.visaCountries.includes(c) ? "border-blue bg-blue/8 text-navy" : "border-soft-200 text-charcoal/55 hover:border-navy/25"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-soft-200 p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-navy">AI travel suggestions</p>
                  <p className="text-xs text-charcoal/50">Personalized trips and visa recommendations</p>
                </div>
                <div
                  onClick={() => setData((p) => ({ ...p, aiSuggestions: !p.aiSuggestions }))}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${data.aiSuggestions ? "bg-blue" : "bg-soft-200"}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.aiSuggestions ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-navy">Deal & price alerts</p>
                  <p className="text-xs text-charcoal/50">Notify me when prices drop on my routes</p>
                </div>
                <div
                  onClick={() => setData((p) => ({ ...p, notifications: !p.notifications }))}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${data.notifications ? "bg-blue" : "bg-soft-200"}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.notifications ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3" disabled={loading}>← Back</button>
              <button onClick={handleSubmit} className="btn-primary flex-1 py-3" disabled={loading}>
                {loading ? "Saving…" : "Complete setup →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue/10 text-5xl">
              🧳
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-navy">Your profile is ready!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              {FORM_SUBMIT_SUCCESS_MESSAGE}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
              {data.nationality && <span className="rounded-full bg-blue/8 px-3 py-1 font-medium text-navy">{data.nationality}</span>}
              {data.travelFreq && <span className="rounded-full bg-blue/8 px-3 py-1 font-medium text-navy">{data.travelFreq}</span>}
              {data.budgetRange && <span className="rounded-full bg-blue/8 px-3 py-1 font-medium text-navy">{data.budgetRange}</span>}
              {data.selectedInterests.slice(0, 3).map((i) => (
                <span key={i} className="rounded-full bg-gold/10 px-3 py-1 font-medium text-navy">{i}</span>
              ))}
            </div>

            <div className="mt-6 space-y-2.5">
              <Link href="/dashboard/customer" className="btn-gold w-full py-3.5 text-base block">
                🧳 Open my dashboard
              </Link>
              <Link href="/trip-planner" className="btn-primary w-full py-3 block">
                Start AI trip planning
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
