"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AuthLayout, SocialLogins, AuthDivider, LegalConsent } from "@/components/AuthLayout";

type AccountType = "customer" | "agent" | "agency" | "guide" | "host";

const accountTypes: {
  key: AccountType;
  label: string;
  emoji: string;
  desc: string;
  onboardHref: string;
}[] = [
  { key: "customer", label: "Traveler", emoji: "🧳", desc: "Book trips, track visas, plan with AI", onboardHref: "/onboarding/customer" },
  { key: "agent", label: "Visa Expert", emoji: "👔", desc: "Offer visa prep services, get leads", onboardHref: "/onboarding/agent" },
  { key: "agency", label: "Travel Agency", emoji: "🏢", desc: "List packages, tours and tickets", onboardHref: "/onboarding/agency" },
  { key: "guide", label: "Tour Guide", emoji: "🧭", desc: "List local tours and experiences", onboardHref: "/onboarding/guide" },
  { key: "host", label: "Property Host", emoji: "🏠", desc: "List stays, rentals and properties", onboardHref: "/onboarding/host" },
];

export default function RegisterPage() {
  const [step, setStep] = useState<"type" | "form">("type");
  const [selectedType, setSelectedType] = useState<AccountType>("customer");
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selected = accountTypes.find((a) => a.key === selectedType)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <AuthLayout
      eyebrow="Join for free"
      headline="Start your global travel journey"
      subline="Create your account and unlock AI trip planning, visa guidance and the world's best travel marketplace."
    >
      {submitted ? (
        /* ── Success state ── */
        <div className="animate-fade-up text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue/10 text-4xl">
            🎉
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-navy">Account created!</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Welcome to Globe Travel Voyage. Let&apos;s set up your{" "}
            <strong>{selected.label}</strong> profile.
          </p>
          <div className="mt-6 space-y-3">
            <Link href={selected.onboardHref} className="btn-gold w-full py-3.5 text-base">
              {selected.emoji} Set up my {selected.label} profile
            </Link>
            <Link href="/dashboard" className="btn-outline w-full py-3">
              Skip for now — go to dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-charcoal/40">Demo mode — no real account created yet.</p>
        </div>
      ) : step === "type" ? (
        /* ── Step 1: Account type ── */
        <div>
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Create your account</h1>
            <p className="mt-1.5 text-sm text-charcoal/60">
              Start by choosing how you&apos;ll use Globe Travel Voyage.
            </p>
          </div>

          <div className="space-y-2.5">
            {accountTypes.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => setSelectedType(type.key)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
                  selectedType === type.key
                    ? "border-blue bg-blue/5 ring-2 ring-blue/15"
                    : "border-soft-200 hover:border-navy/25 hover:bg-soft"
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-all ${
                  selectedType === type.key ? "bg-navy text-gold" : "bg-soft text-navy"
                }`}>
                  {type.emoji}
                </span>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${selectedType === type.key ? "text-navy" : "text-navy/80"}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-charcoal/55">{type.desc}</p>
                </div>
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  selectedType === type.key ? "border-blue bg-blue" : "border-soft-200"
                }`}>
                  {selectedType === type.key && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("form")}
            className="btn-primary mt-6 w-full py-3.5 text-base"
          >
            Continue as {selected.emoji} {selected.label}
          </button>

          <p className="mt-5 text-center text-sm text-charcoal/55">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        /* ── Step 2: Registration form ── */
        <div>
          <button
            onClick={() => setStep("type")}
            className="mb-5 flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-navy transition-colors"
          >
            ← Change account type
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-xl">
              {selected.emoji}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">Create {selected.label} account</h1>
              <p className="text-xs text-charcoal/50">{selected.desc}</p>
            </div>
          </div>

          <SocialLogins />
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">First name</label>
                <input className="input" placeholder="Ahmed" required />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" placeholder="Khan" required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label">Phone number</label>
              <div className="flex gap-2">
                <select className="input w-28 shrink-0">
                  <option>🇦🇪 +971</option>
                  <option>🇵🇰 +92</option>
                  <option>🇸🇦 +966</option>
                  <option>🇮🇳 +91</option>
                  <option>🇵🇭 +63</option>
                  <option>🇧🇩 +880</option>
                  <option>🇬🇧 +44</option>
                  <option>🇺🇸 +1</option>
                </select>
                <input type="tel" className="input flex-1" placeholder="50 123 4567" />
              </div>
            </div>

            <div>
              <label className="label">Country</label>
              <select className="input" required>
                <option value="">Select your country</option>
                <option>🇦🇪 United Arab Emirates</option>
                <option>🇵🇰 Pakistan</option>
                <option>🇸🇦 Saudi Arabia</option>
                <option>🇮🇳 India</option>
                <option>🇵🇭 Philippines</option>
                <option>🇧🇩 Bangladesh</option>
                <option>🇬🇧 United Kingdom</option>
                <option>🇺🇸 United States</option>
                <option>🇨🇦 Canada</option>
                <option>🇦🇺 Australia</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-11"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-charcoal/40">Minimum 8 characters with a number</p>
            </div>

            {/* Extra fields for providers */}
            {(selectedType === "agent" || selectedType === "agency" || selectedType === "guide" || selectedType === "host") && (
              <div>
                <label className="label">
                  {selectedType === "agent" ? "Visa specializations" :
                   selectedType === "agency" ? "Agency/business name" :
                   selectedType === "guide" ? "City where you guide" :
                   "City where your property is"}
                </label>
                <input
                  className="input"
                  placeholder={
                    selectedType === "agent" ? "e.g. USA, UK, Schengen" :
                    selectedType === "agency" ? "Your agency name" :
                    selectedType === "guide" ? "e.g. Dubai, Istanbul" :
                    "e.g. Dubai Marina, Karachi"
                  }
                />
              </div>
            )}

            <LegalConsent />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>
                  <Icon name="check" className="h-4 w-4" />
                  Create {selected.label} account
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-charcoal/55">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
