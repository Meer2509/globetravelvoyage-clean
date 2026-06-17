"use server";

import { createAdminClient } from "./admin";
import { createServerSupabaseClient } from "./server";
import { requireAdmin } from "@/lib/auth-server";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { logAdminAudit } from "@/lib/admin/phase1-actions";

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

export async function submitPropertyInquiry(input: {
  propertyListingId: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<PropertyActionResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: FORM_SUBMIT_ERROR_MESSAGE };

  const userId = await getOptionalUserId();
  const rateBlocked = await enforceRateLimit("form", userId);
  if (!rateBlocked.ok) return { ok: false, error: rateBlocked.error };

  const { data: listing } = await admin
    .from("property_listings")
    .select("id, title, city")
    .eq("id", input.propertyListingId)
    .maybeSingle();

  if (!listing) return { ok: false, error: "Property listing not found." };

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

  return { ok: true, data: { id: data.id } };
}

export async function publishPropertyListing(listingId: string): Promise<PropertyActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: listing, error: fetchError } = await admin
    .from("property_listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (fetchError || !listing) return { ok: false, error: "Listing not found." };

  const { error } = await admin
    .from("property_listings")
    .update({
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    action: "property.publish",
    entityType: "property_listings",
    entityId: listingId,
    metadata: { title: (listing as { title: string }).title },
  });

  return { ok: true, data: { id: listingId } };
}

export async function fetchPropertyInquiriesForAdmin(limit = 100) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("property_inquiries")
    .select("*, property_listings(title, city)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: data ?? [] };
}
