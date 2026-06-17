"use client";

import { useState } from "react";
import Link from "next/link";
import { saveAiTripPlan } from "@/lib/supabase/ai-actions";
import type { TripInput, TripResult } from "@/lib/ai-types";
import { isSupabaseConfigured } from "@/lib/auth";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function SaveTripButton({
  form,
  result,
  conversationId,
}: {
  form: TripInput;
  result: TripResult;
  conversationId?: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  if (!isSupabaseConfigured) return null;

  async function handleSave() {
    setStatus("saving");
    setError("");
    const res = await saveAiTripPlan({ form, result, conversationId });
    if (!res.ok) {
      setStatus("error");
      setError(res.error === "Sign in to save your AI concierge data." ? res.error : FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setStatus("saved");
  }

  if (status === "saved") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          Secure request saved to your dashboard
        </span>
        <Link href="/dashboard/customer" className="btn-outline px-4 py-2 text-sm">
          View saved trips →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="btn-gold px-5 py-2.5 text-sm font-bold disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save trip to dashboard"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">
          {error}{" "}
          {error.includes("Sign in") && (
            <Link href="/login" className="font-semibold text-blue hover:underline">
              Sign in
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
