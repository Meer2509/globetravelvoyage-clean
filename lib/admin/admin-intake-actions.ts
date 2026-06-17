"use server";

import { requireAdmin } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminIntakeTable =
  | "visa_requests"
  | "booking_requests"
  | "lead_requests"
  | "property_listings"
  | "support_messages"
  | "referrals";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export async function updateAdminIntakeStatus(
  table: AdminIntakeTable,
  id: string,
  status: string
): Promise<AdminActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  const { error } = await admin.from(table).update(payload).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateAdminIntakeNotes(
  table: AdminIntakeTable,
  id: string,
  adminNotes: string
): Promise<AdminActionResult> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { ok: false, error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from(table)
    .update({ admin_notes: adminNotes.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
