type BadgeLevel = "new" | "reviewed" | "verified";

const BADGE_STYLES: Record<BadgeLevel, string> = {
  new: "bg-soft text-muted border-soft-200",
  reviewed: "bg-navy/8 text-navy border-navy/15",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const BADGE_LABELS: Record<BadgeLevel, string> = {
  new: "New Provider",
  reviewed: "Reviewed Provider",
  verified: "Verified Provider",
};

export function ProviderBadge({ level }: { level: BadgeLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[level]}`}>
      {BADGE_LABELS[level]}
    </span>
  );
}

export function providerBadgeFromStatus(
  verificationStatus?: string | null,
  isAdminApproved?: boolean
): BadgeLevel {
  if (isAdminApproved || verificationStatus === "verified" || verificationStatus === "approved") {
    return "verified";
  }
  if (verificationStatus === "under_review" || verificationStatus === "reviewed") {
    return "reviewed";
  }
  return "new";
}
