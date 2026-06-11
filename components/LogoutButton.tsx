"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth";

interface LogoutButtonProps {
  className?: string;
  label?: string;
  redirectTo?: string;
  onClick?: () => void;
}

export function LogoutButton({
  className,
  label = "Sign out",
  redirectTo = "/login",
  onClick,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    onClick?.();
    setLoading(true);
    await signOut(redirectTo);
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className ?? "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal/70 hover:bg-soft hover:text-navy transition-colors"}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin opacity-60" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          Signing out…
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
