"use client";

import Link from "next/link";
import type { ConciergeAction } from "@/lib/v3/concierge-intent";

export function ConciergeActionButtons({
  actions,
  onHandoff,
}: {
  actions: ConciergeAction[];
  onHandoff: (action: ConciergeAction) => void;
}) {
  if (!actions.length) return null;

  return (
    <div className="mt-2 flex w-full flex-wrap gap-2">
      {actions.map((action) =>
        action.kind === "link" && action.href ? (
          <Link
            key={action.id}
            href={action.href}
            className={
              action.variant === "primary"
                ? "inline-flex min-h-[40px] items-center rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-800"
                : "inline-flex min-h-[40px] items-center rounded-xl border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:border-gold/40 hover:bg-gold/5"
            }
          >
            {action.label} →
          </Link>
        ) : (
          <button
            key={action.id}
            type="button"
            onClick={() => onHandoff(action)}
            className={
              action.variant === "primary"
                ? "inline-flex min-h-[40px] items-center rounded-xl bg-gold px-4 py-2 text-xs font-bold text-navy shadow-sm transition-colors hover:bg-gold-400"
                : "inline-flex min-h-[40px] items-center rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-gold/10"
            }
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
