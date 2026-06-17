"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { FlightOffer } from "@/lib/flights/types";

export const LIVE_DUFFEL_BADGE = "Live flight results powered by Duffel.";

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(0)}`;
  }
}

export function FlightOfferList({
  flights,
  loading,
  fallbackMessage,
  compact = false,
  searched = false,
}: {
  flights: FlightOffer[];
  loading?: boolean;
  fallbackMessage?: string | null;
  compact?: boolean;
  searched?: boolean;
}) {
  if (loading) {
    return (
      <div className={`rounded-xl border border-soft-200 bg-soft/40 text-center ${compact ? "p-6" : "py-16"}`}>
        <svg className="mx-auto h-8 w-8 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
        <p className="mt-3 text-sm text-charcoal/55">Searching live flight offers…</p>
      </div>
    );
  }

  if (fallbackMessage) {
    return (
      <div className="rounded-xl border border-gold/25 bg-gold/5 px-5 py-4 text-sm text-navy">
        {fallbackMessage}
      </div>
    );
  }

  if (flights.length === 0) {
    if (searched) {
      return (
        <div className={`rounded-xl border-2 border-dashed border-soft-200 text-center ${compact ? "p-6" : "py-16"}`}>
          <span className="text-4xl mb-3 block">✈️</span>
          <p className="font-semibold text-navy">No flights match your search</p>
          <p className="mt-1 text-sm text-charcoal/45">Try different airports, dates, or filters.</p>
        </div>
      );
    }
    return (
      <div className={`rounded-xl border-2 border-dashed border-soft-200 text-center ${compact ? "p-6" : "py-16"}`}>
        <span className="text-4xl mb-3 block">✈️</span>
        <p className="font-semibold text-navy">Search for flights</p>
        <p className="mt-1 text-sm text-charcoal/45">
          Enter origin, destination, and departure date for live quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          {LIVE_DUFFEL_BADGE}
        </span>
      </div>
      {flights.map((f) => (
        <div
          key={f.id}
          className={`card flex flex-col gap-4 hover:shadow-[var(--shadow-premium)] transition-shadow ${
            compact ? "p-4" : "p-5 sm:flex-row sm:items-center sm:justify-between"
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
              <Icon name="flight" className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-navy">{f.airline}</p>
              <p className="text-xs text-charcoal/50 mt-0.5">
                {f.origin} → {f.destination}
                {f.stops === 0 ? " · Direct" : ` · ${f.stops} stop${f.stops > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-navy">{f.departureTime}</p>
              <p className="text-xs text-navy/50">Depart</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-navy/45">{f.duration}</p>
              <div className="relative my-1 flex items-center">
                <div className="h-px w-16 bg-soft-200" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-navy">{f.arrivalTime}</p>
              <p className="text-xs text-navy/50">Arrive</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            <div className="text-right">
              <p className="text-xl font-extrabold text-navy">{formatPrice(f.price, f.currency)}</p>
              <p className="text-[11px] text-charcoal/40">total quote</p>
            </div>
            <Link href={f.bookingLink} className="btn-blue px-5 py-2 text-sm shrink-0">
              Request booking
            </Link>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-charcoal/40 text-center">
        Live fares via Duffel. Final price confirmed at booking.
      </p>
    </div>
  );
}
