"use server";

import { createAdminClient } from "./admin";
import { createServerSupabaseClient } from "./server";
import { requireAdmin, requireSession } from "@/lib/auth-server";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logAdminAudit } from "@/lib/admin/phase1-actions";
import { trackGrowthEvent } from "@/lib/growth/track-event";
import { markAbandonedInquirySubmitted } from "@/lib/growth/abandoned-inquiry-actions";
import { completeOnboardingStep } from "@/lib/growth/onboarding-checklist";
import {
  PUBLIC_PROPERTY_STATUS,
  PROPERTY_LISTING_SELECT,
  type PropertyListingRow,
} from "./property-types";

export type PropertyActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function getOptionalUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function adminDb() {
  return createAdminClient();
}

function normalizeListingRow(row: Record<string, unknown>): PropertyListingRow {
  return {
    ...(row as PropertyListingRow),
    is_featured: Boolean(row.is_featured),
    admin_notes: (row.admin_notes as string | null) ?? null,
    rating: (row.rating as number | null) ?? null,
    review_count: (row.review_count as number | null) ?? null,
    updated_at: (row.updated_at as string | null) ?? null,
  };
}

// ── Public marketplace ──────────────────────────────────────────────────────

export async function fetchApprovedPropertyListings(): Promise<PropertyListingRow[]> {
  const admin = adminDb();
  if (!admin) return [];

  const { data, error } = await admin
    .from("property_listings")
    .select(PROPERTY_LISTING_SELECT)
    .eq("status", PUBLIC_PROPERTY_STATUS)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[property] fetch approved failed", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeListingRow(row as Record<string, unknown>));
}

export async function fetchApprovedPropertyById(id: string): Promise<PropertyListingRow | null> {
  const admin = adminDb();
  if (!admin) return null;

  const { data, error } = await admin
    .from("property_listings")
    .select(PROPERTY_LISTING_SELECT)
    .eq("id", id)
    .eq("status", PUBLIC_PROPERTY_STATUS)
    .maybeSingle();

  if (error) {
    console.error("[property] fetch by id failed", error.message);
    return null;
  }
  return normalizeListingRow(data as Record<string, unknown>);
}

// ── Host dashboard ────────────────────────────────────────────────────────────

export async function fetchHostPropertyListings(): Promise<{
  rows: PropertyListingRow[];
  error?: string;
}> {
  const session = await requireSession();
  if (!session.ok) return { rows: [], error: session.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("property_listings")
    .select(PROPERTY_LISTING_SELECT)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []).map((row) => normalizeListingRow(row as Record<string, unknown>)) };
}

// ── Inquiries ─────────────────────────────────────────────────────────────────

export async function submitPropertyInquiry(input: {
  propertyListingId: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<PropertyActionResult> {
  const admin = adminDb();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const userId = await getOptionalUserId();
  const rateBlocked = await enforceRateLimit("form", userId);
  if (!rateBlocked.ok) return { ok: false, error: rateBlocked.error };

  const { data: listing } = await admin
    .from("property_listings")
    .select("id, title, city, status")
    .eq("id", input.propertyListingId)
    .eq("status", PUBLIC_PROPERTY_STATUS)
    .maybeSingle();

  if (!listing) return { ok: false, error: "This property is not available for inquiries." };

  const { data, error } = await admin
    .from("property_inquiries")
    .insert({
      property_listing_id: input.propertyListingId,
      user_id: userId,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() ?? null,
      message: input.message.trim(),
      status: "new",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const listingRow = listing as { title: string; city: string };
  notifyIntakeSubmission({
    kind: "contact",
    requestId: data.id,
    customerName: input.fullName,
    customerEmail: input.email,
    userId,
    supportSubject: `Property inquiry: ${listingRow.title}`,
    fields: [
      { label: "Property", value: listingRow.title },
      { label: "City", value: listingRow.city },
      { label: "Phone", value: input.phone ?? "—" },
      { label: "Message", value: input.message },
    ],
  }).catch((e) => console.error("[property-inquiry] email failed", e));

  trackGrowthEvent({
    eventType: "property_inquiry",
    userId,
    email: input.email,
    relatedId: data.id,
    metadata: { property_id: input.propertyListingId, title: listingRow.title },
    context: { source_path: "/properties" },
  });
  markAbandonedInquirySubmitted(input.email, "property", data.id);
  completeOnboardingStep("submit_first_request");

  return { ok: true, data: { id: data.id } };
}

export async function fetchPropertyInquiriesForAdmin(limit = 100) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("property_inquiries")
    .select("*, property_listings(title, city)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: data ?? [] };
}

// ── Admin actions ─────────────────────────────────────────────────────────────

async function adminUpdateListing(
  listingId: string,
  patch: Record<string, unknown>,
  auditAction: string,
  metadata?: Record<string, unknown>
): Promise<PropertyActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("property_listings")
    .select("id, title")
    .eq("id", listingId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Listing not found." };

  const { error } = await admin
    .from("property_listings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: auditAction,
    entityType: "property_listings",
    entityId: listingId,
    metadata: { title: (existing as { title: string }).title, ...metadata },
  });

  return { ok: true, data: { id: listingId } };
}

export async function approvePropertyListing(listingId: string): Promise<PropertyActionResult> {
  return adminUpdateListing(listingId, { status: "approved" }, "property.approve");
}

export async function rejectPropertyListing(listingId: string): Promise<PropertyActionResult> {
  return adminUpdateListing(listingId, { status: "rejected", is_featured: false }, "property.reject");
}

/** @deprecated Use approvePropertyListing — kept for existing admin UI calls */
export async function publishPropertyListing(listingId: string): Promise<PropertyActionResult> {
  return approvePropertyListing(listingId);
}

export async function setPropertyFeatured(
  listingId: string,
  featured: boolean
): Promise<PropertyActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: listing } = await admin
    .from("property_listings")
    .select("id, status, title")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) return { ok: false, error: "Listing not found." };

  const row = listing as { status: string; title: string };
  if (featured && row.status !== PUBLIC_PROPERTY_STATUS) {
    return { ok: false, error: "Only approved listings can be featured." };
  }

  return adminUpdateListing(
    listingId,
    { is_featured: featured },
    featured ? "property.feature" : "property.unfeature",
    { featured }
  );
}

export async function updatePropertyListingStatus(
  listingId: string,
  status: string
): Promise<PropertyActionResult> {
  const patch: Record<string, unknown> = { status };
  if (status !== "approved") patch.is_featured = false;
  return adminUpdateListing(listingId, patch, "property.status", { status });
}

export async function updatePropertyListingAdminNotes(
  listingId: string,
  adminNotes: string
): Promise<PropertyActionResult> {
  return adminUpdateListing(
    listingId,
    { admin_notes: adminNotes.trim() || null },
    "property.notes"
  );
}

export async function deletePropertyListing(listingId: string): Promise<PropertyActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = adminDb();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: existing } = await admin
    .from("property_listings")
    .select("id, title")
    .eq("id", listingId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Listing not found." };

  const { error } = await admin.from("property_listings").delete().eq("id", listingId);
  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: "property.delete",
    entityType: "property_listings",
    entityId: listingId,
    metadata: { title: (existing as { title: string }).title },
  });

  return { ok: true, data: { id: listingId } };
}
