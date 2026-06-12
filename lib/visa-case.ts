import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import {
  CASE_DOCUMENT_TYPES,
  type VisaCaseStatus,
} from "@/lib/visa-case-constants";

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
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GTV-VC-${date}-${rand}`;
}

export function progressForStatus(status: VisaCaseStatus): number {
  const map: Record<VisaCaseStatus, number> = {
    intake_started: 10,
    documents_needed: 20,
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
}): Promise<{ caseId: string; caseNumber: string } | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: existing } = await admin
    .from("visa_cases")
    .select("id, case_number")
    .eq("payment_id", input.paymentId)
    .maybeSingle();

  if (existing) {
    const row = existing as { id: string; case_number: string };
    return { caseId: row.id, caseNumber: row.case_number };
  }

  const caseNumber = generateCaseNumber();
  const status: VisaCaseStatus = "intake_started";

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
      progress_percent: progressForStatus(status),
      current_step: status,
    })
    .select("id, case_number")
    .single();

  if (error) {
    if (!isMissingTableError(error)) {
      console.error("visa_cases insert failed:", error.message);
    }
    return null;
  }

  const row = visaCase as { id: string; case_number: string };

  for (const docType of CASE_DOCUMENT_TYPES) {
    await admin.from("case_documents").insert({
      case_id: row.id,
      user_id: input.userId,
      document_type: docType,
      status: "pending",
    });
  }

  return { caseId: row.id, caseNumber: row.case_number };
}
