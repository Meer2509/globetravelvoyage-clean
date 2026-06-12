"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { createClient, formatAuthError, getDashboardUrl, isSupabaseConfigured, resolveUserRole } from "@/lib/auth";

function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(formatAuthError(updateError));
      return;
    }

    setDone(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = await resolveUserRole(user);
      router.push(getDashboardUrl(role));
      router.refresh();
    }
  }

  if (done) {
    return (
      <div className="text-center animate-fade-up">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
          ✅
        </div>
        <h2 className="text-xl font-extrabold text-navy">Password updated</h2>
        <p className="mt-2 text-sm text-charcoal/60">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Set a new password</h1>
        <p className="mt-1.5 text-sm text-charcoal/60">
          Choose a strong password for your Globe Travel Voyage account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input
            type="password"
            className="input"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/55">
        <Link href="/login" className="font-bold text-blue hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account security"
      headline="Create your new password"
      subline="Your reset link was verified. Set a new password to secure your account."
      showStats={false}
    >
      {isSupabaseConfigured ? (
        <UpdatePasswordForm />
      ) : (
        <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4 text-sm text-charcoal/70">
          Password updates are temporarily unavailable.{" "}
          <Link href="/contact" className="font-semibold text-blue hover:underline">
            Contact support
          </Link>
          <Link href="/login" className="btn-outline mt-4 w-full py-3 text-sm block text-center">
            Back to sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
