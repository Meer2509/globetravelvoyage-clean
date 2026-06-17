"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { AuthLayout } from "@/components/AuthLayout";
import {
  isSupabaseConfigured,
  createClient,
  getDashboardUrl,
  resolveUserRole,
  formatAuthError,
  ROLE_LABELS,
  ROLE_EMOJI,
} from "@/lib/auth";

// ── Setup Required (when Supabase keys are missing) ───────────────────────────

function SetupRequired() {
  const dashboardLinks = [
    { label: "Traveler dashboard", href: "/dashboard/customer", emoji: "🧳" },
    { label: "Visa Expert dashboard", href: "/dashboard/agent", emoji: "👔" },
    { label: "Agency dashboard", href: "/dashboard/agency", emoji: "🏢" },
    { label: "Tour Guide dashboard", href: "/dashboard/guide", emoji: "🧭" },
    { label: "Property Host dashboard", href: "/dashboard/host", emoji: "🏠" },
    { label: "Admin console", href: "/dashboard/admin", emoji: "⚙️" },
  ];

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔧</span>
          <div>
            <p className="font-bold text-navy text-sm">Sign-in temporarily unavailable</p>
            <p className="mt-1 text-xs text-charcoal/60">
              Account access is being prepared. Please check back shortly or{" "}
              <Link href="/contact" className="text-blue hover:underline font-semibold">
                contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-lg font-extrabold text-navy">Preview a dashboard</h2>
      <p className="mb-4 text-sm text-charcoal/55">Click any dashboard below to explore:</p>
      <div className="space-y-2">
        {dashboardLinks.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="flex items-center gap-3 rounded-xl border border-soft-200 p-3.5 hover:border-blue hover:bg-blue/5 transition-all group"
          >
            <span className="text-xl">{d.emoji}</span>
            <span className="flex-1 text-sm font-semibold text-navy">{d.label}</span>
            <span className="text-xs text-blue opacity-0 group-hover:opacity-100 transition-opacity">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Login form (when Supabase IS configured) ──────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    if (urlError === "link_expired") {
      return "Your confirmation link has expired. Sign in or register again to receive a new email.";
    }
    if (urlError === "auth_callback" || urlError === "missing_code") {
      return "Authentication failed. Please try again or request a new confirmation link.";
    }
    return "";
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthError(authError));
      return;
    }

    if (data.user) {
      const role = await resolveUserRole(data.user);
      const destination = nextPath || getDashboardUrl(role);
      router.push(destination);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-sm text-charcoal/60">
          Sign in to your Globe Travel Voyage account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label mb-0">Password</span>
            <Link href="/forgot-password" className="text-xs font-semibold text-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="input pr-11"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-blue"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="text-sm text-charcoal/60">Remember me for 30 days</span>
        </label>

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
              Signing in…
            </span>
          ) : (
            <>
              <Icon name="check" className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-charcoal/40">
        <span className="flex items-center gap-1">
          <Icon name="shield" className="h-3.5 w-3.5 text-blue" />
          256-bit encrypted
        </span>
        <span className="flex items-center gap-1">
          <Icon name="check" className="h-3.5 w-3.5 text-blue" />
          GDPR compliant
        </span>
      </div>

      <p className="mt-6 text-center text-sm text-charcoal/55">
        New here?{" "}
        <Link href="/register" className="font-bold text-blue hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}

// ── Dummy labels/emoji used in success state ──────────────────────────────────
void ROLE_LABELS; void ROLE_EMOJI;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      headline="Continue your global journey"
      subline="Log in to access your travel command center, visa applications, bookings and AI tools."
    >
      <Suspense fallback={<div className="skeleton h-64 w-full" />}>
        {isSupabaseConfigured ? <LoginForm /> : <SetupRequired />}
      </Suspense>
    </AuthLayout>
  );
}
