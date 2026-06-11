"use client";

import { Icon } from "./Icon";
import { Stars } from "./Stars";
import { VerifiedBadge } from "./TrustBadge";
import { SaveButton } from "./SaveButton";

export function MarketplaceCard({
  id,
  initials,
  name,
  subtitle,
  rating,
  reviews,
  verified,
  verificationStatus,
  tags,
  meta,
  responseTime,
  ctaLabel = "Contact expert",
  onContact,
  onSave,
}: {
  id?: string;
  initials: string;
  name: string;
  subtitle: string;
  rating: number;
  reviews: number;
  verified?: boolean;
  verificationStatus?: "verified" | "pending" | "unverified";
  tags: string[];
  meta?: string;
  responseTime?: string;
  ctaLabel?: string;
  onContact?: () => void;
  onSave?: (saved: boolean) => void;
}) {
  const vstatus = verificationStatus ?? (verified ? "verified" : "unverified");

  return (
    <div className="card card-hover flex flex-col p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-lg font-bold text-gold">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="truncate text-base font-bold text-navy">{name}</h3>
            {vstatus === "verified" && <VerifiedBadge />}
            {vstatus === "pending" && (
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                Pending
              </span>
            )}
          </div>
          <p className="truncate text-sm text-navy/60">{subtitle}</p>
          <div className="mt-1">
            <Stars rating={rating} reviews={reviews} />
          </div>
        </div>
        {onSave && (
          <SaveButton id={id} onToggle={onSave} />
        )}
      </div>

      {responseTime && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-charcoal/55">Responds {responseTime}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      {meta && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-navy/55">
          <Icon name="check" className="h-4 w-4 text-blue" />
          {meta}
        </p>
      )}

      <button
        className="btn-outline mt-5 w-full py-2.5 text-sm"
        onClick={onContact}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
