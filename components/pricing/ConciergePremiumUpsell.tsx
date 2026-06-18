"use client";

import Link from "next/link";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { isStripeConfigured } from "@/lib/stripe";

export function ConciergePremiumUpsell() {
  if (!isStripeConfigured) return null;

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-navy to-[#0a2247] p-5 text-white shadow-[var(--shadow-premium)]">
      <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
        Premium
      </span>
      <h3 className="mt-3 text-base font-extrabold">Upgrade your concierge</h3>
      <p className="mt-2 text-xs leading-relaxed text-white/65">
        AI Concierge Plus — more saved trips, enhanced itineraries, and priority support.
      </p>
      <div className="mt-4 space-y-2">
        <StripeCheckoutButton
          productKey="ai_concierge_plus"
          label="AI Concierge Plus — $12/mo"
          className="btn-gold w-full py-2.5 text-xs"
          fullWidth
        />
        <StripeCheckoutButton
          productKey="premium_concierge_planning"
          label="Premium planning — $149"
          className="btn-outline w-full border-white/30 py-2.5 text-xs text-white hover:bg-white/10"
          fullWidth
        />
        <Link href="/pricing" className="block text-center text-xs font-semibold text-gold hover:underline">
          Compare all plans →
        </Link>
      </div>
    </div>
  );
}
