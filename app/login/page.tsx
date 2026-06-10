"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AuthLayout, SocialLogins, AuthDivider } from "@/components/AuthLayout";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const dashboardLinks = [
    { label: "Traveler dashboard", href: "/dashboard/customer", emoji: "🧳" },
    { label: "Visa Expert dashboard", href: "/dashboard/agent", emoji: "👔" },
    { label: "Agency dashboard", href: "/dashboard/agency", emoji: "🏢" },
    { label: "Tour Guide dashboard", href: "/dashboard/guide", emoji: "🧭" },
    { label: "Property Host dashboard", href: "/dashboard/host", emoji: "🏠" },
    { label: "Admin console", href: "/dashboard/admin", emoji: "⚙️" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      headline="Continue your global journey"
      subline="Log in to access your travel command center, visa applications, bookings and AI tools."
    >
      {!submitted ? (
        <div>
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Welcome back</h1>
            <p className="mt-1.5 text-sm text-charcoal/60">
              Log in to your Globe Travel Voyage account.
            </p>
          </div>

          <SocialLogins />
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="label mb-0">Password</span>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue hover:underline"
                >
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded accent-blue" />
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

          {/* Trust indicators */}
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-charcoal/40">
            <span className="flex items-center gap-1">
              <Icon name="shield" className="h-3.5 w-3.5 text-blue" />
              256-bit encrypted
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="h-3.5 w-3.5 text-blue" />
              No spam ever
            </span>
            <span className="flex items-center gap-1">
              <Icon name="globe" className="h-3.5 w-3.5 text-blue" />
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
      ) : (
        /* ── Demo mode: dashboard selector ── */
        <div className="animate-fade-up">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue/10 text-3xl">
              ✅
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-navy">Demo mode — signed in!</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Authentication is not connected yet. Preview any dashboard below:
            </p>
          </div>

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

          <button
            onClick={() => setSubmitted(false)}
            className="mt-5 w-full text-center text-sm text-charcoal/50 hover:text-navy transition-colors"
          >
            ← Back to login form
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
