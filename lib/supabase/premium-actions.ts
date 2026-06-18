"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-server";
import { logAdminAudit } from "@/lib/admin/phase1-actions";

export type PremiumResult = { ok: true; data: { id: string } } | { ok: false; error: string };

export async function recordSubscription(input: {
  userId: string;
  planKey: string;
  stripeSubscriptionId: string;
  stripeCustomerId?: string | null;
  currentPeriodEnd?: string | null;
  paymentId?: string | null;
}): Promise<PremiumResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: input.userId,
        plan_key: input.planKey,
        status: "active",
        stripe_subscription_id: input.stripeSubscriptionId,
        stripe_customer_id: input.stripeCustomerId ?? null,
        current_period_end: input.currentPeriodEnd ?? null,
        payment_id: input.paymentId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" }
    )
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function recordPremiumRequest(input: {
  userId: string;
  planKey: string;
  paymentId?: string | null;
  subscriptionId?: string | null;
  requestType?: string;
  details?: Record<string, unknown>;
}): Promise<PremiumResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("premium_requests")
    .insert({
      user_id: input.userId,
      payment_id: input.paymentId ?? null,
      subscription_id: input.subscriptionId ?? null,
      plan_key: input.planKey,
      request_type: input.requestType ?? "concierge",
      status: "pending",
      details: input.details ?? {},
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function recordFeaturedListing(input: {
  userId: string;
  listingType: "travel_agent" | "property" | "group_tour";
  listingId: string;
  paymentId?: string | null;
  stripeSessionId?: string | null;
  expiresAt?: string | null;
}): Promise<PremiumResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("featured_listings")
    .insert({
      user_id: input.userId,
      listing_type: input.listingType,
      listing_id: input.listingId,
      payment_id: input.paymentId ?? null,
      status: "active",
      expires_at: input.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      stripe_session_id: input.stripeSessionId ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function fetchAdminSubscriptions(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const nameMap = new Map<string, string>();

  if (userIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      const row = p as { id: string; full_name: string | null; email: string };
      nameMap.set(row.id, row.full_name ?? row.email);
    }
  }

  return {
    rows: rows.map((r) => ({
      ...r,
      user_name: nameMap.get(r.user_id as string) ?? "—",
    })),
  };
}

export async function fetchAdminPremiumRequests(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("premium_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

export async function fetchAdminFeaturedListings(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("featured_listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

export async function fetchAdminPaymentsExtended(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("payments")
    .select(
      "id, user_id, email, service_type, amount, currency, status, description, stripe_session_id, stripe_payment_intent_id, stripe_customer_id, invoice_number, created_at, paid_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

export async function adminReviewPremiumRequest(
  requestId: string,
  status: "in_review" | "completed" | "canceled",
  adminNotes?: string
): Promise<PremiumResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("premium_requests")
    .update({
      status,
      admin_notes: adminNotes?.trim() || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: `premium_request.${status}`,
    entityType: "premium_requests",
    entityId: requestId,
  });

  return { ok: true, data: { id: requestId } };
}

export async function adminUpdateFeaturedListing(
  listingId: string,
  status: "active" | "expired" | "canceled"
): Promise<PremiumResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("featured_listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: listingId } };
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd?: string | null
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("subscriptions")
    .update({
      status,
      current_period_end: currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}
