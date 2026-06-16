"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AuthLayout, SocialLogins, AuthDivider, LegalConsent } from "@/components/AuthLayout";
import {
  isSupabaseConfigured,
  createClient,
  getOnboardingUrl,
  formatAuthError,
} from "@/lib/auth";
import { syncUserRole } from "@/lib/supabase/actions";
import { saveProfileOnSignup } from "@/lib/supabase/profile-actions";
import { parseCommaList } from "@/lib/supabase/profile-utils";
import { getAuthCallbackUrl } from "@/lib/site-url";

type AccountType = "customer" | "visa_agent" | "travel_agency" | "tour_guide" | "property_host";

const accountTypes: {
  key: AccountType;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { key: "customer",      label: "Traveler",       emoji: "🧳", desc: "Book trips, track visas, plan with AI" },
  { key: "visa_agent",    label: "Visa Expert",    emoji: "👔", desc: "Offer visa prep services, get leads" },
  { key: "travel_agency", label: "Travel Agency",  emoji: "🏢", desc: "List packages, tours and tickets" },
  { key: "tour_guide",    label: "Tour Guide",     emoji: "🧭", desc: "List local tours and experiences" },
  { key: "property_host", label: "Property Host",  emoji: "🏠", desc: "List stays, rentals and properties" },
];

// ── Setup Required (when Supabase keys are missing) ───────────────────────────

