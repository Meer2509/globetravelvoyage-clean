import { Icon } from "./Icon";
import { Stars } from "./Stars";
import { VerifiedBadge } from "./TrustBadge";

export function MarketplaceCard({
  initials,
  name,
  subtitle,
  rating,
  reviews,
  verified,
  tags,
  meta,
  ctaLabel = "View profile",
}: {
  initials: string;
  name: string;
  subtitle: string;
  rating: number;
  reviews: number;
  verified?: boolean;
  tags: string[];
  meta?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="card card-hover flex flex-col p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-lg font-bold text-gold">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-navy">{name}</h3>
            {verified && <VerifiedBadge />}
          </div>
          <p className="truncate text-sm text-navy/60">{subtitle}</p>
          <div className="mt-1">
            <Stars rating={rating} reviews={reviews} />
          </div>
        </div>
      </div>

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

      <button className="btn-outline mt-5 w-full py-2.5 text-sm">{ctaLabel}</button>
    </div>
  );
}
