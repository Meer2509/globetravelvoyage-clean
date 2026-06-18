"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";

export type ReviewResult = { ok: true; id: string } | { ok: false; error: string };

export interface SubmitReviewInput {
  targetType: "visa_agent" | "agency" | "tour_guide" | "property" | "tour" | "travel_agent";
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
  const reviewId = (data as { id: string }).id;

  await recalculateTargetRating(admin, input.targetType, input.targetId);

  return { ok: true, id: reviewId };
}

async function recalculateTargetRating(
  admin: ReturnType<typeof createAdminClient>,
  targetType: string,
  targetId: string
) {
  if (!admin) return;

  const { data: reviews } = await admin
    .from("reviews")
    .select("rating")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("is_hidden", false);

  const ratings = (reviews ?? []).map((r) => Number((r as { rating: number }).rating));
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const tableMap: Record<string, string> = {
    agency: "agencies",
    visa_agent: "visa_experts",
    tour_guide: "tour_guides",
    property: "property_listings",
    tour: "tours",
    travel_agent: "travel_agent_profiles",
  };

  const table = tableMap[targetType];
  if (!table) return;

  await admin
    .from(table)
    .update({ rating: Math.round(avg * 100) / 100, review_count: ratings.length })
    .eq("id", targetId);
}

export async function fetchReviewsForTarget(
  targetType: SubmitReviewInput["targetType"],
  targetId: string
): Promise<
  Array<{
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_verified: boolean;
    created_at: string;
    reviewer_name: string;
  }>
> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("reviews")
    .select("id, rating, title, body, is_verified, created_at, reviewer_id")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data?.length) return [];

  const reviewerIds = [...new Set(data.map((r) => (r as { reviewer_id: string }).reviewer_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", reviewerIds);

  const nameMap = new Map<string, string>();
  for (const p of profiles ?? []) {
    const row = p as { id: string; full_name: string | null; email: string };
    nameMap.set(row.id, row.full_name ?? row.email.split("@")[0]);
  }

  return data.map((r) => {
    const row = r as {
      id: string;
      rating: number;
      title: string | null;
      body: string | null;
      is_verified: boolean;
      created_at: string;
      reviewer_id: string;
    };
    return {
      id: row.id,
      rating: row.rating,
      title: row.title,
      body: row.body,
      is_verified: row.is_verified,
      created_at: row.created_at,
      reviewer_name: nameMap.get(row.reviewer_id) ?? "Traveler",
    };
  });
}
