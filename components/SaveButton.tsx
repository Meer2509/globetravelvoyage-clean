"use client";

import { useState } from "react";

interface SaveButtonProps {
  id?: string;
  className?: string;
  onToggle?: (saved: boolean, id?: string) => void;
  defaultSaved?: boolean;
  label?: boolean;
}

export function SaveButton({ id, className = "", onToggle, defaultSaved = false, label = false }: SaveButtonProps) {
  const [saved, setSaved] = useState(defaultSaved);
  const [flash, setFlash] = useState(false);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    onToggle?.(next, id);
  }

  return (
    <button
      onClick={toggle}
      title={saved ? "Remove from saved" : "Save"}
      className={`flex items-center gap-1 rounded-lg p-1.5 transition-all ${
        saved
          ? "text-red-500 hover:text-red-400"
          : "text-charcoal/30 hover:text-red-400"
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
