export const VISA_INITIAL_STEP = "Upload required documents";

export const VISA_CASE_STATUSES = [
  "intake_started",
  "documents_needed",
  "documents_uploaded",
  "under_review",
  "expert_assigned",
  "prep_in_progress",
  "ready_for_submission",
  "completed",
  "cancelled",
] as const;

export type VisaCaseStatus = (typeof VISA_CASE_STATUSES)[number];

import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";

/** @deprecated Use VISA_DOCUMENT_CHECKLIST from visa-case-checklist.ts */
export const CASE_DOCUMENT_TYPES = VISA_DOCUMENT_CHECKLIST.map((i) => i.documentType);
