"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";

export type ReviewResult = { ok: true; id: string } | { ok: false; error: string };

export interface SubmitReviewInput {
  targetType: "visa_agent" | "agency" | "tour_guide" | "property" | "tour";
  targetId: string;
  rating: number;
  title?: string;
  body?: string;
  paymentId?: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<ReviewResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to leave a review." };

  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin is not configured." };

  if (input.paymentId) {
    const { data: payment } = await admin
      .from("payments")
      .select("id, status, user_id")
      .eq("id", input.paymentId)
      .eq("user_id", user.id)
      .eq("status", "paid")
      .maybeSingle();

    if (!payment) {
      return { ok: false, error: "Verified reviews require a completed purchase." };
    }
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      target_type: input.targetType,
      target_id: input.targetId,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body ?? null,
      is_verified: Boolean(input.paymentId),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}
