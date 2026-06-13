import { NextResponse } from "next/server";
import { getSessionUser, verifyCaseOwnership } from "@/lib/visa-case-document-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChecklistText } from "@/lib/visa-case-checklist-download";
import { mapVisaCaseRow } from "@/lib/supabase/visa-case-mapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const session = await getSessionUser();
  if (!session.user) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  const owned = await verifyCaseOwnership(caseId, session.user.id);
  if (!owned.ok) {
    return NextResponse.json({ ok: false, error: owned.error }, { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  const admin = createAdminClient();
  const db = admin ?? supabase;
  if (!db) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }

  const { data: row } = await db
    .from("visa_cases")
    .select("*")
    .eq("id", caseId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 });
  }

  const visaCase = await mapVisaCaseRow(row as Record<string, unknown>, supabase);
  if (!visaCase) {
    return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 });
  }

  const text = buildChecklistText(visaCase);
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${visaCase.caseNumber}-checklist.txt"`,
    },
  });
}
