"use client";

import { useEffect, useRef } from "react";
import { saveAbandonedInquiry } from "@/lib/growth/abandoned-inquiry-actions";
import { GROWTH_SESSION_KEY } from "@/lib/growth/attribution-cookie";
import type { AbandonedInquiryType } from "@/lib/growth/types";

export function useAbandonedInquirySaver(input: {
  inquiryType: AbandonedInquiryType;
  email: string;
  draftData: Record<string, unknown>;
  enabled?: boolean;
}) {
  const savedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!input.enabled || !input.email.includes("@") || savedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const sessionId =
        typeof window !== "undefined" ? localStorage.getItem(GROWTH_SESSION_KEY) ?? undefined : undefined;

      saveAbandonedInquiry({
        inquiryType: input.inquiryType,
        email: input.email,
        draftData: input.draftData,
        sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
        sessionId,
      }).then((result) => {
        if (result.ok) savedRef.current = true;
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input.inquiryType, input.email, input.draftData, input.enabled]);
}
