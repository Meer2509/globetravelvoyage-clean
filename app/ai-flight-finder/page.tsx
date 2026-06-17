"use client";

import { useState } from "react";
import Link from "next/link";
import { FlightOfferList } from "@/components/FlightOfferList";
import { searchFlightsClient } from "@/lib/flights/search-client";
import type { FlightCabinClass, FlightOffer } from "@/lib/flights/types";

const AIRPORTS = [
  "Dubai (DXB)", "Abu Dhabi (AUH)", "Karachi (KHI)", "Lahore (LHE)", "Islamabad (ISB)",
  "Riyadh (RUH)", "Doha (DOH)", "Muscat (MCT)", "London (LHR)", "New York (JFK)",
  "Toronto (YYZ)", "Manchester (MAN)", "Bangkok (BKK)", "Singapore (SIN)", "Manila (MNL)",
];

function mapCabin(cabin: string): FlightCabinClass {
  if (cabin === "premium") return "premium_economy";
  if (cabin === "business") return "business";
  if (cabin === "first") return "first";
  return "economy";
}

export default function AIFlightFinderPage() {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isReturn, setIsReturn] = useState(true);
  const [form, setForm] = useState({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    travelers: 1,
    cabin: "economy",
  });

  async function search() {
    setLoading(true);
    setHasSearched(true);
    setFallbackMessage(null);
    setFlights([]);
    try {
      const result = await searchFlightsClient({
        origin: form.from,
        destination: form.to,
        departureDate: form.departDate,
        returnDate: isReturn ? form.returnDate : undefined,
        passengers: form.travelers,
        cabinClass: mapCabin(form.cabin),
      });
      if (!result.ok) {
        setFallbackMessage(result.message);
      } else {
        setFlights(result.flights);
      }
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setHasSearched(false);
    setFlights([]);
    setFallbackMessage(null);
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/ai-travel-assistant" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← AI Travel Assistant
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl">✈️</span>
            <div>
              <span className="eyebrow-white mb-2">Live fares</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Flight Finder</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Enter your route, dates and cabin class. Compare live fares from airlines worldwide via Duffel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        {!hasSearched && !loading && (
          <div className="mx-auto max-w-3xl">
            <div className="card p-6 space-y-5">
              <div className="flex gap-1 rounded-xl bg-soft p-1 w-fit">
                {[["return", "↔ Return"], ["oneway", "→ One-way"]].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setIsReturn(key === "return")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      (key === "return") === isReturn
                        ? "bg-white text-navy shadow-[var(--shadow-card)]"
                        : "text-charcoal/50 hover:text-navy"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Flying from *</label>
                  <input className="input" list="airport-from" placeholder="e.g. Dubai (DXB)" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
                  <datalist id="airport-from">{AIRPORTS.map((a) => <option key={a} value={a} />)}</datalist>
                </div>
                <div>
                  <label className="label">Flying to *</label>
                  <input className="input" list="airport-to" placeholder="e.g. Karachi (KHI)" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
                  <datalist id="airport-to">{AIRPORTS.map((a) => <option key={a} value={a} />)}</datalist>
                </div>
                <div>
                  <label className="label">Departure date</label>
                  <input type="date" className="input" value={form.departDate} onChange={(e) => setForm((f) => ({ ...f, departDate: e.target.value }))} />
                </div>
                {isReturn && (
                  <div>
                    <label className="label">Return date</label>
                    <input type="date" className="input" value={form.returnDate} onChange={(e) => setForm((f) => ({ ...f, returnDate: e.target.value }))} />
                  </div>
                )}
                <div>
                  <label className="label">Passengers</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 font-bold hover:bg-soft">−</button>
                    <span className="w-8 text-center font-extrabold text-navy">{form.travelers}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, travelers: Math.min(9, f.travelers + 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 font-bold hover:bg-soft">+</button>
                    <span className="text-sm text-charcoal/50">passengers</span>
                  </div>
                </div>
                <div>
                  <label className="label">Cabin class</label>
                  <select className="input" value={form.cabin} onChange={(e) => setForm((f) => ({ ...f, cabin: e.target.value }))}>
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <button
                onClick={search}
                disabled={!form.from.trim() || !form.to.trim()}
                className="btn-gold w-full py-4 text-base font-extrabold disabled:opacity-50"
              >
                Search live flights →
              </button>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-bold text-navy">Popular routes</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { from: "Dubai (DXB)", to: "Karachi (KHI)", emoji: "🇵🇰" },
                  { from: "Karachi (KHI)", to: "New York (JFK)", emoji: "🇺🇸" },
                  { from: "Dubai (DXB)", to: "Manila (MNL)", emoji: "🇵🇭" },
                  { from: "Riyadh (RUH)", to: "Lahore (LHE)", emoji: "🇵🇰" },
                ].map((r) => (
                  <button
                    key={r.from + r.to}
                    onClick={() => setForm((f) => ({ ...f, from: r.from, to: r.to }))}
                    className="flex items-center gap-3 rounded-xl border border-soft-200 bg-white p-3 text-sm text-left hover:border-blue/30 hover:bg-blue/3 transition-all"
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <div>
                      <p className="font-semibold text-navy text-xs">{r.from} → {r.to}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(hasSearched || loading) && (
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="card bg-navy text-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">Live flight results</p>
                <h2 className="text-xl font-extrabold">
                  {form.from && form.to ? `${form.from} → ${form.to}` : "Flight search"}
                </h2>
              </div>
              {!loading && (
                <button onClick={reset} className="btn-outline-white text-xs py-2 px-4 shrink-0">
                  ← New search
                </button>
              )}
            </div>

            <FlightOfferList
              flights={flights}
              loading={loading}
              fallbackMessage={fallbackMessage}
            />

            {!loading && flights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link href="/booking/request" className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-gold/10 transition-colors">
                  ✈️ Request flight booking
                </Link>
                <Link href="/lead/contact" className="flex items-center gap-2 rounded-xl border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal/60 hover:border-blue/30 hover:text-navy transition-colors">
                  👔 Contact travel expert
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
