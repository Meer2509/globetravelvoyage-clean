import { NextResponse } from "next/server";
import {
  getSessionUser,
  markDocumentPreparedById,
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

  let notes: string | undefined;
  try {
    const body = await request.json();
    notes = typeof body?.notes === "string" ? body.notes : undefined;
  } catch {
    // optional body
  }

  const result = await markDocumentPreparedById({
    caseId,
    userId: session.user.id,
    documentId,
    notes,
  });

  if (!result.ok) {
    console.error("[api/cases/mark-prepared]", result.error);
    return NextResponse.json(
      { ok: false, error: result.error ?? "Could not save. Please refresh and try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
