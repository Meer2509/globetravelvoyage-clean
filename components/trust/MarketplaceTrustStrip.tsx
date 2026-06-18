import Link from "next/link";
import { SITE_CONFIG, supportMailto } from "@/lib/site-config";

export function MarketplaceTrustStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-soft-200 bg-gradient-to-r from-navy/[0.03] to-gold/[0.06] px-5 py-4 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-charcoal/70">
          <span className="inline-flex items-center gap-1.5 text-blue">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue/10 text-[10px]">✓</span>
            Verified providers
          </span>
          <span className="inline-flex items-center gap-1.5 text-gold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-[10px]">★</span>
            Reviewed by Globe Travel Voyage
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy/8 text-[10px]">🔒</span>
            Secure requests — no payment until confirmed
          </span>
        </div>
        <Link
          href={supportMailto}
          className="shrink-0 text-xs font-semibold text-navy hover:text-blue transition-colors"
        >
          {SITE_CONFIG.supportEmail}
        </Link>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-charcoal/45">
        Globe Travel Voyage is an independent marketplace — not a government agency. Visa decisions are made by embassies only.
        Prices on browse pages require provider confirmation before booking.
      </p>
    </div>
  );
}
