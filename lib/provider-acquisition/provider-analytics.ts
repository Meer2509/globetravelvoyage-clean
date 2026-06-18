"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import type { ProviderAnalyticsReport, ProviderAcquisitionRole } from "./types";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function countSince(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  table: string,
  column: string,
  value: string,
  since: string
): Promise<number> {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", since);

  if (error && !isMissingTableError(error)) return 0;
  return count ?? 0;
}

export async function recordProviderProfileView(input: {
  providerUserId: string;
  providerRole: ProviderAcquisitionRole;
  sessionId?: string;
  sourcePath?: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("provider_profile_views").insert({
    provider_user_id: input.providerUserId,
    provider_role: input.providerRole,
    session_id: input.sessionId ?? null,
    source_path: input.sourcePath ?? null,
  });
}

export async function fetchProviderAnalytics(periodDays = 30): Promise<
  { ok: true; report: ProviderAnalyticsReport } | { ok: false; error: string }
> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const since = daysAgoIso(periodDays);
  const userId = user.id;

  const [
    profileViews,
    agentProfileRes,
    listingRes,
    bookingRequests,
    reviewsRes,
  ] = await Promise.all([
    countSince(admin, "provider_profile_views", "provider_user_id", userId, since),
    admin.from("travel_agent_profiles").select("id").eq("user_id", userId).maybeSingle(),
    admin.from("property_listings").select("id").eq("user_id", userId),
    countSince(admin, "booking_requests", "user_id", userId, since),
    admin
      .from("reviews")
      .select("rating")
      .eq("target_id", userId),
  ]);

  let inquiries = 0;
  const agentProfileId = (agentProfileRes.data as { id: string } | null)?.id;
  if (agentProfileId) {
    inquiries += await countSince(admin, "travel_agent_inquiries", "profile_id", agentProfileId, since);
  }

  const listingIds = ((listingRes.data ?? []) as Array<{ id: string }>).map((l) => l.id);
  if (listingIds.length > 0) {
    const { count } = await admin
      .from("property_inquiries")
      .select("*", { count: "exact", head: true })
      .in("property_listing_id", listingIds)
      .gte("created_at", since);
    inquiries += count ?? 0;
  }

  const reviewRows = (reviewsRes.data ?? []) as Array<{ rating: number }>;
  const reviews = reviewRows.length;
  const averageRating =
    reviews > 0
      ? Math.round((reviewRows.reduce((s, r) => s + r.rating, 0) / reviews) * 10) / 10
      : null;

  return {
    ok: true,
    report: {
      profileViews,
      inquiries,
      bookings: bookingRequests,
      reviews,
      averageRating,
      periodDays,
    },
  };
}
