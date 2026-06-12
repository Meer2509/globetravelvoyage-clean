export interface VisaDocumentChecklistItem {
  documentType: string;
  required: boolean;
}

/** Default checklist for all paid visa services */
export const VISA_DOCUMENT_CHECKLIST: VisaDocumentChecklistItem[] = [
  { documentType: "Passport bio page", required: true },
  { documentType: "Passport-size photo", required: true },
  { documentType: "Bank statement", required: true },
  { documentType: "Employment letter or business proof", required: true },
  { documentType: "Travel itinerary", required: true },
  { documentType: "Hotel booking or stay plan", required: true },
  { documentType: "Invitation letter, if applicable", required: false },
  { documentType: "Previous visas, if applicable", required: false },
  { documentType: "National ID, if applicable", required: false },
  { documentType: "Supporting documents", required: false },
];

export const DOCUMENT_STATUSES = ["pending", "prepared", "uploaded", "reviewed"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