function SetupRequired() {
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔧</span>
          <div>
            <p className="font-bold text-navy text-sm">Registration temporarily unavailable</p>
            <p className="mt-1 text-xs text-charcoal/60">
              New account sign-up is being prepared. Please check back shortly or{" "}
              <Link href="/contact" className="text-blue hover:underline font-semibold">
                contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm text-charcoal/55 text-center">
        Already exploring the platform?{" "}
        <Link href="/login" className="font-bold text-blue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ── Account type selector step ────────────────────────────────────────────────

function TypeSelector({
  selected,
  onSelect,
  onContinue,
}: {
  selected: AccountType;
  onSelect: (t: AccountType) => void;
  onContinue: () => void;
}) {
  const sel = accountTypes.find((a) => a.key === selected)!;
  return (
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
            onClick={() => onSelect(type.key)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
              selected === type.key
                ? "border-blue bg-blue/5 ring-2 ring-blue/15"
                : "border-soft-200 hover:border-navy/25 hover:bg-soft"
            }`}
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-all ${
              selected === type.key ? "bg-navy" : "bg-soft"
            }`}>
              {type.emoji}
            </span>
            <div className="flex-1">
              <p className={`font-bold text-sm ${selected === type.key ? "text-navy" : "text-navy/80"}`}>
                {type.label}
              </p>
              <p className="text-xs text-charcoal/55">{type.desc}</p>
            </div>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              selected === type.key ? "border-blue bg-blue" : "border-soft-200"
            }`}>
              {selected === type.key && <span className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>
      <button onClick={onContinue} className="btn-primary mt-6 w-full py-3.5 text-base">
        Continue as {sel.emoji} {sel.label}
      </button>
      <p className="mt-5 text-center text-sm text-charcoal/55">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-blue hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

// ── Registration form step ────────────────────────────────────────────────────

function RegisterForm({
  selectedType,
  onBack,
  onSuccess,
}: {
  selectedType: AccountType;
  onBack: () => void;
  onSuccess: (onboardingUrl: string) => void;
}) {
  const router = useRouter();
  const sel = accountTypes.find((a) => a.key === selectedType)!;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [country, setCountry]     = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [extra, setExtra]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    const fullName = `${firstName} ${lastName}`.trim();
    const isAgency = selectedType === "travel_agency";
    const isGuide = selectedType === "tour_guide";
    const isHost = selectedType === "property_host";
    const isAgent = selectedType === "visa_agent";

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedType,
          phone,
          country,
          city: isGuide || isHost ? extra : undefined,
          company_name: isAgency ? extra : undefined,
          business_type: selectedType,
          specializations: isAgent ? extra : undefined,
          extra_info: extra,
        },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthError(authError));
      return;
    }

    if (!data.user) return;

    const profilePayload = {
      userId: data.user.id,
      email,
      fullName,
      phone,
      country,
      city: isGuide || isHost ? extra : undefined,
      role: selectedType,
      companyName: isAgency ? extra : undefined,
      businessType: selectedType,
      specializations: isAgent && extra ? parseCommaList(extra) : undefined,
    };

    if (!data.session) {
      await saveProfileOnSignup(profilePayload);
      setEmailSent(true);
      return;
    }

    await syncUserRole(data.user.id, selectedType);
    await saveProfileOnSignup(profilePayload);
    onSuccess(getOnboardingUrl(selectedType));
    router.push(getOnboardingUrl(selectedType));
    router.refresh();
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue/10 text-4xl">
          📧
        </div>
        <h2 className="text-xl font-extrabold text-navy">Check your email</h2>
        <p className="mt-2 text-sm text-charcoal/60">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start onboarding.
        </p>
        <div className="mt-5 rounded-xl border border-soft-200 bg-soft p-4 text-left text-xs text-charcoal/55">
          <p>
            <strong className="text-navy">Didn&apos;t receive it?</strong> Check your spam folder. The link expires in 24 hours.
          </p>
        </div>
        <Link href="/login" className="btn-outline mt-5 w-full py-3 text-sm block">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm text-charcoal/50 hover:text-navy transition-colors"
      >
        ← Change account type
      </button>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-xl">{sel.emoji}</div>
        <div>
          <h1 className="text-xl font-extrabold text-navy">Create {sel.label} account</h1>
          <p className="text-xs text-charcoal/50">{sel.desc}</p>
        </div>
      </div>

      <SocialLogins />
      <AuthDivider />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">First name</label>
            <input className="input" placeholder="Ahmed" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="label">Last name</label>
            <input className="input" placeholder="Khan" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Email address</label>
          <input type="email" className="input" placeholder="you@example.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="label">Phone (optional)</label>
          <div className="flex gap-2">
            <select className="input w-28 shrink-0">
              <option>🇦🇪 +971</option>
              <option>🇵🇰 +92</option>
              <option>🇸🇦 +966</option>
              <option>🇮🇳 +91</option>
              <option>🇵🇭 +63</option>
              <option>🇬🇧 +44</option>
              <option>🇺🇸 +1</option>
            </select>
            <input type="tel" className="input flex-1" placeholder="50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Country</label>
          <select className="input" required value={country} onChange={(e) => setCountry(e.target.value)}>
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
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="input pr-11"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal">
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {(selectedType !== "customer") && (
          <div>
            <label className="label">
              {selectedType === "visa_agent"    ? "Visa specializations (e.g. USA, UK)" :
               selectedType === "travel_agency" ? "Agency / business name"              :
               selectedType === "tour_guide"    ? "City where you guide"                :
               "City where your property is"}
            </label>
            <input
              className="input"
              placeholder={
                selectedType === "visa_agent"    ? "e.g. USA B1/B2, UK Visitor" :
                selectedType === "travel_agency" ? "Your agency name"            :
                selectedType === "tour_guide"    ? "e.g. Dubai, Istanbul"        :
                "e.g. Dubai Marina"
              }
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
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
              Create {sel.label} account
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-charcoal/55">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-blue hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const ROLE_PARAM_MAP: Record<string, AccountType> = {
  customer: "customer",
  agent: "visa_agent",
  visa_agent: "visa_agent",
  agency: "travel_agency",
  travel_agency: "travel_agency",
  guide: "tour_guide",
  tour_guide: "tour_guide",
  host: "property_host",
  property_host: "property_host",
};

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const roleKey = searchParams.get("role") ?? searchParams.get("type") ?? "none";
  const roleParam = searchParams.get("role") ?? searchParams.get("type");
  const initialRole =
    roleParam && ROLE_PARAM_MAP[roleParam] ? ROLE_PARAM_MAP[roleParam] : null;

  return <RegisterFlow key={roleKey} initialRole={initialRole} />;
}

function RegisterFlow({ initialRole }: { initialRole: AccountType | null }) {
  const [step, setStep] = useState<"type" | "form">(initialRole ? "form" : "type");
  const [selectedType, setSelectedType] = useState<AccountType>(initialRole ?? "customer");

  return (
    <AuthLayout
      eyebrow="Join for free"
      headline="Start your global travel journey"
      subline="Create your account and unlock AI trip planning, visa guidance and the world's best travel marketplace."
    >
      {!isSupabaseConfigured ? (
        <SetupRequired />
      ) : step === "type" ? (
        <TypeSelector
          selected={selectedType}
          onSelect={setSelectedType}
          onContinue={() => setStep("form")}
        />
      ) : (
        <RegisterForm
          selectedType={selectedType}
          onBack={() => setStep("type")}
          onSuccess={() => {}}
        />
      )}
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
