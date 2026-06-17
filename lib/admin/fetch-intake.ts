"use server";

import { requireAdmin } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminIntakeTable } from "./admin-intake-actions";

export interface AdminIntakeRow {
  id: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
  [key: string]: unknown;
}

export async function fetchAdminIntakeRows(
  table: AdminIntakeTable,
  limit = 250
): Promise<{ rows: AdminIntakeRow[]; error?: string }> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return { rows: [], error: adminAuth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as AdminIntakeRow[] };
}
