"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AuthLayout } from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      eyebrow="Account recovery"
      headline="We'll help you get back in"
      subline="Enter your email and we'll send a secure password reset link to your inbox."
      showStats={false}
    >
      {!submitted ? (
        <div>
          <div className="mb-7">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5">
              <Icon name="shield" className="h-7 w-7 text-navy" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Reset your password</h1>
            <p className="mt-1.5 text-sm text-charcoal/60">
              Enter the email linked to your account and we&apos;ll send you a reset link.
            </p>
          </div>

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
              <p className="mt-1.5 text-xs text-charcoal/45">
                We&apos;ll only send the link to a verified account email.
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
              For security, reset links expire after 24 hours and can only be used once. If you don&apos;t receive an email, check your spam folder.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-charcoal/55">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-blue hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-charcoal/55">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-blue hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      ) : (
        /* ── Success ── */
        <div className="animate-fade-up text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue/10 text-4xl">
            📧
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-navy">Check your inbox</h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
            We&apos;ve sent a password reset link to your email address. The link will expire in{" "}
            <strong className="text-navy">24 hours</strong>.
          </p>

          <div className="mt-6 space-y-2 text-sm text-charcoal/50">
            <p>Didn&apos;t receive it?</p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue font-semibold hover:underline"
            >
              Try a different email address
            </button>
            <p className="text-xs">or check your spam/junk folder</p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/login" className="btn-primary w-full py-3">
              Back to sign in
            </Link>
            <Link href="/" className="btn-outline w-full py-3 text-sm">
              Return to homepage
            </Link>
          </div>

          <p className="mt-5 text-xs text-charcoal/35">
            This is a demo — no actual email has been sent.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
