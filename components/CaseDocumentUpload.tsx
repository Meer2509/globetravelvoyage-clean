"use client";

import { useState } from "react";
import { uploadCaseDocument } from "@/lib/supabase/case-document-actions";

export function CaseDocumentUpload({ caseId }: { caseId: string }) {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("Passport");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const types = [
    "Passport",
    "Photo",
    "Bank statement",
    "Employment letter",
    "Travel itinerary",
    "Invitation letter if applicable",
    "Previous visas if any",
  ];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");

    const result = await uploadCaseDocument({
      caseId,
      documentType: docType,
      fileName: file.name,
      file,
    });

    setUploading(false);
    if (!result.ok) {
      setError(result.error ?? "Upload failed");
      return;
    }
    setMessage(
      result.fileUrl
        ? "Document uploaded successfully."
        : "Document details saved. File storage will be enabled when configured."
    );
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="input text-sm text-navy bg-white border-soft-200"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="btn-outline inline-flex cursor-pointer px-4 py-2.5 text-sm">
          {uploading ? "Saving…" : "Choose file"}
          <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {message && <p className="text-xs text-emerald-600">{message}</p>}
    </div>
  );
}
