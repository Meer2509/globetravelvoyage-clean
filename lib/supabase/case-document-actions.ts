"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedDb = { from: (table: string) => any };

export async function uploadCaseDocument(input: {
  caseId: string;
  documentType: string;
  fileName: string;
  file?: File;
}): Promise<{ ok: boolean; error?: string; fileUrl?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Sign in to upload documents." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to upload documents." };

  let fileUrl: string | undefined;

  if (input.file) {
    const path = `${user.id}/${input.caseId}/${Date.now()}-${input.fileName}`;
    const { data, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, input.file);

    if (!uploadError && data) {
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(data.path);
      fileUrl = urlData.publicUrl;
    }
  }

  const admin = createAdminClient() as UntypedDb | null;
  if (!admin) return { ok: true, fileUrl };

  const { data: existing } = await admin
    .from("case_documents")
    .select("id")
    .eq("case_id", input.caseId)
    .eq("document_type", input.documentType)
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    file_name: input.fileName,
    file_url: fileUrl ?? null,
    status: fileUrl ? "uploaded" : "pending",
  };

  if (existing) {
    const { error } = await admin
      .from("case_documents")
      .update(payload)
      .eq("id", (existing as { id: string }).id);

    if (error) {
      if (isMissingTableError(error)) return { ok: true, fileUrl };
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await admin.from("case_documents").insert({
      case_id: input.caseId,
      user_id: user.id,
      document_type: input.documentType,
      ...payload,
    });

    if (error) {
      if (isMissingTableError(error)) return { ok: true, fileUrl };
      return { ok: false, error: error.message };
    }
  }

  return { ok: true, fileUrl };
}

export async function submitSupportTicket(input: {
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Sign in to submit a ticket." };

  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient() as UntypedDb | null;

  if (admin) {
    const { error } = await admin.from("support_tickets").insert({
      user_id: user?.id ?? null,
      subject: input.subject,
      message: input.message,
      status: "open",
    });
    if (!error) return { ok: true };
    if (!isMissingTableError(error)) return { ok: false, error: error.message };
  }

  const legacyDb = (admin ?? (supabase as UntypedDb));
  const { error: legacyError } = await legacyDb.from("support_messages").insert({
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
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Sign in to send messages." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to send messages." };

  const admin = createAdminClient() as UntypedDb | null;
  const db = admin ?? (supabase as UntypedDb);

  const { error } = await db.from("messages").insert({
    sender_id: user.id,
    receiver_id: input.receiverId ?? null,
    case_id: input.caseId,
    body: input.body,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
