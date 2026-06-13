import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { computeCaseProgress } from "@/lib/visa-case-progress";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UntypedDb = { from: (table: string) => any };

export type DocumentWriteResult = {
  ok: boolean;
  error?: string;
  documentId?: string;
  status?: string;
  notes?: string | null;
  fileUrl?: string;
  storageUnavailable?: boolean;
  progress?: {
    progressPercent: number;
    currentStep: string;
    status: string;
  };
};

export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { user: null as null, supabase: null, error: "Database not configured." };
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null as null, supabase, error: "Sign in required." };
  }
  return { user, supabase, error: null };
}

function getServiceDb(): { db: UntypedDb } | { error: string } {
  const admin = createAdminClient();
  if (!admin) {
    console.error(
      "[visa-case] SUPABASE_SERVICE_ROLE_KEY is missing — document writes cannot persist"
    );
    return { error: "Could not save. Please refresh and try again." };
  }
  return { db: admin as UntypedDb };
}

export async function verifyCaseOwnership(
  caseId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const svc = getServiceDb();
  if ("error" in svc) return { ok: false, error: svc.error };

  const { data, error } = await svc.db
    .from("visa_cases")
    .select("id, user_id")
    .eq("id", caseId)
    .maybeSingle();

  if (error) {
    console.error("[visa-case] ownership check failed:", error.message);
    if (isMissingTableError(error)) {
      return { ok: false, error: "Visa case system is not available yet." };
    }
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  if (!data) return { ok: false, error: "Case not found." };
  if ((data as { user_id: string }).user_id !== userId) {
    return { ok: false, error: "You do not have access to this case." };
  }
  return { ok: true };
}

export async function syncCaseProgressForUser(
  caseId: string,
  userId: string
): Promise<DocumentWriteResult["progress"]> {
  const svc = getServiceDb();
  if ("error" in svc) return undefined;

  const { data: docs, error: docsError } = await svc.db
    .from("case_documents")
    .select("status, is_required")
    .eq("case_id", caseId)
    .eq("user_id", userId);

  if (docsError) {
    console.error("[visa-case] progress read failed:", docsError.message);
    return undefined;
  }

  const checklist = (docs ?? []).map((d: { status: string; is_required: boolean | null }) => ({
    name: "",
    status: d.status ?? "pending",
    required: d.is_required ?? true,
  }));

  const { progressPercent, currentStep, status } = computeCaseProgress(checklist);

  const { data: updated, error } = await svc.db
    .from("visa_cases")
    .update({
      progress_percent: progressPercent,
      current_step: currentStep,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("user_id", userId)
    .select("progress_percent, current_step, status")
    .maybeSingle();

  if (error) {
    console.error("[visa-case] progress sync failed:", error.message);
    return undefined;
  }

  if (!updated) {
    console.error("[visa-case] progress sync updated 0 rows for case", caseId);
    return undefined;
  }

  return { progressPercent, currentStep, status };
}

async function findDocumentRow(
  db: UntypedDb,
  input: { caseId: string; userId: string; documentType: string; documentId?: string }
): Promise<{ id: string } | null> {
  if (input.documentId) {
    const { data } = await db
      .from("case_documents")
      .select("id")
      .eq("id", input.documentId)
      .eq("case_id", input.caseId)
      .eq("user_id", input.userId)
      .maybeSingle();
    return data as { id: string } | null;
  }

  const { data } = await db
    .from("case_documents")
    .select("id")
    .eq("case_id", input.caseId)
    .eq("document_type", input.documentType)
    .eq("user_id", input.userId)
    .maybeSingle();

  return data as { id: string } | null;
}

async function writeDocument(
  db: UntypedDb,
  input: {
    caseId: string;
    userId: string;
    documentType: string;
    documentId?: string;
    payload: Record<string, unknown>;
  }
): Promise<{ ok: boolean; error?: string; documentId?: string; row?: Record<string, unknown> }> {
  const existing = await findDocumentRow(db, input);

  if (existing) {
    const { data, error } = await db
      .from("case_documents")
      .update(input.payload)
      .eq("id", existing.id)
      .eq("user_id", input.userId)
      .select("id, status, notes, file_name, file_url")
      .maybeSingle();

    if (error) {
      console.error("[visa-case] document update failed:", error.message, input);
      if (isMissingTableError(error)) {
        return { ok: false, error: "Document checklist is not available yet." };
      }
      return { ok: false, error: "Could not save. Please refresh and try again." };
    }

    if (!data) {
      console.error("[visa-case] document update matched 0 rows:", existing.id);
      return { ok: false, error: "Could not save. Please refresh and try again." };
    }

    return { ok: true, documentId: (data as { id: string }).id, row: data as Record<string, unknown> };
  }

  const { data, error } = await db
    .from("case_documents")
    .insert({
      case_id: input.caseId,
      user_id: input.userId,
      document_type: input.documentType,
      status: "pending",
      ...input.payload,
    })
    .select("id, status, notes, file_name, file_url")
    .single();

  if (error) {
    console.error("[visa-case] document insert failed:", error.message, input);
    if (isMissingTableError(error)) {
      return { ok: false, error: "Document checklist is not available yet." };
    }
    return { ok: false, error: "Could not save. Please refresh and try again." };
  }

  return { ok: true, documentId: (data as { id: string }).id, row: data as Record<string, unknown> };
}

export async function markDocumentPrepared(input: {
  caseId: string;
  userId: string;
  documentType: string;
  documentId?: string;
}): Promise<DocumentWriteResult> {
  const owned = await verifyCaseOwnership(input.caseId, input.userId);
  if (!owned.ok) return { ok: false, error: owned.error };

  const svc = getServiceDb();
  if ("error" in svc) return { ok: false, error: svc.error };

  const written = await writeDocument(svc.db, {
    caseId: input.caseId,
    userId: input.userId,
    documentType: input.documentType,
    documentId: input.documentId,
    payload: { status: "prepared" },
  });

  if (!written.ok) return { ok: false, error: written.error };

  const progress = await syncCaseProgressForUser(input.caseId, input.userId);
  const row = written.row as { status?: string } | undefined;

  return {
    ok: true,
    documentId: written.documentId,
    status: row?.status ?? "prepared",
    progress,
  };
}

export async function saveDocumentNotes(input: {
  caseId: string;
  userId: string;
  documentType: string;
  documentId?: string;
  notes: string;
}): Promise<DocumentWriteResult> {
  const owned = await verifyCaseOwnership(input.caseId, input.userId);
  if (!owned.ok) return { ok: false, error: owned.error };

  const svc = getServiceDb();
  if ("error" in svc) return { ok: false, error: svc.error };

  const written = await writeDocument(svc.db, {
    caseId: input.caseId,
    userId: input.userId,
    documentType: input.documentType,
    documentId: input.documentId,
    payload: { notes: input.notes.trim() || null },
  });

  if (!written.ok) return { ok: false, error: written.error };

  const row = written.row as { notes?: string | null } | undefined;
  return {
    ok: true,
    documentId: written.documentId,
    notes: row?.notes ?? (input.notes.trim() || null),
  };
}

export async function uploadDocumentFile(input: {
  caseId: string;
  userId: string;
  documentType: string;
  documentId?: string;
  fileName: string;
  fileBytes: ArrayBuffer;
  contentType: string;
}): Promise<DocumentWriteResult> {
  const owned = await verifyCaseOwnership(input.caseId, input.userId);
  if (!owned.ok) return { ok: false, error: owned.error };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Sign in required." };

  let fileUrl: string | undefined;
  let storageUnavailable = false;

  const { error: bucketError } = await supabase.storage.from("documents").list("", { limit: 1 });
  if (bucketError) {
    storageUnavailable = true;
  } else {
    const path = `${input.userId}/${input.caseId}/${Date.now()}-${input.fileName}`;
    const blob = new Blob([input.fileBytes], { type: input.contentType });
    const { data, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, blob, { contentType: input.contentType, upsert: false });

    if (!uploadError && data) {
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(data.path);
      fileUrl = urlData.publicUrl;
    } else {
      console.error("[visa-case] storage upload failed:", uploadError?.message);
      storageUnavailable = true;
    }
  }

  if (storageUnavailable) {
    return {
      ok: false,
      storageUnavailable: true,
      error:
        "Secure file upload is being activated. You can mark this document as prepared for now.",
    };
  }

  const svc = getServiceDb();
  if ("error" in svc) return { ok: false, error: svc.error };

  const written = await writeDocument(svc.db, {
    caseId: input.caseId,
    userId: input.userId,
    documentType: input.documentType,
    documentId: input.documentId,
    payload: {
      file_name: input.fileName,
      file_url: fileUrl ?? null,
      status: "uploaded",
    },
  });

  if (!written.ok) return { ok: false, error: written.error };

  const progress = await syncCaseProgressForUser(input.caseId, input.userId);

  return {
    ok: true,
    documentId: written.documentId,
    status: "uploaded",
    fileUrl,
    progress,
  };
}
