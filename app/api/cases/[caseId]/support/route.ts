import { NextResponse } from "next/server";
import {
  getSessionUser,
  submitCaseSupport,
  verifyCaseOwnership,
} from "@/lib/visa-case-document-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const session = await getSessionUser();
  if (!session.user) {
    return NextResponse.json({ ok: false, error: session.error ?? "Sign in required." }, { status: 401 });
  }

  const limited = await checkRateLimit("form", `user:${session.user.id}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) }
    );
  }

  let message = "";
  try {
    const body = await request.json();
    message = typeof body?.message === "string" ? body.message : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  let caseNumber = caseId.slice(0, 8);
  if (admin) {
    const { data } = await admin
      .from("visa_cases")
      .select("case_number")
      .eq("id", caseId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (data) caseNumber = (data as { case_number: string }).case_number;
  }

  const owned = await verifyCaseOwnership(caseId, session.user.id);
  if (!owned.ok) {
    return NextResponse.json({ ok: false, error: owned.error }, { status: 403 });
  }

  const result = await submitCaseSupport({
    caseId,
    userId: session.user.id,
    caseNumber,
    message,
  });

  if (!result.ok) {
    console.error("[api/cases/support]", result.error);
    return NextResponse.json(
      { ok: false, error: result.error ?? "Could not send your message." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
