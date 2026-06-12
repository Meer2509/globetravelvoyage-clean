"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { computeCaseProgress } from "@/lib/visa-case-progress";
import type { VisaCaseData } from "@/lib/supabase/payment-queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedDb = { from: (table: string) => any };

export type DocumentActionResult = {
  ok: boolean;
  error?: string;
  storageUnavailable?: boolean;
  fileUrl?: string;
  progress?: {
    progressPercent: number;
    currentStep: string;
    status: string;
  };
};

async function getWritableDb() {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminClient() as UntypedDb | null;
  return { supabase, admin, db: (admin ?? supabase) as UntypedDb | null };
}

async function syncCaseProgress(
  caseId: string,
  userId: string,
  db: UntypedDb
): Promise<DocumentActionResult["progress"]> {
  const { data: docs } = await db
    .from("case_documents")
    .select("status, is_required")
    .eq("case_id", caseId)
    .eq("user_id", userId);

  const checklist = (docs ?? []).map((d: { status: string; is_required: boolean | null }) => {
    const row = d;
    return {
      name: "",
      status: row.status ?? "pending",
      required: row.is_required ?? true,
    };
  });

  const { progressPercent, currentStep, status } = computeCaseProgress(checklist);

  const { error } = await db
    .from("visa_cases")
    .update({
      progress_percent: progressPercent,
      current_step: currentStep,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("user_id", userId);

  if (error && !isMissingTableError(error)) {
    console.error("[visa_cases] progress sync failed:", error.message);
  }

  return { progressPercent, currentStep, status };
}

async function upsertCaseDocument(
  input: {
    caseId: string;
    userId: string;
    documentType: string;
    documentId?: string;
    payload: Record<string, unknown>;
  },
  db: UntypedDb
): Promise<{ ok: boolean; error?: string; documentId?: string }> {
  if (input.documentId) {
    const { error } = await db
      .from("case_documents")
      .update(input.payload)
      .eq("id", input.documentId)
      .eq("user_id", input.userId);

    if (error) {
      if (isMissingTableError(error)) return { ok: false, error: "Document checklist is not available yet." };
      return { ok: false, error: error.message };
    }
    return { ok: true, documentId: input.documentId };
  }

  const { data: existing } = await db
    .from("case_documents")
    .select("id")
    .eq("case_id", input.caseId)
    .eq("document_type", input.documentType)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing) {
    const id = (existing as { id: string }).id;
    const { error } = await db
      .from("case_documents")
      .update(input.payload)
      .eq("id", id)
      .eq("user_id", input.userId);

    if (error) {
      if (isMissingTableError(error)) return { ok: false, error: "Document checklist is not available yet." };
      return { ok: false, error: error.message };
    }
    return { ok: true, documentId: id };
  }

  const { data: inserted, error } = await db
    .from("case_documents")
    .insert({
      case_id: input.caseId,
      user_id: input.userId,
      document_type: input.documentType,
      ...input.payload,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) return { ok: false, error: "Document checklist is not available yet." };
    return { ok: false, error: error.message };
  }

  return { ok: true, documentId: (inserted as { id: string }).id };
}

export async function uploadCaseDocument(input: {
  caseId: string;
  documentType: string;
  fileName: string;
  file?: File;
}): Promise<DocumentActionResult> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to upload documents." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to upload documents." };

  let fileUrl: string | undefined;
  let storageUnavailable = false;

  if (input.file) {
    const { error: bucketError } = await supabase.storage.from("documents").list("", { limit: 1 });
    if (bucketError) {
      storageUnavailable = true;
    } else {
      const path = `${user.id}/${input.caseId}/${Date.now()}-${input.fileName}`;
      const { data, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, input.file);

      if (!uploadError && data) {
        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(data.path);
        fileUrl = urlData.publicUrl;
      } else {
        storageUnavailable = true;
      }
    }
  }

  if (storageUnavailable && input.file) {
    return {
      ok: false,
      storageUnavailable: true,
      error:
        "Secure file upload is being activated. You can mark this document as prepared for now.",
    };
  }

  const upsert = await upsertCaseDocument(
    {
      caseId: input.caseId,
      userId: user.id,
      documentType: input.documentType,
      payload: {
        file_name: input.fileName,
        file_url: fileUrl ?? null,
        status: fileUrl ? "uploaded" : "pending",
      },
    },
    db
  );

  if (!upsert.ok) return { ok: false, error: upsert.error };

  const progress = await syncCaseProgress(input.caseId, user.id, db);
  return { ok: true, fileUrl, progress };
}

