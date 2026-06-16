import { NextResponse } from "next/server";
import { getSessionUser, uploadDocumentFile } from "@/lib/visa-case-document-service";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { validateUploadFile } from "@/lib/document-upload-validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const session = await getSessionUser();

  if (!session.user) {
    return NextResponse.json(
      { ok: false, error: session.error ?? "Sign in required." },
      { status: 401 }
    );
  }

  const limited = await checkRateLimit("upload", `user:${session.user.id}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload request." }, { status: 400 });
  }

  const documentType = String(formData.get("documentType") ?? "").trim();
  const documentId = String(formData.get("documentId") ?? "").trim() || undefined;
  const file = formData.get("file");

  if (!documentType) {
    return NextResponse.json({ ok: false, error: "Document type is required." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Please choose a file to upload." }, { status: 400 });
  }

  const validation = validateUploadFile({
    fileName: file.name,
    contentType: file.type || "application/octet-stream",
    byteLength: file.size,
  });
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const fileBytes = await file.arrayBuffer();
  const result = await uploadDocumentFile({
    caseId,
    userId: session.user.id,
    documentType,
    documentId,
    fileName: file.name,
    fileBytes,
    contentType: file.type || "application/octet-stream",
  });

  if (!result.ok) {
    console.error("[api/documents/upload] failed:", result.error);
    const isValidation = result.error && !result.storageUnavailable;
    const status = result.storageUnavailable ? 503 : isValidation ? 400 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "Could not save. Please refresh and try again.",
        storageUnavailable: result.storageUnavailable,
      },
      { status }
    );
  }

  return NextResponse.json(result);
}
