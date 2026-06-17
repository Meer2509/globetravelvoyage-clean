"use client";

import { Stars } from "./Stars";
import { QUOTE_BADGE_LABEL } from "@/lib/launch-trust";
import { PriceEstimateLabel } from "./PriceEstimateLabel";
import { SaveButton } from "./SaveButton";

export interface ListingItem {
  id: string;
  emoji?: string;
  title: string;
  subtitle?: string;
  price?: string;
  priceNote?: string;
  priceFootnote?: string;
  hidePriceEstimate?: boolean;
  badge?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  meta?: { label: string; value: string }[];
  ctaLabel?: string;
}

function ListingCard({
  item,
  onCta,
  onSave,
}: {
  item: ListingItem;
  onCta?: (id: string) => void;
  onSave?: (saved: boolean, id: string) => void;
}) {
  return (
    <div className="card card-hover flex flex-col overflow-hidden">
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
        <span>{item.emoji ?? "🌍"}</span>
        <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-navy">
          {item.badge ?? QUOTE_BADGE_LABEL}
        </span>
        {onSave && (
          <div className="absolute right-2 top-2">
            <SaveButton
              id={item.id}
              onToggle={(saved) => onSave(saved, item.id)}
              className="rounded-lg bg-white/80 shadow-sm p-1.5"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-navy">{item.title}</h3>
            {item.subtitle && (
              <p className="mt-0.5 text-sm text-navy/55">{item.subtitle}</p>
            )}
          </div>
          {item.rating !== undefined && (
            <Stars rating={item.rating} reviews={item.reviews} />
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}

        {item.meta && item.meta.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {item.meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs text-navy/45">{m.label}</dt>
                <dd className="font-semibold text-navy">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-5 flex items-end justify-between border-t border-soft-200 pt-4">
          <div>
            {item.price && (
              <>
                <p className="text-lg font-extrabold text-navy">{item.price}</p>
                {!item.hidePriceEstimate &&
                  (item.priceFootnote ? (
                    <p className="text-[10px] leading-snug text-charcoal/45">{item.priceFootnote}</p>
                  ) : (
                    <PriceEstimateLabel />
                  ))}
              </>
            )}
            {item.priceNote && (
              <p className="text-xs text-navy/45 mt-1">{item.priceNote}</p>
            )}
          </div>
          <button
            className="btn-blue px-4 py-2 text-sm"
            onClick={() => onCta?.(item.id)}
          >
            {item.ctaLabel ?? "View"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ListingGrid({
  items,
  columns = 3,
  onCta,
  onSave,
}: {
  items: ListingItem[];
  columns?: 2 | 3 | 4;
  onCta?: (id: string) => void;
  onSave?: (saved: boolean, id: string) => void;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
        <span className="text-4xl mb-3">🔍</span>
        <p className="font-semibold text-navy">No results found</p>
        <p className="mt-1 text-sm text-charcoal/45">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-5 ${cols}`}>
      {items.map((item) => (
        <ListingCard key={item.id} item={item} onCta={onCta} onSave={onSave} />
      ))}
    </div>
  );
}