export async function saveCaseDocumentNotes(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
  notes: string;
}): Promise<DocumentActionResult> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to save notes." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to save notes." };

  const upsert = await upsertCaseDocument(
    {
      caseId: input.caseId,
      userId: user.id,
      documentType: input.documentType,
      documentId: input.documentId,
      payload: { notes: input.notes.trim() || null },
    },
    db
  );

  if (!upsert.ok) return { ok: false, error: upsert.error };
  return { ok: true };
}

export async function markCaseDocumentPrepared(input: {
  caseId: string;
  documentType: string;
  documentId?: string;
}): Promise<DocumentActionResult> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to update your checklist." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to update your checklist." };

  const upsert = await upsertCaseDocument(
    {
      caseId: input.caseId,
      userId: user.id,
      documentType: input.documentType,
      documentId: input.documentId,
      payload: { status: "prepared" },
    },
    db
  );

  if (!upsert.ok) return { ok: false, error: upsert.error };

  const progress = await syncCaseProgress(input.caseId, user.id, db);
  return { ok: true, progress };
}

export async function submitCaseSupportMessage(input: {
  caseId: string;
  caseNumber: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to contact support." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to contact support." };

  const subject = `Visa case ${input.caseNumber}`;
  const body = input.message.trim();
  if (!body) return { ok: false, error: "Please enter a message." };

  const { error: ticketError } = await db.from("support_tickets").insert({
    user_id: user.id,
    subject,
    message: body,
    status: "open",
  });

  if (!ticketError) return { ok: true };

  if (!isMissingTableError(ticketError)) {
    const { error: msgError } = await db.from("messages").insert({
      sender_id: user.id,
      receiver_id: null,
      case_id: input.caseId,
      body,
    });
    if (!msgError) return { ok: true };
    return { ok: false, error: msgError.message };
  }

  const { error: legacyError } = await db.from("support_messages").insert({
    user_id: user.id,
    subject,
    body,
    category: "visa_case",
    status: "open",
  });

  if (legacyError) return { ok: false, error: legacyError.message };
  return { ok: true };
}

export async function submitSupportTicket(input: {
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to submit a ticket." };

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await db.from("support_tickets").insert({
    user_id: user?.id ?? null,
    subject: input.subject,
    message: input.message,
    status: "open",
  });
  if (!error) return { ok: true };
  if (!isMissingTableError(error)) return { ok: false, error: error.message };

  const { error: legacyError } = await db.from("support_messages").insert({
    user_id: user?.id ?? null,
    subject: input.subject,
    body: input.message,
    category: "dashboard",
    status: "open",
  });
  if (legacyError) return { ok: false, error: legacyError.message };
  return { ok: true };
}

export async function submitCaseMessage(input: {
  caseId: string;
  body: string;
  receiverId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase, db } = await getWritableDb();
  if (!supabase || !db) return { ok: false, error: "Sign in to send messages." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to send messages." };

  const { error } = await db.from("messages").insert({
    sender_id: user.id,
    receiver_id: input.receiverId ?? null,
    case_id: input.caseId,
    body: input.body,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function refreshCaseProgress(caseId: string): Promise<VisaCaseData["checklist"] | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient() as UntypedDb | null;
  const db = (admin ?? supabase) as UntypedDb;
  await syncCaseProgress(caseId, user.id, db);

  const { data: docs } = await supabase
    .from("case_documents")
    .select("id, document_type, status, is_required, notes")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });

  return (docs ?? []).map((d: {
      id: string;
      document_type: string;
      status: string;
      is_required: boolean | null;
      notes: string | null;
    }) => {
    const row = d;
    return {
      id: row.id,
      name: row.document_type,
      status: row.status ?? "pending",
      documentId: row.id,
      required: row.is_required ?? true,
      notes: row.notes,
    };
  });
}
