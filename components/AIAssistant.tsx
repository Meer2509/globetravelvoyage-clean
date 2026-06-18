"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { CONCIERGE_PATH } from "@/lib/v3/concierge-config";

const quickLinks = [
  { label: "Plan a trip", href: `${CONCIERGE_PATH}?topic=trip` },
  { label: "Visa checklist", href: `${CONCIERGE_PATH}?topic=visa` },
  { label: "Flight routes", href: `${CONCIERGE_PATH}?topic=flights` },
] as const;

export function AIAssistant() {
  const pathname = usePathname();
  if (pathname === CONCIERGE_PATH || pathname?.startsWith(`${CONCIERGE_PATH}/`)) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div className="hidden w-[min(92vw,300px)] rounded-2xl border border-soft-200 bg-white p-4 shadow-[var(--shadow-premium)] sm:block">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
            <Icon name="sparkles" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy">AI Travel Concierge</p>
            <p className="text-xs text-charcoal/50">One conversation for your trip</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-soft-200 bg-soft px-3 py-1 text-[11px] font-semibold text-charcoal/65 hover:border-blue/30 hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href={CONCIERGE_PATH}
        aria-label="Open AI Travel Concierge"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold shadow-[var(--shadow-premium)] transition-transform hover:scale-105"
      >
        <Icon name="sparkles" className="h-6 w-6" />
      </Link>
    </div>
  );
}
