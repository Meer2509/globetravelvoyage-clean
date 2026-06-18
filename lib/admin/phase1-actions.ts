"use server";

import { requireAdmin } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/auth-server";

export type Phase1AdminResult = { ok: true } | { ok: false; error: string };

export async function logAdminAudit(input: {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const actorId = await getSessionUserId();

  await admin.from("admin_audit_log").insert({
    actor_id: actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function moderateReview(
  reviewId: string,
  action: "hide" | "show" | "delete" | "approve" | "reject"
): Promise<Phase1AdminResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("reviews")
    .select("target_type, target_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (action === "delete") {
    const { error } = await admin.from("reviews").delete().eq("id", reviewId);
    if (error) return { ok: false, error: error.message };
  } else if (action === "approve") {
    const { error } = await admin
      .from("reviews")
      .update({ status: "approved", is_hidden: false, updated_at: new Date().toISOString() })
      .eq("id", reviewId);
    if (error) return { ok: false, error: error.message };
  } else if (action === "reject") {
    const { error } = await admin
      .from("reviews")
      .update({ status: "rejected", is_hidden: true, updated_at: new Date().toISOString() })
      .eq("id", reviewId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from("reviews")
      .update({
        is_hidden: action === "hide",
        status: action === "hide" ? "rejected" : "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);
    if (error) return { ok: false, error: error.message };
  }

  if (existing) {
    const row = existing as { target_type: string; target_id: string };
    const { recalculateReviewTargetRating } = await import("@/lib/supabase/review-actions");
    await recalculateReviewTargetRating(row.target_type, row.target_id);
  }

  await logAdminAudit({
    action: `review.${action}`,
    entityType: "reviews",
    entityId: reviewId,
  });

  return { ok: true };
}

export async function updatePropertyInquiryStatus(
  inquiryId: string,
  status: string,
  adminNotes?: string
): Promise<Phase1AdminResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes !== undefined) payload.admin_notes = adminNotes.trim() || null;

  const { error } = await admin.from("property_inquiries").update(payload).eq("id", inquiryId);
  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: "property_inquiry.status",
    entityType: "property_inquiries",
    entityId: inquiryId,
    metadata: { status },
  });

  return { ok: true };
}

export async function fetchAdminReviews(limit = 100) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("reviews")
    .select("id, reviewer_id, target_type, target_id, rating, title, body, is_verified, is_hidden, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };

  const reviewerIds = [...new Set((data ?? []).map((r) => (r as { reviewer_id: string }).reviewer_id))];
  const nameMap = new Map<string, string>();

  if (reviewerIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", reviewerIds);
    for (const p of profiles ?? []) {
      const row = p as { id: string; full_name: string | null; email: string };
      nameMap.set(row.id, row.full_name ?? row.email);
    }
  }

  return {
    rows: (data ?? []).map((r) => ({
      ...(r as Record<string, unknown>),
      reviewer_name: nameMap.get((r as { reviewer_id: string }).reviewer_id) ?? "—",
    })),
    error: undefined,
  };
}

export async function fetchAdminConversations(limit = 50) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("conversations")
    .select("id, kind, subject, context_type, context_id, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: data ?? [] };
}

export async function fetchAdminAuditLog(limit = 100) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("admin_audit_log")
    .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: data ?? [] };
}
