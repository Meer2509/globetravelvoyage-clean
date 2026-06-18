"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { notifyIntakeSubmission } from "@/lib/email/intake-notifications";

export type MessagingResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface ConversationSummary {
  id: string;
  kind: string;
  subject: string | null;
  updated_at: string;
  other_user_id: string | null;
  other_user_name: string | null;
  last_message: string | null;
  unread: boolean;
}

export interface ThreadMessage {
  id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  sender_name: string | null;
}

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to use messaging." };
  return user.id;
}

export async function getOrCreateDirectConversation(
  otherUserId: string,
  subject?: string
): Promise<MessagingResult<{ conversationId: string }>> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };
  if (otherUserId === userId) return { ok: false, error: "Cannot message yourself." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: myConvs } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  const myIds = (myConvs ?? []).map((r) => (r as { conversation_id: string }).conversation_id);

  if (myIds.length > 0) {
    const { data: shared } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myIds)
      .limit(1)
      .maybeSingle();

    if (shared) {
      return { ok: true, data: { conversationId: (shared as { conversation_id: string }).conversation_id } };
    }
  }

  const { data: conv, error: convError } = await admin
    .from("conversations")
    .insert({
      kind: "direct",
      subject: subject ?? "Direct message",
    })
    .select("id")
    .single();

  if (convError || !conv) return { ok: false, error: convError?.message ?? "Failed to create conversation." };

  const conversationId = (conv as { id: string }).id;

  const { error: partError } = await admin.from("conversation_participants").insert([
    { conversation_id: conversationId, user_id: userId },
    { conversation_id: conversationId, user_id: otherUserId },
  ]);

  if (partError) return { ok: false, error: partError.message };

  return { ok: true, data: { conversationId } };
}

export async function sendConversationMessage(
  conversationId: string,
  body: string
): Promise<MessagingResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };
  if (!body.trim()) return { ok: false, error: "Message cannot be empty." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: membership } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "You are not a participant in this conversation." };

  const { data, error } = await admin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: body.trim(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await admin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function fetchUserConversations(): Promise<ConversationSummary[]> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data: parts } = await admin
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (!parts?.length) return [];

  const convIds = parts.map((p) => (p as { conversation_id: string }).conversation_id);

  const { data: convs } = await admin
    .from("conversations")
    .select("id, kind, subject, updated_at")
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  const summaries: ConversationSummary[] = [];

  for (const conv of convs ?? []) {
    const c = conv as { id: string; kind: string; subject: string | null; updated_at: string };

    const { data: others } = await admin
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", c.id)
      .neq("user_id", userId)
      .limit(1);

    const otherId = (others?.[0] as { user_id: string } | undefined)?.user_id ?? null;
    let otherName: string | null = null;
    if (otherId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, email")
        .eq("id", otherId)
        .maybeSingle();
      otherName =
        (profile as { full_name: string | null; email: string } | null)?.full_name ??
        (profile as { email: string } | null)?.email ??
        null;
    }

    const { data: lastMsg } = await admin
      .from("messages")
      .select("body, created_at, sender_id")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const myPart = parts.find((p) => (p as { conversation_id: string }).conversation_id === c.id) as
      | { last_read_at: string | null }
      | undefined;

    const lastAt = (lastMsg as { created_at: string } | null)?.created_at;
    const unread = Boolean(
      lastMsg &&
        (lastMsg as { sender_id: string }).sender_id !== userId &&
        (!myPart?.last_read_at || (lastAt && lastAt > myPart.last_read_at))
    );

    summaries.push({
      id: c.id,
      kind: c.kind,
      subject: c.subject,
      updated_at: c.updated_at,
      other_user_id: otherId,
      other_user_name: otherName,
      last_message: (lastMsg as { body: string } | null)?.body ?? null,
      unread,
    });
  }

  return summaries;
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<ThreadMessage[]> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data: membership } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return [];

  const { data: msgs } = await admin
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  const senderIds = [
    ...new Set((msgs ?? []).map((m) => (m as { sender_id: string | null }).sender_id).filter(Boolean)),
  ] as string[];

  const nameMap = new Map<string, string>();
  if (senderIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", senderIds);
    for (const p of profiles ?? []) {
      const row = p as { id: string; full_name: string | null; email: string };
      nameMap.set(row.id, row.full_name ?? row.email);
    }
  }

  await admin
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  return (msgs ?? []).map((m) => {
    const row = m as { id: string; sender_id: string | null; body: string; created_at: string };
    return {
      id: row.id,
      sender_id: row.sender_id,
      body: row.body,
      created_at: row.created_at,
      sender_name: row.sender_id ? nameMap.get(row.sender_id) ?? null : null,
    };
  });
}

