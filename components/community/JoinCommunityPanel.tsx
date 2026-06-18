"use client";

import { useState } from "react";
import { joinCommunity } from "@/lib/supabase/community-actions";
import { useRouter } from "next/navigation";
import { FORM_SUBMIT_ERROR_MESSAGE } from "@/lib/site-config";

export function JoinCommunityPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  async function handleJoin() {
    setBusy(true);
    setError("");
    const result = await joinCommunity();
    setBusy(false);
    if (!result.ok) {
      setError(result.error || FORM_SUBMIT_ERROR_MESSAGE);
      return;
    }
    setJoined(true);
    router.refresh();
  }

  if (joined) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 ${compact ? "p-4" : "p-6"} text-sm text-emerald-800 font-semibold`}>
        Welcome to the community — you can now create posts.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gold/30 bg-gradient-to-br from-navy to-[#0a2247] ${compact ? "p-5" : "p-8"} text-white shadow-[var(--shadow-premium)]`}>
      <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
        Free forever
      </span>
      <h2 className={`${compact ? "text-lg" : "text-xl"} mt-3 font-extrabold`}>Join the travel community</h2>
      <p className="mt-2 text-sm text-white/70">
        Share stories, follow travelers, and connect with verified agents and hosts — no subscription required.
      </p>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={handleJoin}
        disabled={busy}
        className="btn-gold mt-5 px-6 py-2.5 text-sm disabled:opacity-60"
      >
        {busy ? "Joining…" : "Join community free"}
      </button>
    </div>
  );
}
