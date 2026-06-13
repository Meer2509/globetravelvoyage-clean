import { NextResponse } from "next/server";
import {
  getSessionUser,
  getDocumentFileAccess,
} from "@/lib/visa-case-document-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string; documentId: string }> }
) {
  const { caseId, documentId } = await params;
  const session = await getSessionUser();
  if (!session.user) {
    return NextResponse.json({ ok: false, error: session.error ?? "Sign in required." }, { status: 401 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const result = await getDocumentFileAccess({
    caseId,
    userId: session.user.id,
    documentId,
    download,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, url: result.url });
}
