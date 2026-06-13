"use client";

import { useEffect, useState } from "react";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";
import { DocumentStatusBadge } from "@/components/DocumentStatusBadge";
import {
  markCaseDocumentPrepared,
  uploadCaseDocument,
  saveCaseDocumentNotes,
  type DocumentClientResult,
} from "@/lib/visa-case-document-client";

export type ChecklistItem = {
  name: string;
  status: string;
  documentId?: string;
  id?: string;
  required?: boolean;
  notes?: string | null;
};

type ProgressUpdate = DocumentClientResult["progress"];

export function CaseDocumentChecklist({
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

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

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
    patchItem(doc.name, { status: "prepared" });

    const result = await markCaseDocumentPrepared({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
    });
    setBusy(null);

    if (!result.ok) {
      patchItem(doc.name, { status: doc.status });
      console.error("[visa-case] mark prepared failed:", result.error);
      setError(result.error ?? "Could not save. Please refresh and try again.");
      return;
    }

    patchItem(doc.name, {
      status: result.status ?? "prepared",
      documentId: result.documentId ?? doc.documentId ?? doc.id,
    });

    setMessage(`${doc.name} marked as prepared.`);
    if (result.progress) onProgress?.(result.progress);
    onUpdated?.();
  }

  async function handleFile(doc: ChecklistItem, file: File) {
    if (!storageReady) {
      setError(
        "Secure file upload is being activated. You can mark this document as prepared for now."
      );
      return;
    }

    setBusy(doc.name);
    setError("");
    setMessage("");

    const result = await uploadCaseDocument({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
      fileName: file.name,
      file,
    });
    setBusy(null);

    if (!result.ok) {
      if (result.storageUnavailable) {
        setError(
          "Secure file upload is being activated. You can mark this document as prepared for now."
        );
      } else {
        console.error("[visa-case] upload failed:", result.error);
        setError(result.error ?? "Could not save. Please refresh and try again.");
      }
      return;
    }

    patchItem(doc.name, {
      status: result.status ?? "uploaded",
      documentId: result.documentId ?? doc.documentId ?? doc.id,
    });
    setMessage(`${doc.name} uploaded successfully.`);
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
          Secure file upload is being activated. You can mark documents as prepared and add notes until file storage is enabled.
        </p>
      )}
      <ul className="space-y-3">
        {checklist.map((doc) => (
          <li
            key={doc.name}
            className="rounded-xl border border-soft-200 bg-white px-4 py-4 text-sm space-y-3 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <DocumentStatusBadge status={doc.status} />
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {doc.status !== "uploaded" && doc.status !== "prepared" && doc.status !== "reviewed" && (
                  <button
                    type="button"
                    disabled={busy === doc.name}
                    onClick={() => handlePrepared(doc)}
                    className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    {busy === doc.name ? "Saving…" : "Mark prepared"}
                  </button>
                )}
                {storageReady ? (
                  <label className="btn-primary px-3 py-1.5 text-xs cursor-pointer disabled:opacity-50">
                    {busy === doc.name ? "Uploading…" : "Upload file"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={busy === doc.name}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(doc, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : (
                  <span className="rounded-lg border border-dashed border-gold/40 bg-gold/5 px-3 py-1.5 text-xs text-navy">
                    Upload soon
                  </span>
                )}
              </div>
            </div>
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
        ))}
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
