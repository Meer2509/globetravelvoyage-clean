import { NextResponse } from "next/server";
import {
  getSessionUser,
  saveDocumentNotesById,
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

  let notes = "";
  try {
    const body = await request.json();
    notes = typeof body?.notes === "string" ? body.notes : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Notes are required." }, { status: 400 });
  }

  const result = await saveDocumentNotesById({
    caseId,
    userId: session.user.id,
    documentId,
    notes,
  });

  if (!result.ok) {
    console.error("[api/cases/save-notes]", result.error);
    return NextResponse.json(
      { ok: false, error: result.error ?? "Could not save. Please refresh and try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
