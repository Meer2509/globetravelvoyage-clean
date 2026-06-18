"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import {
  PROVIDER_ONBOARDING_STEPS,
  type ProviderAcquisitionRole,
  type ProviderOnboardingState,
} from "./types";
import { markProviderReferralOnboarded } from "./referral-actions";

function defaultSteps(role: ProviderAcquisitionRole): Record<string, boolean> {
  const steps: Record<string, boolean> = {};
  for (const s of PROVIDER_ONBOARDING_STEPS[role]) {
    steps[s.key] = false;
  }
  return steps;
}

function computeScore(role: ProviderAcquisitionRole, steps: Record<string, boolean>): number {
  const keys = PROVIDER_ONBOARDING_STEPS[role].map((s) => s.key);
  const done = keys.filter((k) => steps[k]).length;
  return Math.round((done / keys.length) * 100);
}

export async function ensureProviderOnboardingProgress(
  userId: string,
  role: ProviderAcquisitionRole
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: existing } = await admin
    .from("provider_onboarding_progress")
    .select("user_id")
    .eq("user_id", userId)
    .eq("provider_role", role)
    .maybeSingle();

  if (existing) return;

  const steps = defaultSteps(role);
  steps.account_created = true;

  await admin.from("provider_onboarding_progress").insert({
    user_id: userId,
    provider_role: role,
    steps,
    completion_score: computeScore(role, steps),
    current_step: 1,
  });
}

export async function fetchProviderOnboardingProgress(
  role: ProviderAcquisitionRole
): Promise<{ ok: true; state: ProviderOnboardingState } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  await ensureProviderOnboardingProgress(user.id, role);

  const { data } = await admin
    .from("provider_onboarding_progress")
    .select("steps, completion_score, current_step, completed_at")
    .eq("user_id", user.id)
    .eq("provider_role", role)
    .maybeSingle();

  const row = data as {
    steps?: Record<string, boolean>;
    completion_score?: number;
    current_step?: number;
    completed_at?: string | null;
  } | null;

  const steps = { ...defaultSteps(role), ...(row?.steps ?? {}) };
  const totalSteps = PROVIDER_ONBOARDING_STEPS[role].length;
  const completionScore = row?.completion_score ?? computeScore(role, steps);

  return {
    ok: true,
    state: {
      providerRole: role,
      steps,
      completionScore,
      currentStep: row?.current_step ?? 0,
      totalSteps,
      isComplete: Boolean(row?.completed_at) || completionScore >= 100,
    },
  };
}

export async function updateProviderOnboardingStep(input: {
  role: ProviderAcquisitionRole;
  stepKey: string;
  stepIndex: number;
}): Promise<{ ok: true; completionScore: number } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  await ensureProviderOnboardingProgress(user.id, input.role);

  const { data: existing } = await admin
    .from("provider_onboarding_progress")
    .select("steps")
    .eq("user_id", user.id)
    .eq("provider_role", input.role)
    .maybeSingle();

  const steps = {
    ...defaultSteps(input.role),
    ...((existing as { steps?: Record<string, boolean> } | null)?.steps ?? {}),
    [input.stepKey]: true,
  };

  const completionScore = computeScore(input.role, steps);
  const allDone = PROVIDER_ONBOARDING_STEPS[input.role].every((s) => steps[s.key]);
  const now = new Date().toISOString();

  const { error } = await admin
    .from("provider_onboarding_progress")
    .update({
      steps,
      completion_score: completionScore,
      current_step: input.stepIndex,
      completed_at: allDone ? now : null,
      updated_at: now,
    })
    .eq("user_id", user.id)
    .eq("provider_role", input.role);

  if (error && !isMissingTableError(error)) {
    return { ok: false, error: error.message };
  }

  if (input.stepKey === "submitted") {
    markProviderReferralOnboarded(user.id, input.role);
  }

  return { ok: true, completionScore };
}

export async function fetchIncompleteProviderOnboardings(limit = 50): Promise<
  Array<{ user_id: string; provider_role: string; completion_score: number; updated_at: string }>
> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("provider_onboarding_progress")
    .select("user_id, provider_role, completion_score, updated_at, completed_at")
    .is("completed_at", null)
    .lt("completion_score", 100)
    .order("updated_at", { ascending: true })
    .limit(limit);

  return (data ?? []) as Array<{
    user_id: string;
    provider_role: string;
    completion_score: number;
    updated_at: string;
  }>;
}
