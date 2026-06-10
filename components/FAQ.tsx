"use client";

import { useState } from "react";
import type { Faq } from "@/lib/data";

export function FAQ({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-soft-200 overflow-hidden rounded-2xl border border-soft-200 bg-white">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-navy sm:text-base">
              {item.q}
            </span>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-soft-200 text-navy transition-transform ${
                open === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-sm leading-relaxed text-navy/65">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
