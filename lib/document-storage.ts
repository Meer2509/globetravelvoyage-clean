import { createAdminClient } from "@/lib/supabase/admin";
import { validateUploadFile } from "@/lib/document-upload-validation";

const BUCKET = "documents";
const SIGNED_URL_TTL_SEC = 3600;

export function sanitizeStorageFileName(fileName: string): string {
  const base = fileName.replace(/[/\\]/g, "_").replace(/\s+/g, "_");
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "");
  return cleaned || "document";
}

export function buildDocumentStoragePath(input: {
  userId: string;
  caseId: string;
  documentId: string;
  fileName: string;
}): string {
  const safeName = sanitizeStorageFileName(input.fileName);
  return `${input.userId}/${input.caseId}/${input.documentId}/${safeName}`;
}

export async function isDocumentsBucketReady(): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.storage.from(BUCKET).list("", { limit: 1 });
  return !error;
}

export async function uploadCaseDocumentFile(input: {
  userId: string;
  caseId: string;
  documentId: string;
  fileName: string;
  fileBytes: ArrayBuffer;
  contentType: string;
  replace?: boolean;
}): Promise<
  | { ok: true; storagePath: string }
  | { ok: false; storageUnavailable: true; error: string }
  | { ok: false; error: string }
> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      storageUnavailable: true,
      error:
        "Secure file storage is not active yet. This document was marked prepared, but no file was uploaded.",
    };
  }

  const ready = await isDocumentsBucketReady();
  if (!ready) {
    return {
      ok: false,
      storageUnavailable: true,
      error:
        "Secure file storage is not active yet. This document was marked prepared, but no file was uploaded.",
    };
  }

  const validation = validateUploadFile({
    fileName: input.fileName,
    contentType: input.contentType,
    byteLength: input.fileBytes.byteLength,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const storagePath = buildDocumentStoragePath(input);
  const blob = new Blob([input.fileBytes], { type: input.contentType });

  const { data, error } = await admin.storage.from(BUCKET).upload(storagePath, blob, {
    contentType: input.contentType,
    upsert: Boolean(input.replace),
  });

  if (error || !data?.path) {
    console.error("[document-storage] upload failed:", error?.message);
    return {
      ok: false,
      storageUnavailable: true,
      error:
        "Secure file storage is not active yet. This document was marked prepared, but no file was uploaded.",
    };
  }

  return { ok: true, storagePath: data.path };
}

export async function removeCaseDocumentFile(
  storagePath: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Storage not available." };

  const { error } = await admin.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    console.error("[document-storage] remove failed:", error.message);
    return { ok: false, error: "Could not remove file." };
  }
  return { ok: true };
}

export async function createCaseDocumentSignedUrl(
  storagePath: string,
  download = false
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Storage not available." };

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(
    storagePath,
    SIGNED_URL_TTL_SEC,
    download ? { download: true } : undefined
  );

  if (error || !data?.signedUrl) {
    console.error("[document-storage] signed url failed:", error?.message);
    return { ok: false, error: "Could not open file." };
  }

  return { ok: true, url: data.signedUrl };
}
