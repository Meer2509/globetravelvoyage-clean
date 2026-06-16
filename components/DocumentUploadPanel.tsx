"use client";

import { useEffect, useState } from "react";
import { defer } from "@/lib/defer-client";
import Link from "next/link";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { Panel } from "@/components/DashboardLayout";
import { saveDocumentRecord } from "@/lib/supabase/mvp-actions";
import { fetchUserDocuments, type DocumentRow } from "@/lib/supabase/mvp-queries";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { validateUploadFile } from "@/lib/document-upload-validation";

export function DocumentUploadPanel({ requestId }: { requestId?: string }) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storageReady] = useState(isSupabaseConfigured);

  function reload() {
    fetchUserDocuments().then((rows) => {
      setDocuments(rows);
      setLoading(false);
    });
  }

  useEffect(() => {
    defer(() => reload());
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");

    const validation = validateUploadFile({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      byteLength: file.size,
    });
    if (!validation.ok) {
      setUploading(false);
      setError(validation.error);
      e.target.value = "";
      return;
    }

    const result = await saveDocumentRecord({
      requestId,
      fileName: file.name,
      fileType: file.type,
    });

    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(
      "Document details saved. Upload the file through your visa case checklist for secure private storage."
    );
    reload();
    e.target.value = "";
  }

  return (
    <div className="space-y-5">
      <Panel title="Visa documents" subtitle="Upload supporting documents for your visa request">
        {!storageReady && (
          <div className="mb-4 rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-charcoal/65">
            File storage is being prepared — your document details are saved securely to your account.{" "}
            <Link href="/admin/setup" className="font-semibold text-blue hover:underline">Setup guide</Link>
          </div>
        )}

        <p className="mb-3 text-xs text-charcoal/55">
          Files are stored privately and accessed via signed links from your{" "}
          <Link href="/dashboard/visa-cases" className="font-semibold text-blue hover:underline">
            visa case checklist
          </Link>
          . PDF and image files up to 10 MB.
        </p>

        <label className="btn-outline inline-flex cursor-pointer px-4 py-2.5 text-sm">
          {uploading ? "Saving…" : "Register document"}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-600">{success}</p>}

        {loading ? (
          <p className="mt-4 text-sm text-charcoal/50">Loading documents…</p>
        ) : documents.length === 0 ? (
          <DashboardEmpty
            title="No documents uploaded"
            message="Upload passport copies, bank statements, and other supporting documents for your visa application."
          />
        ) : (
          <div className="mt-4 divide-y divide-soft-200">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-navy">{d.file_name}</p>
                  <p className="text-xs text-charcoal/50 capitalize">{d.status}</p>
                </div>
                {d.file_url && !d.file_url.startsWith("http") && (
                  <span className="text-xs text-charcoal/45">Available in case checklist</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
