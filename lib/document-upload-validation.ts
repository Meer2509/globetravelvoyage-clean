export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "";
  return fileName.slice(dot).toLowerCase();
}

export function validateUploadFile(input: {
  fileName: string;
  contentType: string;
  byteLength: number;
}): { ok: true } | { ok: false; error: string } {
  if (input.byteLength <= 0) {
    return { ok: false, error: "File is empty." };
  }

  if (input.byteLength > MAX_DOCUMENT_BYTES) {
    const maxMb = MAX_DOCUMENT_BYTES / (1024 * 1024);
    return { ok: false, error: `File must be ${maxMb} MB or smaller.` };
  }

  const ext = fileExtension(input.fileName);
  const mime = (input.contentType.split(";")[0]?.trim() || "application/octet-stream").toLowerCase();
  const mimeOk = ALLOWED_DOCUMENT_MIMES.has(mime);
  const extOk = ALLOWED_DOCUMENT_EXTENSIONS.has(ext);

  if (!mimeOk && !extOk) {
    return {
      ok: false,
      error: "Only PDF and image files (JPG, PNG, WebP, HEIC) are allowed.",
    };
  }

  if (mime === "application/octet-stream" && !extOk) {
    return { ok: false, error: "Could not verify file type. Use PDF or a common image format." };
  }

  return { ok: true };
}

/** Returns a storage path or null when the value is a legacy public HTTP URL. */
export function resolveDocumentStoragePath(input: {
  storage_path: string | null;
  file_url: string | null;
}): string | null {
  if (input.storage_path?.trim()) return input.storage_path.trim();

  const fileUrl = input.file_url?.trim();
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return null;
  }

  return fileUrl;
}
