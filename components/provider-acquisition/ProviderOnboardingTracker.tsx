"use client";

import { useEffect, useState } from "react";
import {
  fetchProviderOnboardingProgress,
  updateProviderOnboardingStep,
} from "@/lib/provider-acquisition/onboarding-progress";
import { PROVIDER_ONBOARDING_STEPS } from "@/lib/provider-acquisition/types";
import type { ProviderAcquisitionRole } from "@/lib/provider-acquisition/types";

const STEP_KEYS: Record<ProviderAcquisitionRole, string[]> = {
  visa_agent: ["profile", "services", "documents", "submitted"],
  travel_agency: ["business", "services", "verification", "submitted"],
  tour_guide: ["profile", "tours", "availability", "submitted"],
  property_host: ["property", "details", "policies", "submitted"],
};

export function ProviderOnboardingTracker({
  role,
  stepIndex,
}: {
  role: ProviderAcquisitionRole;
  stepIndex: number;
}) {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const stepKey = STEP_KEYS[role][stepIndex];
    if (!stepKey) return;

    updateProviderOnboardingStep({ role, stepKey, stepIndex }).then((result) => {
      if (result.ok) setScore(result.completionScore);
    });

    fetchProviderOnboardingProgress(role).then((result) => {
      if (result.ok) setScore(result.state.completionScore);
    });
  }, [role, stepIndex]);

  const steps = PROVIDER_ONBOARDING_STEPS[role];
  const displayScore = score ?? Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-navy">Onboarding progress</span>
        <span className="font-extrabold text-gold">{displayScore}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${displayScore}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-charcoal/50">
        Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
      </p>
    </div>
  );
}
