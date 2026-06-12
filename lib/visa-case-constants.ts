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

export const CASE_DOCUMENT_TYPES = [
  "Passport",
  "Photo",
  "Bank statement",
  "Employment letter",
  "Travel itinerary",
  "Invitation letter if applicable",
  "Previous visas if any",
] as const;
