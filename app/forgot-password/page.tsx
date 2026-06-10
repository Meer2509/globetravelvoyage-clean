"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AuthLayout } from "@/components/AuthLayout";
import { isSupabaseConfigured, createClient, formatAuthError } from "@/lib/auth";

function SetupRequired() {
  return (
    <div>
      <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔧</span>
          <div>
            <p className="font-bold text-navy text-sm">Demo mode — Supabase not connected</p>
            <p className="mt-1 text-xs text-charcoal/60">
              Password reset requires Supabase.{" "}
              <Link href="/admin/setup" className="text-blue font-semibold hover:underline">
                View setup guide →
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Link href="/login" className="btn-outline mt-5 w-full py-3 text-sm block text-center">
        Back to sign in
      </Link>
    </div>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (authError) {
      setError(formatAuthError(authError));
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue/10 text-4xl">
          📧
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-navy">Check your inbox</h2>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
          We sent a reset link to <strong className="text-navy">{email}</strong>. Click it to create a new password. The link expires in 24 hours.
        </p>
        <div className="mt-5 space-y-2.5">
          <button
            onClick={() => { setSubmitted(false); setEmail(""); }}
            className="btn-primary w-full py-3"
          >
            Try a different email
          </button>
          <Link href="/login" className="btn-outline w-full py-3 text-sm block">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5">
          <Icon name="shield" className="h-7 w-7 text-navy" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Reset your password</h1>
        <p className="mt-1.5 text-sm text-charcoal/60">
          Enter your account email and we&apos;ll send a secure reset link.
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
          <p className="mt-1.5 text-xs text-charcoal/45">
            We&apos;ll only send the link to a registered account email.
          </p>
        </div>

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
              Sending reset link…
            </span>
          ) : (
            <>
              <Icon name="check" className="h-4 w-4" />
              Send reset link
            </>
          )}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-soft-200 bg-soft p-4">
        <p className="flex items-start gap-2 text-xs text-charcoal/60">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
          For security, links expire after 24 hours and can only be used once.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-charcoal/55">
        Remember your password?{" "}
        <Link href="/login" className="font-bold text-blue hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account recovery"
      headline="We'll help you get back in"
      subline="Enter your email and we'll send a secure password reset link to your inbox."
      showStats={false}
    >
      {isSupabaseConfigured ? <ForgotPasswordForm /> : <SetupRequired />}
    </AuthLayout>
  );
}
