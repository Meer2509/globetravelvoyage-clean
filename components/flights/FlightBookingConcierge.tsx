"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { submitFlightBookingRequest } from "@/lib/supabase/actions";
import {
  extractOfferId,
  formatFlightPrice,
  type FlightBookingParams,
} from "@/lib/flights/booking-params";
import { SITE_CONFIG, FORM_SUBMIT_ERROR_MESSAGE, supportMailto } from "@/lib/site-config";

const TRUST_ITEMS = [
  { icon: "🔒", title: "Secure request", text: "Your details are handled confidentially by our booking team." },
  { icon: "✓", title: "Fare reviewed before ticketing", text: "A specialist verifies the live fare before any ticket is issued." },
  { icon: "🛂", title: "Passport-name accuracy", text: "Enter your name exactly as it appears on your passport." },
  { icon: "💳", title: "No payment until confirmation", text: "We do not charge your card until you approve the final fare." },
];

const CABIN_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const FLIGHT_SUCCESS_MESSAGE =
  "Thank you. Your flight request has been received. A Globe Travel Voyage specialist will review the fare and contact you shortly before ticketing.";

const FLIGHT_ERROR_MESSAGE = FORM_SUBMIT_ERROR_MESSAGE;

function normalizeCabin(raw?: string): string {
  if (!raw) return "economy";
  return raw.replace(/\s+/g, "_").toLowerCase();
}

export function FlightBookingConcierge({ flight }: { flight: FlightBookingParams }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const airline = flight.airline ?? flight.subject?.split(" ")[0] ?? "Selected flight";
  const route =
    flight.from && flight.to
      ? `${flight.from} → ${flight.to}`
      : flight.subject ?? "Your selected route";
  const formattedPrice = formatFlightPrice(flight.price, flight.currency);
  const offerId = extractOfferId(flight.details, flight.offerId);
  const defaultPassengers = Math.min(9, Math.max(1, parseInt(flight.passengers ?? "1", 10) || 1));

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    passengerCount: defaultPassengers,
    cabinClass: normalizeCabin(flight.cabin),
    message: "",
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowError(false);
    setLoading(true);

    const result = await submitFlightBookingRequest({
      subject: flight.subject ?? `${airline} ${route}`,
      fromLocation: flight.from ?? "",
      toLocation: flight.to ?? "",
      details: [
        flight.details,
        offerId ? `Duffel offer ${offerId}` : "",
        formattedPrice ? `Quoted fare: ${formattedPrice}` : "",
        flight.depart && flight.arrive ? `Schedule: ${flight.depart} – ${flight.arrive}` : "",
        flight.duration ? `Duration: ${flight.duration}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      passengerCount: form.passengerCount,
      travelDate: flight.travelDate,
      returnDate: flight.returnDate,
      cabinClass: form.cabinClass,
      message: form.message.trim() || undefined,
      airline,
      price: flight.price,
      currency: flight.currency,
      offerId,
    });

    setLoading(false);

    if (!result.ok) {
      setShowError(true);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card overflow-hidden text-center shadow-[var(--shadow-premium)]">
          <div className="bg-gradient-to-br from-navy to-navy-deep px-6 py-10 text-white">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
              ✓
            </span>
            <h2 className="text-2xl font-extrabold">Request received</h2>
          </div>
          <div className="space-y-4 p-6 sm:p-8">
            <p className="text-sm leading-relaxed text-charcoal/70">{FLIGHT_SUCCESS_MESSAGE}</p>
            <Link href="/flights" className="btn-primary inline-flex px-6 py-3 text-sm">
              Search more flights
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card overflow-hidden border-gold/20 shadow-[var(--shadow-premium)]">
        <div className="border-b border-soft-200 bg-gradient-to-r from-navy/[0.04] to-gold/[0.08] px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/45">Your selected flight</p>
          <h2 className="mt-1 text-xl font-extrabold text-navy sm:text-2xl">{airline}</h2>
          <p className="mt-1 text-sm text-charcoal/55">{route}</p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {formattedPrice && (
            <div className="rounded-xl bg-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">Quoted fare</p>
              <p className="mt-1 text-2xl font-extrabold text-navy">{formattedPrice}</p>
              {flight.currency && (
                <p className="text-xs text-charcoal/45">{flight.currency} · total quote</p>
              )}
            </div>
          )}

          <div className="rounded-xl bg-soft/60 p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">Travel details</p>
            {flight.depart && flight.arrive && (
              <p className="text-navy">
                <span className="font-semibold">{flight.depart}</span>
                <span className="text-charcoal/40"> → </span>
                <span className="font-semibold">{flight.arrive}</span>
                {flight.duration && <span className="text-charcoal/45"> · {flight.duration}</span>}
              </p>
            )}
            {flight.travelDate && (
              <p className="text-charcoal/60">Depart: {flight.travelDate}</p>
            )}
            {flight.returnDate && (
              <p className="text-charcoal/60">Return: {flight.returnDate}</p>
            )}
            {flight.stops != null && (
              <p className="text-charcoal/60">
                {Number(flight.stops) === 0 ? "Direct flight" : `${flight.stops} stop(s)`}
              </p>
            )}
            {offerId && (
              <p className="text-xs text-charcoal/45 font-mono">Duffel offer: {offerId}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-xl border border-soft-200 bg-white p-4">
            <span className="text-xl shrink-0" aria-hidden>{item.icon}</span>
            <div>
              <p className="text-sm font-bold text-navy">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-charcoal/55">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-8 shadow-[var(--shadow-card)]">
        <div>
          <h3 className="text-lg font-extrabold text-navy">Passenger & contact details</h3>
          <p className="mt-1 text-sm text-charcoal/50">
            Complete the form below. Our concierge team will review your fare and reach out before ticketing.
          </p>
        </div>

        <div>
          <label className="label">Full legal name (as on passport) *</label>
          <input
            className="input"
            value={form.customerName}
            onChange={(e) => setField("customerName", e.target.value)}
            placeholder="e.g. Ahmed Khan"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email *</label>
            <input
              className="input"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setField("customerEmail", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Phone / WhatsApp *</label>
            <input
              className="input"
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setField("customerPhone", e.target.value)}
              placeholder="+971 50 000 0000"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Number of passengers *</label>
            <select
              className="input select"
              value={form.passengerCount}
              onChange={(e) => setField("passengerCount", Number(e.target.value))}
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "passenger" : "passengers"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Preferred cabin *</label>
            <select
              className="input select"
              value={form.cabinClass}
              onChange={(e) => setField("cabinClass", e.target.value)}
            >
              {CABIN_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Special notes</label>
          <textarea
            className="input min-h-28"
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
            placeholder="Seat preferences, meal requests, visa nationality, loyalty numbers…"
          />
        </div>

        {showError && (
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-navy">
            {FLIGHT_ERROR_MESSAGE}{" "}
            <a href={supportMailto} className="font-semibold text-blue hover:underline">
              {SITE_CONFIG.supportEmail}
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex w-full items-center justify-center gap-2 py-4 text-base font-extrabold disabled:opacity-60"
        >
          <Icon name="sparkles" className="h-5 w-5" />
          {loading ? "Submitting your request…" : "Submit flight request"}
        </button>

        <p className="text-center text-xs leading-relaxed text-charcoal/45">
          By submitting, you agree that fares are subject to verification. No payment is taken until you confirm with our team.
        </p>
      </form>
    </div>
  );
}
