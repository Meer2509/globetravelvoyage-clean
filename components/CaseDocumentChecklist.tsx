"use client";

import { useState } from "react";
import { VISA_DOCUMENT_CHECKLIST } from "@/lib/visa-case-checklist";
import {
  markCaseDocumentPrepared,
  uploadCaseDocument,
  saveCaseDocumentNotes,
} from "@/lib/supabase/case-document-actions";

export type ChecklistItem = {
  name: string;
  status: string;
  documentId?: string;
  id?: string;
  required?: boolean;
  notes?: string | null;
};

function statusIcon(status: string) {
  if (status === "reviewed") return "★";
  if (status === "uploaded") return "✓";
  if (status === "prepared") return "◆";
  return "○";
}

function statusLabel(status: string) {
  if (status === "reviewed") return "Reviewed";
  if (status === "uploaded") return "Uploaded";
  if (status === "prepared") return "Prepared";
  return "Pending";
}

export function CaseDocumentChecklist({
  caseId,
  items,
  storageReady = true,
  onUpdated,
}: {
  caseId: string;
  items: ChecklistItem[];
  storageReady?: boolean;
  onUpdated?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const checklist: ChecklistItem[] =
    items.length > 0
      ? items
      : VISA_DOCUMENT_CHECKLIST.map((item) => ({
          name: item.documentType,
          status: "pending",
          required: item.required,
          notes: null,
        }));

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
      setError(result.error ?? "Could not save.");
      return;
    }
    setMessage(`${doc.name} marked as prepared.`);
    onUpdated?.();
  }

  async function handleFile(doc: ChecklistItem, file: File) {
    if (!storageReady) {
      setError("Secure upload coming soon. Mark this item as prepared for now.");
      return;
    }
    setBusy(doc.name);
    setError("");
    setMessage("");
    const result = await uploadCaseDocument({
      caseId,
      documentType: doc.name,
      fileName: file.name,
      file,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Upload failed.");
      return;
    }
    if (result.storageUnavailable) {
      setError("Secure upload coming soon. Your item was not stored — mark as prepared instead.");
      return;
    }
    setMessage(
      result.fileUrl
        ? `${doc.name} uploaded successfully.`
        : `${doc.name} saved.`
    );
    onUpdated?.();
  }

  async function handleSaveNotes(doc: ChecklistItem) {
    const notes = noteDrafts[doc.name] ?? doc.notes ?? "";
    setBusy(`notes-${doc.name}`);
    setError("");
    const result = await saveCaseDocumentNotes({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId ?? doc.id,
      notes,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Could not save notes.");
      return;
    }
    setMessage(`Notes saved for ${doc.name}.`);
    onUpdated?.();
  }

  return (
    <div className="space-y-3">
      {!storageReady && (
        <p className="text-xs rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-navy">
          Secure upload coming soon. You can mark documents as prepared and add notes until file storage is enabled.
        </p>
      )}
      <ul className="space-y-3">
        {checklist.map((doc) => (
          <li
            key={doc.name}
            className="rounded-xl border border-soft-200 bg-white px-4 py-4 text-sm space-y-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <span
                  className={
                    doc.status === "reviewed"
                      ? "text-gold"
                      : doc.status === "uploaded"
                        ? "text-emerald-500"
                        : doc.status === "prepared"
                          ? "text-gold"
                          : "text-muted"
                  }
                >
                  {statusIcon(doc.status)}
                </span>
                <div className="min-w-0">
                  <span className="text-navy font-medium block truncate">{doc.name}</span>
                  <span
                    className={`text-xs font-semibold ${
                      doc.required !== false ? "text-navy/70" : "text-muted"
                    }`}
                  >
                    {doc.required !== false ? "Required" : "Optional"}
                  </span>
                </div>
                <span className="ml-auto text-xs capitalize text-muted shrink-0">
                  {statusLabel(doc.status)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {doc.status !== "uploaded" && doc.status !== "prepared" && doc.status !== "reviewed" && (
                  <button
                    type="button"
                    disabled={busy === doc.name}
                    onClick={() => handlePrepared(doc)}
                    className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold hover:text-gold disabled:opacity-50"
                  >
                    {busy === doc.name ? "Saving…" : "Mark prepared"}
                  </button>
                )}
                {storageReady ? (
                  <label className="rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy cursor-pointer hover:bg-navy hover:text-white disabled:opacity-50">
                    {busy === doc.name ? "Saving…" : "Upload"}
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
                  <span className="rounded-lg border border-dashed border-soft-200 px-3 py-1.5 text-xs text-muted">
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
              />
              <button
                type="button"
                disabled={busy === `notes-${doc.name}`}
                onClick={() => handleSaveNotes(doc)}
                className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold shrink-0 disabled:opacity-50"
              >
                {busy === `notes-${doc.name}` ? "Saving…" : "Save notes"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p className="text-xs text-red-600 rounded-lg border border-red-200 bg-red-50 px-3 py-2">{error}</p>
      )}
      {message && <p className="text-xs text-emerald-600">{message}</p>}
    </div>
  );
}
