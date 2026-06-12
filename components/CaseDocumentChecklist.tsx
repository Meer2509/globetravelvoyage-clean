"use client";

import { useState } from "react";
import { CASE_DOCUMENT_TYPES } from "@/lib/visa-case-constants";
import { markCaseDocumentPrepared, uploadCaseDocument } from "@/lib/supabase/case-document-actions";

export type ChecklistItem = {
  name: string;
  status: string;
  documentId?: string;
};

function statusIcon(status: string) {
  if (status === "uploaded") return "✓";
  if (status === "prepared") return "◆";
  return "○";
}

function statusLabel(status: string) {
  if (status === "uploaded") return "Uploaded";
  if (status === "prepared") return "Prepared";
  return "Pending";
}

export function CaseDocumentChecklist({
  caseId,
  items,
  onUpdated,
}: {
  caseId: string;
  items: ChecklistItem[];
  onUpdated?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checklist =
    items.length > 0
      ? items
      : CASE_DOCUMENT_TYPES.map((name) => ({ name, status: "pending" }));

  async function handlePrepared(doc: ChecklistItem) {
    setBusy(doc.name);
    setError("");
    setMessage("");
    const result = await markCaseDocumentPrepared({
      caseId,
      documentType: doc.name,
      documentId: doc.documentId,
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
    setMessage(
      result.fileUrl
        ? `${doc.name} uploaded successfully.`
        : `${doc.name} saved. File storage will be enabled when configured.`
    );
    onUpdated?.();
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {checklist.map((doc) => (
          <li
            key={doc.name}
            className="flex flex-col gap-2 rounded-xl bg-soft px-4 py-3 text-sm sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <span
                className={
                  doc.status === "uploaded"
                    ? "text-emerald-500"
                    : doc.status === "prepared"
                      ? "text-gold"
                      : "text-muted"
                }
              >
                {statusIcon(doc.status)}
              </span>
              <span className="text-navy font-medium truncate">{doc.name}</span>
              <span className="ml-auto text-xs capitalize text-muted shrink-0">
                {statusLabel(doc.status)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {doc.status !== "uploaded" && doc.status !== "prepared" && (
                <button
                  type="button"
                  disabled={busy === doc.name}
                  onClick={() => handlePrepared(doc)}
                  className="rounded-lg border border-soft-200 px-3 py-1.5 text-xs font-semibold text-navy hover:border-gold hover:text-gold disabled:opacity-50"
                >
                  {busy === doc.name ? "Saving…" : "Mark prepared"}
                </button>
              )}
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
