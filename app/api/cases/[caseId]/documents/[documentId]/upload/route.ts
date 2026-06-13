import { NextResponse } from "next/server";
import {
  getSessionUser,
  uploadDocumentFileById,
} from "@/lib/visa-case-document-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string; documentId: string }> }
) {
  const { caseId, documentId } = await params;
  const session = await getSessionUser();
  if (!session.user) {
    return NextResponse.json({ ok: false, error: session.error ?? "Sign in required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Please choose a file to upload." }, { status: 400 });
  }

  const notes = formData.get("notes");
  const replace = formData.get("replace") === "1";

  const result = await uploadDocumentFileById({
    caseId,
    userId: session.user.id,
    documentId,
    fileName: file.name,
    fileBytes: await file.arrayBuffer(),
    contentType: file.type || "application/octet-stream",
    notes: typeof notes === "string" ? notes : undefined,
    replace,
  });

  if (!result.ok) {
    console.error("[api/cases/upload]", result.error);
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "Could not save. Please refresh and try again.",
        storageUnavailable: result.storageUnavailable,
      },
      { status: result.storageUnavailable ? 503 : 500 }
    );
  }

  return NextResponse.json(result);
}
