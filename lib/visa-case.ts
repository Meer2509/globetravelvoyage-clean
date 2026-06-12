import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import {
  VISA_INITIAL_STEP,
  type VisaCaseStatus,
} from "@/lib/visa-case-constants";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";

export { VISA_CASE_STATUSES, CASE_DOCUMENT_TYPES, type VisaCaseStatus } from "@/lib/visa-case-constants";

const VISA_PRODUCT_KEYS = new Set([
  "visa_document_review",
  "visa_application_assistance",
  "premium_visa_filing_support",
  "urgent_visa_prep",
  "family_visa_package",
  "usa_visa_consultation",
  "usa_b1b2_document_review",
  "full_visa_application_support",
  "canada_visa_consultation",
  "uk_visitor_visa_support",
  "schengen_visa_support",
  "visa_expert_consultation",
  "visa_application_prep",
]);

export function isVisaProductKey(productKey: string): boolean {
  return VISA_PRODUCT_KEYS.has(productKey) || productKey.includes("visa");
}

export function generateCaseNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `GTV-${date}-${seq}`;
}

export function progressForStatus(status: VisaCaseStatus): number {
  const map: Record<VisaCaseStatus, number> = {
    intake_started: 10,
    documents_needed: 15,
    documents_uploaded: 35,
    under_review: 50,
    expert_assigned: 60,
    prep_in_progress: 75,
    ready_for_submission: 90,
    completed: 100,
    cancelled: 0,
  };
  return map[status] ?? 10;
}

export async function createVisaCase(input: {
  userId: string;
  paymentId: string;
  bookingId?: string | null;
  serviceName: string;
  productKey: string;
  providerUserId?: string | null;
  visaCountry?: string;
  visaType?: string;
}): Promise<{ caseId: string; caseNumber: string } | { error: string; tableMissing?: boolean } | null> {
  const admin = createAdminClient();
  if (!admin) return { error: "Database connection is not configured." };

  const { data: existing, error: lookupError } = await admin
    .from("visa_cases")
    .select("id, case_number")
    .eq("payment_id", input.paymentId)
    .maybeSingle();

  if (lookupError) {
    if (isMissingTableError(lookupError)) {
      console.error("[visa_cases] table missing:", lookupError.message);
      return { error: "visa_cases table is not available. Run migration 010_launch_platform.sql.", tableMissing: true };
    }
    return { error: lookupError.message };
  }

  if (existing) {
    const row = existing as { id: string; case_number: string };
    return { caseId: row.id, caseNumber: row.case_number };
  }

  const caseNumber = generateCaseNumber();
  const status: VisaCaseStatus = "documents_needed";

  const { data: visaCase, error } = await admin
    .from("visa_cases")
    .insert({
      case_number: caseNumber,
      user_id: input.userId,
      provider_user_id: input.providerUserId ?? null,
      payment_id: input.paymentId,
      booking_id: input.bookingId ?? null,
      service_name: input.serviceName,
      visa_country: input.visaCountry ?? null,
      visa_type: input.visaType ?? input.serviceName,
      status,
      progress_percent: 15,
      current_step: VISA_INITIAL_STEP,
    })
    .select("id, case_number")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      console.error("[visa_cases] insert failed — table missing:", error.message);
      return { error: "visa_cases table is not available. Run migration 010_launch_platform.sql.", tableMissing: true };
    }
    console.error("visa_cases insert failed:", error.message);
    return { error: error.message };
  }

  const row = visaCase as { id: string; case_number: string };

  for (const item of VISA_DOCUMENT_CHECKLIST) {
    const { error: docError } = await admin.from("case_documents").insert({
      case_id: row.id,
      user_id: input.userId,
      document_type: item.documentType,
      status: "pending",
      is_required: item.required,
    });
    if (docError && isMissingTableError(docError)) {
      console.error("[case_documents] table missing:", docError.message);
      break;
    }
  }

  return { caseId: row.id, caseNumber: row.case_number };
}

export async function ensureCaseChecklist(caseId: string, userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: existing, error } = await admin
    .from("case_documents")
    .select("document_type")
    .eq("case_id", caseId);

  if (error) {
    if (isMissingTableError(error)) return;
    return;
  }

  const existingTypes = new Set(
    (existing ?? []).map((d) => (d as { document_type: string }).document_type)
  );

  for (const item of VISA_DOCUMENT_CHECKLIST) {
    if (existingTypes.has(item.documentType)) continue;
    const { error: docError } = await admin.from("case_documents").insert({
      case_id: caseId,
      user_id: userId,
      document_type: item.documentType,
      status: "pending",
      is_required: item.required,
    });
    if (docError && isMissingTableError(docError)) break;
  }
}
