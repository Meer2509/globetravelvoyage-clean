import type { TrustBadgeTier, VerificationLevel } from "@/lib/trust/types";

const TIER_STYLE: Record<TrustBadgeTier, string> = {
  none: "bg-soft text-charcoal/50",
  basic: "bg-soft text-charcoal/60",
  verified: "bg-blue/10 text-blue",
  premium: "bg-gold/15 text-gold",
  elite: "bg-emerald-50 text-emerald-700",
};

const TIER_LABEL: Record<TrustBadgeTier, string> = {
  none: "New provider",
  basic: "Basic",
  verified: "Verified",
  premium: "Premium Verified",
  elite: "Elite Trusted",
};

const LEVEL_LABEL: Record<VerificationLevel, string> = {
  basic: "Basic",
  verified: "Verified",
  premium_verified: "Premium Verified",
};

export function TrustScoreBadge({
  score,
  tier,
  className = "",
  showScore = true,
}: {
  score: number;
  tier: TrustBadgeTier;
  className?: string;
  showScore?: boolean;
}) {
  if (tier === "none" && score < 20) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLE[tier]} ${className}`}
      title={`Trust score: ${score}/100`}
    >
      <span aria-hidden>🛡️</span>
      {TIER_LABEL[tier]}
      {showScore && score > 0 && <span className="opacity-70">· {score}</span>}
    </span>
  );
}

export function VerificationLevelBadge({
  level,
  className = "",
}: {
  level: VerificationLevel;
  className?: string;
}) {
  const styles: Record<VerificationLevel, string> = {
    basic: "bg-soft text-charcoal/55",
    verified: "bg-blue/10 text-blue",
    premium_verified: "bg-gold/15 text-gold",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[level]} ${className}`}>
      ✓ {LEVEL_LABEL[level]}
    </span>
  );
}
