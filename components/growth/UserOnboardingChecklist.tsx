"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUserOnboardingChecklist, type OnboardingChecklistState } from "@/lib/growth/onboarding-checklist";
import { ONBOARDING_STEPS } from "@/lib/growth/types";

export function UserOnboardingChecklist({ className = "" }: { className?: string }) {
  const [checklist, setChecklist] = useState<OnboardingChecklistState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserOnboardingChecklist().then((result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setChecklist(result.checklist);
    });
  }, []);

  if (error || !checklist || checklist.isComplete) return null;

  return (
    <div className={`rounded-2xl border border-gold/30 bg-white p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Getting started</p>
          <h3 className="mt-1 text-lg font-extrabold text-navy">Your onboarding checklist</h3>
          <p className="mt-1 text-sm text-charcoal/60">
            {checklist.completedCount} of {checklist.totalCount} complete ({checklist.percentComplete}%)
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-sm font-extrabold text-gold">
          {checklist.percentComplete}%
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${checklist.percentComplete}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {ONBOARDING_STEPS.map((step) => {
          const done = checklist.steps[step.key];
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  done ? "bg-emerald-50 text-emerald-800" : "hover:bg-soft text-navy"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-emerald-500 text-white" : "border border-soft-200 text-charcoal/40"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
