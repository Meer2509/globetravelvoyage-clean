import { TIER_LABELS, TIER_STYLES, type ServiceTier } from "@/lib/launch-pricing";

export function TierBadge({ tier, className = "" }: { tier: ServiceTier; className?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIER_STYLES[tier]} ${className}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
