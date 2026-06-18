"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { isMissingTableError } from "./profile-utils";
import { requireAdmin } from "@/lib/auth-server";

export type MvpActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string; tableMissing?: boolean };

async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export interface ProviderServiceInput {
  title: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  duration_minutes?: number;
  is_active?: boolean;
}

export async function createProviderService(
  role: string,
  input: ProviderServiceInput
): Promise<MvpActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("provider_services")
    .insert({
      provider_user_id: userId,
      provider_role: role,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      category: input.category?.trim() ?? null,
      price: input.price,
      currency: (input.currency ?? "USD").toUpperCase(),
      duration_minutes: input.duration_minutes ?? null,
      is_active: input.is_active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Run supabase/migrations/005_mvp_marketplace.sql first.", tableMissing: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateProviderService(
  id: string,
  input: Partial<ProviderServiceInput>
): Promise<MvpActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description?.trim() ?? null;
  if (input.category !== undefined) updates.category = input.category?.trim() ?? null;
  if (input.price !== undefined) updates.price = input.price;
  if (input.currency !== undefined) updates.currency = input.currency.toUpperCase();
  if (input.duration_minutes !== undefined) updates.duration_minutes = input.duration_minutes;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  const { error } = await admin
    .from("provider_services")
    .update(updates)
    .eq("id", id)
    .eq("provider_user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id } };
}

export async function deleteProviderService(id: string): Promise<MvpActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("provider_services")
    .delete()
    .eq("id", id)
    .eq("provider_user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id } };
}

export async function sendMessage(input: {
  receiverId?: string;
  body: string;
  leadRequestId?: string;
  bookingRequestId?: string;
}): Promise<MvpActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("messages")
    .insert({
      sender_id: userId,
      receiver_id: input.receiverId?.trim() || null,
      body: input.body.trim(),
      lead_request_id: input.leadRequestId ?? null,
      booking_request_id: input.bookingRequestId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Messages table not found. Run migration 005.", tableMissing: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function saveDocumentRecord(input: {
  requestId?: string;
  fileName: string;
  fileUrl?: string;
  fileType?: string;
}): Promise<MvpActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("documents")
    .insert({
      user_id: userId,
      request_id: input.requestId ?? null,
      file_name: input.fileName,
      file_url: input.fileUrl ?? null,
      file_type: input.fileType ?? null,
      status: input.fileUrl ? "uploaded" : "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Documents table not found. Run migration 005.", tableMissing: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateIntakeStatus(
  table: "lead_requests" | "booking_requests" | "visa_requests",
  id: string,
  status: string
): Promise<MvpActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const payload =
    table === "booking_requests"
      ? { status }
      : { status, updated_at: new Date().toISOString() };

  const { error } = await admin.from(table).update(payload).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id } };
}

export async function updateBookingRequestStatus(
  id: string,
  status: string
): Promise<MvpActionResult> {
  return updateIntakeStatus("booking_requests", id, status);
}

export async function updateUserActiveStatus(
  userId: string,
  isActive: boolean
): Promise<MvpActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: userId } };
}

export async function updateProviderVerification(
  table: "visa_experts" | "agencies" | "tour_guides" | "property_hosts",
  id: string,
  verificationStatus: "verified" | "rejected" | "under_review" | "pending"
): Promise<MvpActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: row } = await admin.from(table).select("user_id, full_name, email").eq("id", id).maybeSingle();

  const { error } = await admin
    .from(table)
    .update({
      verification_status: verificationStatus,
      verified_at: verificationStatus === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (verificationStatus === "verified" && row) {
    const providerRow = row as { user_id: string; full_name?: string; email?: string };
    const roleMap = {
      visa_experts: "visa_agent",
      agencies: "travel_agency",
      tour_guides: "tour_guide",
      property_hosts: "property_host",
    } as const;

    const { sendProviderApprovalNotification } = await import("@/lib/provider-acquisition/emails");
    const { rewardProviderReferralOnVerification } = await import("@/lib/provider-acquisition/referral-actions");

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", providerRow.user_id)
      .maybeSingle();

    const email = providerRow.email ?? (profile as { email?: string } | null)?.email;
    const name = providerRow.full_name ?? (profile as { full_name?: string } | null)?.full_name;

    if (email) {
      sendProviderApprovalNotification({
        to: email,
        userId: providerRow.user_id,
        providerRole: roleMap[table],
        fullName: name ?? undefined,
      });
    }

    rewardProviderReferralOnVerification(providerRow.user_id);

    const { recalculateReputationForUser } = await import("@/lib/trust/reputation-engine");
    recalculateReputationForUser(providerRow.user_id, roleMap[table] ?? "visa_agent");
  }

  return { ok: true, data: { id } };
}
