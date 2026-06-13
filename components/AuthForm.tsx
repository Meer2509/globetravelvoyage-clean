"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/data";

const accountTypes: { key: string; label: string; icon: IconName; href: string }[] = [
  { key: "customer", label: "Traveler", icon: "users", href: "/dashboard/customer" },
  { key: "agent", label: "Visa Agent", icon: "agent", href: "/dashboard/agent" },
  { key: "agency", label: "Travel Agency", icon: "agency", href: "/dashboard/agency" },
  { key: "host", label: "Property Host", icon: "property", href: "/dashboard/host" },
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState("customer");
  const [submitted, setSubmitted] = useState(false);
  const target = accountTypes.find((a) => a.key === role) ?? accountTypes[0];

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold text-navy">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-navy/55">
          {mode === "login"
            ? "Log in to your travel command center."
            : "Join Globe Travel Voyage and start planning."}
        </p>

        {mode === "register" && (
          <div className="mt-6">
            <span className="label">I am a…</span>
            <div className="grid grid-cols-2 gap-2">
              {accountTypes.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setRole(a.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    role === a.key
                      ? "border-blue bg-blue/5 text-navy"
                      : "border-soft-200 text-navy/65 hover:border-navy/30"
                  }`}
                >
                  <Icon name={a.icon} className="h-4 w-4" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          {mode === "register" && (
            <div>
              <label className="label">Full name</label>
              <input className="input" placeholder="Your name" required />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        {submitted && (
          <div className="mt-4 rounded-xl border border-blue/20 bg-blue/5 p-4 text-sm text-navy/75">
            <p className="font-semibold text-navy">Sign-in preview</p>
            <p className="mt-1">
              Continue to explore your dashboard:
            </p>
            <Link href={target.href} className="btn-blue mt-3 w-full py-2.5">
              Open {target.label} dashboard
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-navy/55">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link href="/register" className="font-semibold text-blue">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-navy/45">
        By continuing you agree to our{" "}
        <Link href="/legal/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
