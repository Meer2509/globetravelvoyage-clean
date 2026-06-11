"use server";

import { createServerSupabaseClient } from "./server";
import { createAdminClient } from "./admin";
import { isMissingTableError } from "./profile-utils";

export type SavedActionResult =
  | { ok: true }
  | { ok: false; error: string; tableMissing?: boolean };

async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function toggleSavedItem(input: {
  itemType: string;
  itemId: string;
  title?: string;
  saved: boolean;
}): Promise<SavedActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Sign in to save items." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  if (!input.saved) {
    const { error } = await admin
      .from("saved_items")
      .delete()
      .eq("user_id", userId)
      .eq("item_type", input.itemType)
      .eq("item_id", input.itemId);
    if (error) {
      if (isMissingTableError(error)) {
        return { ok: false, error: "Run supabase/migrations/006_saved_items.sql first.", tableMissing: true };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const { error } = await admin.from("saved_items").upsert(
    {
      user_id: userId,
      item_type: input.itemType,
      item_id: input.itemId,
      title: input.title ?? null,
    },
    { onConflict: "user_id,item_type,item_id" }
  );

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Run supabase/migrations/006_saved_items.sql first.", tableMissing: true };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function fetchUserSavedIds(itemType: string): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("saved_items")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", itemType);

  return (data ?? []).map((r) => (r as { item_id: string }).item_id);
}
