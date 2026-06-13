"use client";

export type DocumentClientResult = {
  ok: boolean;
  error?: string;
  storageUnavailable?: boolean;
  fileUrl?: string;
  documentId?: string;
  status?: string;
  notes?: string | null;
  progress?: {
    progressPercent: number;
    currentStep: string;
    status: string;
  };
};

async function parseApiResponse(res: Response): Promise<DocumentClientResult> {
  let json: DocumentClientResult;
  try {
    json = (await res.json()) as DocumentClientResult;
  } catch {
    console.error("[visa-case] invalid API response", res.status);
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  if (!res.ok || !json.ok) {
    console.error("[visa-case] API error:", json.error, "status:", res.status);
    return {
      ok: false,
      error: json.error ?? "Could not save. Please refresh and try again.",
      storageUnavailable: json.storageUnavailable,
    };
  }

  return json;
}

export async function markCaseDocumentPrepared(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
}): Promise<DocumentClientResult> {
  const res = await fetch(`/api/visa-cases/${input.caseId}/documents/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "prepared",
      documentType: input.documentType,
      documentId: input.documentId,
    }),
  });
  return parseApiResponse(res);
}

export async function saveCaseDocumentNotes(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
  notes: string;
}): Promise<DocumentClientResult> {
  const res = await fetch(`/api/visa-cases/${input.caseId}/documents/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "notes",
      documentType: input.documentType,
      documentId: input.documentId,
      notes: input.notes,
    }),
  });
  return parseApiResponse(res);
}

export async function uploadCaseDocument(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
  fileName: string;
  file: File;
}): Promise<DocumentClientResult> {
  const formData = new FormData();
  formData.append("documentType", input.documentType);
  if (input.documentId) formData.append("documentId", input.documentId);
  formData.append("file", input.file, input.fileName);

  const res = await fetch(`/api/visa-cases/${input.caseId}/documents/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseApiResponse(res);
}

export async function syncCaseProgress(caseId: string): Promise<DocumentClientResult> {
  const res = await fetch(`/api/visa-cases/${caseId}/progress/update`, {
    method: "POST",
    credentials: "include",
  });
  return parseApiResponse(res);
}
