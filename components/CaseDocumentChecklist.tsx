"use client";

import { useState } from "react";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import {
  markCaseDocumentPrepared,
  uploadCaseDocument,
  saveCaseDocumentNotes,
  fetchCaseDocumentFileUrl,
  removeCaseDocumentFile,
  type DocumentClientResult,
} from "@/lib/visa-case-document-client";

export type ChecklistItem = {
  name: string;
  status: string;
  documentId?: string;
  id?: string;
  required?: boolean;
  notes?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  storagePath?: string | null;
  uploadedAt?: string | null;
};

type ProgressUpdate = DocumentClientResult["progress"];

function hasStoredFile(doc: ChecklistItem): boolean {
  return Boolean(doc.storagePath || doc.fileUrl || doc.fileName);
}

function displayStatus(doc: ChecklistItem): string {
  if (doc.status === "reviewed") return "reviewed";
  if (hasStoredFile(doc) || doc.status === "uploaded") return "uploaded";
  if (doc.status === "prepared") return "prepared-only";
  return "pending";
}

function formatUploadedAt(value?: string | null): string | null {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function CaseDocumentChecklist(props: {
  caseId: string;
  items: ChecklistItem[];
  storageReady?: boolean;
  onUpdated?: () => void;
  onProgress?: (progress: ProgressUpdate) => void;
}) {
  const itemsKey = props.items
    .map((i) => `${i.name}:${i.status}:${i.documentId ?? ""}`)
    .join("|");
  return <CaseDocumentChecklistInner key={itemsKey} {...props} />;
}

function CaseDocumentChecklistInner({
  caseId,
  items,
  storageReady = true,
  onUpdated,
  onProgress,
}: {
  caseId: string;
  items: ChecklistItem[];
  storageReady?: boolean;
  onUpdated?: () => void;
  onProgress?: (progress: ProgressUpdate) => void;
}) {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(items);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savedNotes, setSavedNotes] = useState<Record<string, boolean>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const checklist: ChecklistItem[] =
    localItems.length > 0
      ? localItems
      : VISA_DOCUMENT_CHECKLIST.map((item) => ({
          name: item.documentType,
          status: "pending",
          required: item.required,
          notes: null,
        }));

  function patchItem(name: string, patch: Partial<ChecklistItem>) {
    setLocalItems((prev) =>
      prev.map((d) => (d.name === name ? { ...d, ...patch } : d))
    );
  }

  async function handlePrepared(doc: ChecklistItem) {
    setBusy(doc.name);
    setError("");
    setMessage("");

    const result = await markCaseDocumentPrepared({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
    });
    setBusy(null);

    if (!result.ok) {
      console.error("[visa-case] mark prepared failed:", result.error);
      setError(result.error ?? "Could not save. Please refresh and try again.");
      return;
    }

    patchItem(doc.name, {
      status: result.status ?? "prepared",
      documentId: result.documentId ?? doc.documentId ?? doc.id,
    });

    setMessage("Marked as prepared. You still need to upload the file if required.");
    if (result.progress) onProgress?.(result.progress);
    onUpdated?.();
  }

  async function handleFile(doc: ChecklistItem, file: File, replace = false) {
    if (!storageReady) {
      setError(
        "Secure file storage is not active yet. This document was marked prepared, but no file was uploaded."
      );
      return;
    }

    setBusy(doc.name);
    setError("");
    setMessage("");

    const notes = noteDrafts[doc.name] ?? doc.notes ?? "";
    const result = await uploadCaseDocument({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
      fileName: file.name,
      file,
      notes: notes || undefined,
      replace,
    });
    setBusy(null);

    if (!result.ok) {
      if (result.storageUnavailable) {
        setError(
          "Secure file storage is not active yet. This document was marked prepared, but no file was uploaded."
        );
      } else {
        console.error("[visa-case] upload failed:", result.error);
        setError(result.error ?? "Could not save. Please refresh and try again.");
      }
      return;
    }

    patchItem(doc.name, {
      status: "uploaded",
      documentId: result.documentId ?? doc.documentId ?? doc.id,
      fileName: result.fileName ?? file.name,
      storagePath: result.storagePath ?? doc.storagePath,
      uploadedAt: result.uploadedAt ?? new Date().toISOString(),
      notes: result.notes ?? (notes || doc.notes),
    });

    setMessage(`${doc.name} uploaded successfully and saved to your secure document vault.`);
    if (result.progress) onProgress?.(result.progress);
    onUpdated?.();
  }

  async function handleViewFile(doc: ChecklistItem, download = false) {
    const documentId = doc.documentId ?? doc.id;
    if (!documentId) return;

    setBusy(download ? `download-${doc.name}` : `view-${doc.name}`);
    setError("");

    const result = await fetchCaseDocumentFileUrl({
      caseId,
      documentId,
      download,
    });
    setBusy(null);

    if (!result.ok || !result.url) {
      setError(result.error ?? "Could not open file.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handleRemoveFile(doc: ChecklistItem) {
    const documentId = doc.documentId ?? doc.id;
    if (!documentId) return;

    setBusy(`remove-${doc.name}`);
    setError("");
    setMessage("");

    const result = await removeCaseDocumentFile({ caseId, documentId });
    setBusy(null);

    if (!result.ok) {
      setError(result.error ?? "Could not remove file.");
      return;
    }

    patchItem(doc.name, {
      status: result.status ?? "prepared",
      fileName: null,
      fileUrl: null,
      storagePath: null,
      uploadedAt: null,
    });

    setMessage(`File removed from ${doc.name}. You can upload a new file when ready.`);
    if (result.progress) onProgress?.(result.progress);
    onUpdated?.();
  }

  async function handleSaveNotes(doc: ChecklistItem) {
    const notes = noteDrafts[doc.name] ?? doc.notes ?? "";
    setBusy(`notes-${doc.name}`);
    setError("");
    setMessage("");

    const result = await saveCaseDocumentNotes({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
      notes,
    });
    setBusy(null);

    if (!result.ok) {
      console.error("[visa-case] save notes failed:", result.error);
      setError(result.error ?? "Could not save. Please refresh and try again.");
      return;
    }

    patchItem(doc.name, {
      notes: result.notes ?? notes,
      documentId: result.documentId ?? doc.documentId ?? doc.id,
    });
    setSavedNotes((prev) => ({ ...prev, [doc.name]: true }));
    setMessage(`Notes saved for ${doc.name}.`);
    setTimeout(() => setSavedNotes((prev) => ({ ...prev, [doc.name]: false })), 2500);
    onUpdated?.();
  }

  return (
    <div className="space-y-3">
      {!storageReady && (
        <p className="text-xs rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-navy">
          Secure file storage is not active yet. You can mark prepared for now.
        </p>
      )}
      <ul className="space-y-3">
        {checklist.map((doc) => {
          const uploaded = hasStoredFile(doc) || doc.status === "uploaded";
          const preparedOnly = doc.status === "prepared" && !uploaded;
          const statusKey = displayStatus(doc);
          const uploadedLabel = formatUploadedAt(doc.uploadedAt);
          const isBusy = busy === doc.name || busy === `view-${doc.name}` || busy === `download-${doc.name}` || busy === `remove-${doc.name}`;

          return (
            <li
              key={doc.name}
              className="rounded-xl border border-soft-200 bg-white px-4 py-4 text-sm space-y-3 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-1 items-start gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-navy font-semibold block">{doc.name}</span>
                    <span
                      className={`text-xs font-semibold mt-0.5 inline-block ${
                        doc.required !== false ? "text-gold" : "text-muted"
                      }`}
                    >
                      {doc.required !== false ? "Required" : "Optional"}
                    </span>
                  </div>
                  <DocumentStatusBadge status={statusKey} />
                </div>
              </div>

              {uploaded && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <span aria-hidden>✓</span>
                    <span>Uploaded</span>
                  </div>
                  <p className="text-navy font-medium break-all">{doc.fileName ?? "Uploaded file"}</p>
                  {uploadedLabel && (
                    <p className="text-xs text-muted">Uploaded {uploadedLabel}</p>
                  )}
                  <p className="text-xs text-emerald-800">
                    Saved securely in your Globe Travel Voyage document vault
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleViewFile(doc, false)}
                      className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {busy === `view-${doc.name}` ? "Opening…" : "View file"}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleViewFile(doc, true)}
                      className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {busy === `download-${doc.name}` ? "Preparing…" : "Download file"}
                    </button>
                    {storageReady && (
                      <label className="btn-outline px-3 py-1.5 text-xs cursor-pointer disabled:opacity-50">
                        {isBusy ? "Uploading…" : "Replace file"}
                        <input
                          type="file"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(doc, file, true);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRemoveFile(doc)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busy === `remove-${doc.name}` ? "Removing…" : "Remove file"}
                    </button>
                  </div>
                </div>
              )}

              {preparedOnly && (
                <div className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-navy font-semibold">
                    <span aria-hidden>✓</span>
                    <span>Prepared</span>
                  </div>
                  <p className="text-sm text-muted">No file uploaded yet</p>
                  {storageReady ? (
                    <label className="btn-gold inline-flex px-3 py-1.5 text-xs cursor-pointer">
                      {isBusy ? "Uploading…" : "Upload file"}
                      <input
                        type="file"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(doc, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <p className="text-xs text-navy">
                      Secure file storage is not active yet. This document was marked prepared, but no file was uploaded.
                    </p>
                  )}
                </div>
              )}

              {!uploaded && !preparedOnly && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handlePrepared(doc)}
                    className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    {busy === doc.name ? "Saving…" : "Mark prepared"}
                  </button>
                  {storageReady && (
                    <label className="btn-primary px-3 py-1.5 text-xs cursor-pointer disabled:opacity-50">
                      {isBusy ? "Uploading…" : "Upload file"}
                      <input
                        type="file"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(doc, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <textarea
                  className="input min-h-16 flex-1 text-xs"
                  placeholder="Add notes for your expert (optional)"
                  value={noteDrafts[doc.name] ?? doc.notes ?? ""}
                  onChange={(e) =>
                    setNoteDrafts((prev) => ({ ...prev, [doc.name]: e.target.value }))
                  }
                  disabled={busy === `notes-${doc.name}`}
                />
                <button
                  type="button"
                  disabled={busy === `notes-${doc.name}`}
                  onClick={() => handleSaveNotes(doc)}
                  className="btn-outline px-3 py-1.5 text-xs shrink-0 disabled:opacity-50"
                >
                  {busy === `notes-${doc.name}`
                    ? "Saving…"
                    : savedNotes[doc.name]
                      ? "Saved ✓"
                      : "Save notes"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="text-sm text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2">{error}</p>
      )}
      {message && (
        <p className="text-sm text-emerald-700 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">{message}</p>
      )}
    </div>
  );
}
