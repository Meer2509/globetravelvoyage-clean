import { NextResponse } from "next/server";
import {
  getSessionUser,
  removeDocumentFileById,
} from "@/lib/visa-case-document-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ caseId: string; documentId: string }> }
) {
  const { caseId, documentId } = await params;
  const session = await getSessionUser();
  if (!session.user) {
    return NextResponse.json({ ok: false, error: session.error ?? "Sign in required." }, { status: 401 });
  }

  const result = await removeDocumentFileById({
    caseId,
    userId: session.user.id,
    documentId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "Could not remove file." },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
