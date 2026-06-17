"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { requireAdmin } from "@/lib/auth-server";
import type { TripInput, TripResult } from "@/lib/ai-types";

export type AiActionResult<T = { id: string }> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save your AI concierge data." };
  return user.id;
}

export interface AiConversationRow {
  id: string;
  title: string;
  feature: string;
  created_at: string;
  updated_at: string;
}

export interface AiMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface SavedTripRow {
  id: string;
  title: string;
  destination: string | null;
  days: number | null;
  budget_usd: number | null;
  created_at: string;
}

export async function createAiConversation(
  title: string,
  feature = "concierge"
): Promise<AiActionResult<{ id: string }>> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await admin
    .from("ai_conversations")
    .insert({ user_id: userId, title: title.slice(0, 120), feature })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function appendAiMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<AiActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { data: conv } = await admin
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!conv) return { ok: false, error: "Conversation not found." };

  const { error: msgError } = await admin.from("ai_messages").insert({
    conversation_id: conversationId,
    role,
    content: content.trim(),
  });

  if (msgError) return { ok: false, error: msgError.message };

  await admin
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { ok: true, data: { id: conversationId } };
}

export async function saveAiTripPlan(input: {
  form: TripInput;
  result: TripResult;
  conversationId?: string;
}): Promise<AiActionResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return { ok: false, error: userId.error };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const title = `${input.result.totalDays}-Day ${input.result.destination} Trip`;

  const { data, error } = await admin
    .from("trip_plans")
    .insert({
      user_id: userId,
      title,
      destination: input.result.destination,
      days: input.result.totalDays,
      budget_usd: input.form.budget,
      travelers: input.form.travelers,
      travel_style: input.form.travelStyle,
      group_type: input.form.travelStyle,
      special_needs: input.form.interests.join(", ") || null,
      ai_itinerary: {
        form: input.form,
        result: input.result,
        savedAt: new Date().toISOString(),
      },
      is_saved: true,
      is_public: false,
      source: "ai_trip_planner",
      ai_conversation_id: input.conversationId ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function fetchUserAiConversations(): Promise<AiConversationRow[]> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("ai_conversations")
    .select("id, title, feature, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(30);

  return (data ?? []) as AiConversationRow[];
}

export async function fetchAiConversationMessages(
  conversationId: string
): Promise<AiMessageRow[]> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data: conv } = await admin
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!conv) return [];

  const { data } = await admin
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (data ?? []) as AiMessageRow[];
}

export async function fetchUserSavedTrips(): Promise<SavedTripRow[]> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("trip_plans")
    .select("id, title, destination, days, budget_usd, created_at")
    .eq("user_id", userId)
    .eq("is_saved", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []) as SavedTripRow[];
}

export async function fetchAdminSavedTrips(limit = 100): Promise<
  Array<SavedTripRow & { user_id: string; source: string | null }>
> {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("trip_plans")
    .select("id, user_id, title, destination, days, budget_usd, source, created_at")
    .eq("is_saved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Array<SavedTripRow & { user_id: string; source: string | null }>;
}
