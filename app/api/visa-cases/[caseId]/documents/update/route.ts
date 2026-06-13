import { NextResponse } from "next/server";
import {
  getSessionUser,
  markDocumentPrepared,
  saveDocumentNotes,
  syncCaseProgressForUser,
} from "@/lib/visa-case-document-service";

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

  let body: {
    action?: string;
    documentType?: string;
    documentId?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const documentType = body.documentType?.trim();
  if (!documentType) {
    return NextResponse.json({ ok: false, error: "Document type is required." }, { status: 400 });
  }

  if (body.action === "prepared") {
    const result = await markDocumentPrepared({
      caseId,
      userId: session.user.id,
      documentType,
      documentId: body.documentId,
    });

    if (!result.ok) {
      console.error("[api/documents/update] prepared failed:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error ?? "Could not save. Please refresh and try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  }

  if (body.action === "notes") {
    const result = await saveDocumentNotes({
      caseId,
      userId: session.user.id,
      documentType,
      documentId: body.documentId,
      notes: body.notes ?? "",
    });

    if (!result.ok) {
      console.error("[api/documents/update] notes failed:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error ?? "Could not save. Please refresh and try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}

export async function PATCH(
  _request: Request,
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

  const progress = await syncCaseProgressForUser(caseId, session.user.id);
  if (!progress) {
    return NextResponse.json(
      { ok: false, error: "Could not update progress. Please refresh and try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, progress });
}