export async function startProviderConversation(input: {
  providerUserId: string;
  providerName: string;
  message: string;
}): Promise<MessagingResult<{ conversationId: string }>> {
  const conv = await getOrCreateDirectConversation(
    input.providerUserId,
    `Message to ${input.providerName}`
  );
  if (!conv.ok) return conv;

  const sent = await sendConversationMessage(conv.data.conversationId, input.message);
  if (!sent.ok) return sent;

  return conv;
}

export async function reportMessage(input: {
  conversationId: string;
  messageId?: string;
  reason: string;
  details?: string;
}): Promise<MessagingResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: membership } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", input.conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return { ok: false, error: "You are not a participant in this conversation." };

  const { data, error } = await admin
    .from("message_reports")
    .insert({
      reporter_id: userId,
      conversation_id: input.conversationId,
      message_id: input.messageId ?? null,
      reason: input.reason.trim(),
      details: input.details?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

async function resolveSupportAdminUserId(admin: NonNullable<ReturnType<typeof createAdminClient>>): Promise<string | null> {
  const supportId = process.env.SUPPORT_USER_ID?.trim();
  if (supportId) return supportId;

  const adminEmail = (
    process.env.PLATFORM_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    ""
  ).toLowerCase();

  if (adminEmail) {
    const { data: byEmail } = await admin
      .from("profiles")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();
    if (byEmail) return (byEmail as { id: string }).id;
  }

  const { data: adminProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  return adminProfile ? (adminProfile as { id: string }).id : null;
}

export async function getOrCreateSupportConversation(): Promise<MessagingResult<{ conversationId: string }>> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const supportUserId = await resolveSupportAdminUserId(admin);
  if (!supportUserId) return { ok: false, error: "Support messaging is not configured yet." };

  return getOrCreateDirectConversation(supportUserId, "Support");
}

export async function fetchAdminMessageReports(): Promise<{
  rows: Array<Record<string, unknown>>;
  error?: string;
}> {
  const { requireAdmin } = await import("@/lib/auth-server");
  const auth = await requireAdmin();
  if (!auth.ok) return { rows: [], error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { rows: [], error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("message_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as Array<Record<string, unknown>> };
}

export async function adminResolveMessageReport(
  reportId: string,
  status: "reviewed" | "dismissed"
): Promise<MessagingResult> {
  const { requireAdmin } = await import("@/lib/auth-server");
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error } = await admin
    .from("message_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: reportId } };
}

export interface AdminConversationDetail {
  id: string;
  kind: string;
  subject: string | null;
  updated_at: string;
  participants: Array<{ user_id: string; name: string | null }>;
  messages: ThreadMessage[];
}

export async function fetchAdminConversationDetail(
  conversationId: string
): Promise<{ detail: AdminConversationDetail | null; error?: string }> {
  const { requireAdmin } = await import("@/lib/auth-server");
  const auth = await requireAdmin();
  if (!auth.ok) return { detail: null, error: auth.error };

  const admin = createAdminClient();
  if (!admin) return { detail: null, error: "Supabase is not configured." };

  const { data: conv, error: convError } = await admin
    .from("conversations")
    .select("id, kind, subject, updated_at")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError || !conv) return { detail: null, error: convError?.message ?? "Conversation not found." };

  const { data: parts } = await admin
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);

  const userIds = (parts ?? []).map((p) => (p as { user_id: string }).user_id);
  const nameMap = new Map<string, string>();
  if (userIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      const row = p as { id: string; full_name: string | null; email: string };
      nameMap.set(row.id, row.full_name ?? row.email);
    }
  }

  const { data: msgs } = await admin
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(300);

  const messages: ThreadMessage[] = (msgs ?? []).map((m) => {
    const row = m as { id: string; sender_id: string | null; body: string; created_at: string };
    return {
      id: row.id,
      sender_id: row.sender_id,
      body: row.body,
      created_at: row.created_at,
      sender_name: row.sender_id ? nameMap.get(row.sender_id) ?? null : null,
    };
  });

  const c = conv as { id: string; kind: string; subject: string | null; updated_at: string };

  return {
    detail: {
      id: c.id,
      kind: c.kind,
      subject: c.subject,
      updated_at: c.updated_at,
      participants: userIds.map((uid) => ({
        user_id: uid,
        name: nameMap.get(uid) ?? null,
      })),
      messages,
    },
  };
}
