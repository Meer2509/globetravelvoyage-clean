"use client";

import { useCallback, useRef, useState } from "react";
import {
  appendAiMessage,
  createAiConversation,
} from "@/lib/supabase/ai-actions";
import { isSupabaseConfigured } from "@/lib/auth";

export function usePersistentAiChat(feature: string, title: string) {
  const conversationIdRef = useRef<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);

  const ensureConversation = useCallback(async () => {
    if (!isSupabaseConfigured) return null;
    if (conversationIdRef.current) return conversationIdRef.current;
    const created = await createAiConversation(title, feature);
    if (!created.ok) {
      setPersistError(created.error);
      return null;
    }
    conversationIdRef.current = created.data.id;
    return created.data.id;
  }, [feature, title]);

  const persistExchange = useCallback(
    async (userText: string, assistantText: string) => {
      const convId = await ensureConversation();
      if (!convId) return;
      const userRes = await appendAiMessage(convId, "user", userText);
      if (!userRes.ok) {
        setPersistError(userRes.error);
        return;
      }
      const aiRes = await appendAiMessage(convId, "assistant", assistantText);
      if (!aiRes.ok) setPersistError(aiRes.error);
    },
    [ensureConversation]
  );

  return { persistExchange, persistError, conversationIdRef };
}
