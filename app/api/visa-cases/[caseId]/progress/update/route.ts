import { NextResponse } from "next/server";
import { getSessionUser, syncCaseProgressForUser } from "@/lib/visa-case-document-service";

export async function POST(
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
    console.error("[api/progress/update] failed for case", caseId);
    return NextResponse.json(
      { ok: false, error: "Could not update progress. Please refresh and try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, progress });
}
