"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { ensureCaseChecklist, createVisaCase, isVisaProductKey } from "@/lib/visa-case";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";
import { mapVisaCaseRow } from "@/lib/supabase/visa-case-mapper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedDb = { from: (table: string) => any };

import { isDocumentsBucketReady } from "@/lib/document-storage";

export async function checkDocumentsStorageReady(): Promise<boolean> {
  return isDocumentsBucketReady();
}

async function backfillVisaCaseFromPayment(userId: string): Promise<string | null> {
  const admin = createAdminClient() as UntypedDb | null;
  if (!admin) return null;

  const { data: payments } = await admin
    .from("payments")
    .select("id, service_type, description, booking_id, status")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(20);

  for (const p of payments ?? []) {
    const row = p as { id: string; service_type: string | null; description: string | null; booking_id: string | null };
    const key = row.service_type ?? "";
    if (!isVisaProductKey(key)) continue;

    const { data: existing } = await admin
      .from("visa_cases")
      .select("id")
      .eq("payment_id", row.id)
      .maybeSingle();

    if (existing) return (existing as { id: string }).id;

    const created = await createVisaCase({
      userId,
      paymentId: row.id,
      bookingId: row.booking_id,
      serviceName: row.description ?? key,
      productKey: key,
    });

    if (created && "caseId" in created) return created.caseId;
  }

  return null;
}

export async function repairMissingVisaCaseForUser(userId: string): Promise<string | null> {
  return backfillVisaCaseFromPayment(userId);
}

export async function fetchCustomerVisaCases(): Promise<VisaCaseData[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let { data: rows, error } = await supabase
    .from("visa_cases")
    .select("*")
    .eq("user_id", user.id)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  if (error && isMissingTableError(error)) return [];

  if (!rows?.length) {
    const backfilledId = await backfillVisaCaseFromPayment(user.id);
    if (backfilledId) {
      const { data: one } = await supabase.from("visa_cases").select("*").eq("id", backfilledId).maybeSingle();
      rows = one ? [one] : [];
    }
  }

  const cases: VisaCaseData[] = [];
  for (const row of rows ?? []) {
    await ensureCaseChecklist((row as { id: string }).id, user.id);
    const mapped = await mapVisaCaseRow(row as Record<string, unknown>, supabase);
    if (mapped) cases.push(mapped);
  }
  return cases;
}

export async function fetchCustomerVisaCaseById(caseId: string): Promise<VisaCaseData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row, error } = await supabase
    .from("visa_cases")
    .select("*")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !row) return null;

  await ensureCaseChecklist(caseId, user.id);
  return mapVisaCaseRow(row as Record<string, unknown>, supabase);
}

export async function fetchLatestVisaCaseId(): Promise<string | null> {
  const cases = await fetchCustomerVisaCases();
  return cases[0]?.id ?? null;
}

export async function loadVisaCaseWorkspace(caseId: string): Promise<{
  case: VisaCaseData;
  storageReady: boolean;
} | null> {
  const visaCase = await fetchCustomerVisaCaseById(caseId);
  if (!visaCase) return null;
  const storageReady = await checkDocumentsStorageReady();
  return { case: visaCase, storageReady };
}
