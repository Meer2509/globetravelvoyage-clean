"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleSavedItem } from "@/lib/supabase/saved-actions";

interface SaveButtonProps {
  id?: string;
  itemType?: string;
  title?: string;
  className?: string;
  onToggle?: (saved: boolean, id?: string) => void;
  defaultSaved?: boolean;
  label?: boolean;
}

export function SaveButton({
  id,
  itemType = "listing",
  title,
  className = "",
  onToggle,
  defaultSaved = false,
  label = false,
}: SaveButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(defaultSaved);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState("");

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    const next = !saved;
    setError("");

    const result = await toggleSavedItem({
      itemType,
      itemId: id,
      title,
      saved: next,
    });

    if (!result.ok) {
      if (result.error.includes("Sign in")) {
        router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/saved")}`);
        return;
      }
      setError(result.error);
      return;
    }

    setSaved(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    onToggle?.(next, id);
  }

  return (
    <button
      onClick={toggle}
      title={error || (saved ? "Remove from saved" : "Save")}
      className={`flex items-center gap-1 rounded-lg p-1.5 transition-all ${
        saved ? "text-red-500 hover:text-red-400" : "text-charcoal/40 hover:text-red-400"
      } ${flash ? "scale-125" : "scale-100"} ${className}`}
      aria-label={saved ? "Unsave" : "Save"}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {label && <span className="text-xs font-semibold">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
