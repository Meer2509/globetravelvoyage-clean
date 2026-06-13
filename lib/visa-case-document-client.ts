"use client";

export type DocumentClientResult = {
  ok: boolean;
  error?: string;
  storageUnavailable?: boolean;
  fileUrl?: string;
  fileName?: string | null;
  storagePath?: string | null;
  uploadedAt?: string | null;
  viewUrl?: string;
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

function requireDocumentId(documentId?: string): string | null {
  if (!documentId) {
    console.error("[visa-case] missing documentId — refresh the page to load checklist rows");
    return null;
  }
  return documentId;
}

export async function markCaseDocumentPrepared(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
}): Promise<DocumentClientResult> {
  const id = requireDocumentId(input.documentId);
  if (!id) {
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  const res = await fetch(`/api/cases/${input.caseId}/documents/${id}/mark-prepared`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });
  return parseApiResponse(res);
}

export async function saveCaseDocumentNotes(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
  notes: string;
}): Promise<DocumentClientResult> {
  const id = requireDocumentId(input.documentId);
  if (!id) {
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  const res = await fetch(`/api/cases/${input.caseId}/documents/${id}/save-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ notes: input.notes }),
  });
  return parseApiResponse(res);
}

export async function uploadCaseDocument(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
  fileName: string;
  file: File;
  notes?: string;
  replace?: boolean;
}): Promise<DocumentClientResult> {
  const id = requireDocumentId(input.documentId);
  if (!id) {
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  const formData = new FormData();
  formData.append("file", input.file, input.fileName);
  if (input.notes?.trim()) formData.append("notes", input.notes.trim());
  if (input.replace) formData.append("replace", "1");

  const res = await fetch(`/api/cases/${input.caseId}/documents/${id}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseApiResponse(res);
}

export async function fetchCaseDocumentFileUrl(input: {
  caseId: string;
  documentId: string;
  download?: boolean;
}): Promise<{ ok: boolean; url?: string; error?: string }> {
  const qs = input.download ? "?download=1" : "";
  const res = await fetch(
    `/api/cases/${input.caseId}/documents/${input.documentId}/file${qs}`,
    { credentials: "include" }
  );
  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!res.ok || !json.ok) {
    return { ok: false, error: json.error ?? "Could not open file." };
  }
  return { ok: true, url: json.url };
}

export async function removeCaseDocumentFile(input: {
  caseId: string;
  documentId: string;
}): Promise<DocumentClientResult> {
  const res = await fetch(
    `/api/cases/${input.caseId}/documents/${input.documentId}/remove-file`,
    { method: "DELETE", credentials: "include" }
  );
  return parseApiResponse(res);
}

export async function submitCaseSupportMessage(input: {
  caseId: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/cases/${input.caseId}/support`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message: input.message }),
  });
  const json = (await res.json()) as { ok: boolean; error?: string };
  if (!res.ok || !json.ok) {
    console.error("[visa-case] support failed:", json.error);
    return { ok: false, error: json.error ?? "Could not send your message." };
  }
  return { ok: true };
}

export function downloadChecklistUrl(caseId: string): string {
  return `/api/cases/${caseId}/download-checklist`;
}
