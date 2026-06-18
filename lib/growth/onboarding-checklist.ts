"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { ONBOARDING_STEPS, type OnboardingStepKey } from "./types";
import { trackGrowthEvent } from "./track-event";

export interface OnboardingChecklistState {
  steps: Record<OnboardingStepKey, boolean>;
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  isComplete: boolean;
}

const DEFAULT_STEPS = (): Record<OnboardingStepKey, boolean> => ({
  complete_profile: false,
  try_concierge: false,
  browse_visa_guides: false,
  save_a_trip: false,
  submit_first_request: false,
});

export async function fetchUserOnboardingChecklist(): Promise<
  { ok: true; checklist: OnboardingChecklistState } | { ok: false; error: string }
> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to view your onboarding checklist." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data } = await admin
    .from("user_onboarding_checklist")
    .select("steps, completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const steps = {
    ...DEFAULT_STEPS(),
    ...((data as { steps?: Record<string, boolean> } | null)?.steps ?? {}),
  } as Record<OnboardingStepKey, boolean>;

  const completedCount = ONBOARDING_STEPS.filter((s) => steps[s.key]).length;
  const totalCount = ONBOARDING_STEPS.length;

  return {
    ok: true,
    checklist: {
      steps,
      completedCount,
      totalCount,
      percentComplete: Math.round((completedCount / totalCount) * 100),
      isComplete: completedCount === totalCount,
    },
  };
}

export async function completeOnboardingStep(
  stepKey: OnboardingStepKey
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("user_onboarding_checklist")
    .select("steps")
    .eq("user_id", user.id)
    .maybeSingle();

  const steps = {
    ...DEFAULT_STEPS(),
    ...((existing as { steps?: Record<string, boolean> } | null)?.steps ?? {}),
    [stepKey]: true,
  };

  const allDone = ONBOARDING_STEPS.every((s) => steps[s.key]);
  const now = new Date().toISOString();

  if (existing) {
    const { error } = await admin
      .from("user_onboarding_checklist")
      .update({
        steps,
        completed_at: allDone ? now : null,
        updated_at: now,
      })
      .eq("user_id", user.id);

    if (error && !isMissingTableError(error)) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("user_onboarding_checklist").insert({
      user_id: user.id,
      steps,
      completed_at: allDone ? now : null,
      updated_at: now,
    });

    if (error && !isMissingTableError(error)) return { ok: false, error: error.message };
  }

  trackGrowthEvent({
    eventType: "onboarding_step",
    userId: user.id,
    metadata: { step: stepKey, all_done: allDone },
  });

  return { ok: true };
}

export async function ensureOnboardingChecklistForUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: existing } = await admin
    .from("user_onboarding_checklist")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  await admin.from("user_onboarding_checklist").insert({
    user_id: userId,
    steps: DEFAULT_STEPS(),
  });
}
