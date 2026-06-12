"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardEmpty } from "@/components/DashboardEmpty";
import { Panel } from "@/components/DashboardLayout";
import { saveDocumentRecord } from "@/lib/supabase/mvp-actions";
import { fetchUserDocuments, type DocumentRow } from "@/lib/supabase/mvp-queries";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function DocumentUploadPanel({ requestId }: { requestId?: string }) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  function reload() {
    fetchUserDocuments().then((rows) => {
      setDocuments(rows);
      setLoading(false);
    });
  }

  useEffect(() => {
    reload();
    if (isSupabaseConfigured) setStorageReady(true);
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");

    let fileUrl: string | undefined;
    const client = createClient();

    if (client && storageReady) {
      const path = `${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await client.storage.from("documents").upload(path, file);
      if (!uploadError && data) {
        const { data: urlData } = client.storage.from("documents").getPublicUrl(data.path);
        fileUrl = urlData.publicUrl;
      }
    }

    const result = await saveDocumentRecord({
      requestId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
    });

    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(fileUrl ? "Document uploaded and saved." : "Document record saved. Configure the documents storage bucket for file uploads.");
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

        <label className="btn-outline inline-flex cursor-pointer px-4 py-2.5 text-sm">
          {uploading ? "Uploading…" : "Choose file"}
          <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
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
                {d.file_url && (
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue hover:underline">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
