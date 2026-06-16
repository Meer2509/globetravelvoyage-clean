"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import {
  getSessionUser,
  verifyCaseOwnership,
  type UntypedDb,
} from "@/lib/visa-case-document-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit";

function getServiceDb(): UntypedDb | null {
  const admin = createAdminClient();
  return admin ? (admin as UntypedDb) : null;
}

export async function submitCaseSupportMessage(input: {
  caseId: string;
  caseNumber: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await getSessionUser();
  if (!session.user) {
    return { ok: false, error: session.error ?? "Sign in to contact support." };
  }

  const limited = await enforceRateLimit("form", session.user.id);
  if (!limited.ok) return { ok: false, error: limited.error };

  const owned = await verifyCaseOwnership(input.caseId, session.user.id);
  if (!owned.ok) return { ok: false, error: owned.error };

  const body = input.message.trim();
  if (!body) return { ok: false, error: "Please enter a message." };

  const subject = `Visa case ${input.caseNumber}`;
  const db = getServiceDb();
  const supabase = await createServerSupabaseClient();
  const writer = db ?? (supabase as UntypedDb | null);

  if (!writer) {
    console.error("[visa-case] support write failed — no database client");
    return { ok: false, error: "Could not send your message. Please try again." };
  }

  const { error: ticketError } = await writer.from("support_tickets").insert({
    user_id: session.user.id,
    subject,
    message: body,
    status: "open",
  });

  if (!ticketError) return { ok: true };

  if (!isMissingTableError(ticketError)) {
    console.error("[visa-case] support_tickets insert failed:", ticketError.message);
    const { error: msgError } = await writer.from("messages").insert({
      sender_id: session.user.id,
      receiver_id: null,
      case_id: input.caseId,
      body,
    });
    if (!msgError) return { ok: true };
    console.error("[visa-case] messages insert failed:", msgError.message);
    return { ok: false, error: "Could not send your message. Please try again." };
  }

  const { error: legacyError } = await writer.from("support_messages").insert({
    user_id: session.user.id,
    subject,
    body,
    category: "visa_case",
    status: "open",
  });

  if (legacyError) {
    console.error("[visa-case] support_messages insert failed:", legacyError.message);
    return { ok: false, error: "Could not send your message. Please try again." };
  }

  return { ok: true };
}

export async function submitSupportTicket(input: {
  subject: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await getSessionUser();
  if (!session.user) return { ok: false, error: "Sign in to submit a ticket." };

  const limited = await enforceRateLimit("form", session.user.id);
  if (!limited.ok) return { ok: false, error: limited.error };

  const db = getServiceDb();
  const supabase = await createServerSupabaseClient();
  const writer = db ?? (supabase as UntypedDb | null);

  if (!writer) return { ok: false, error: "Sign in to submit a ticket." };

  const { error } = await writer.from("support_tickets").insert({
    user_id: session.user?.id ?? null,
    subject: input.subject,
    message: input.message,
    status: "open",
  });
  if (!error) return { ok: true };
  if (!isMissingTableError(error)) {
    console.error("[support] ticket insert failed:", error.message);
    return { ok: false, error: error.message };
  }

  const { error: legacyError } = await writer.from("support_messages").insert({
    user_id: session.user?.id ?? null,
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
  const session = await getSessionUser();
  if (!session.user) return { ok: false, error: "Sign in to send messages." };

  const db = getServiceDb();
  const supabase = await createServerSupabaseClient();
  const writer = db ?? (supabase as UntypedDb | null);
  if (!writer) return { ok: false, error: "Could not send message." };

  const { error } = await writer.from("messages").insert({
    sender_id: session.user.id,
    receiver_id: input.receiverId ?? null,
    case_id: input.caseId,
    body: input.body,
  });

  if (error) {
    console.error("[visa-case] case message failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
