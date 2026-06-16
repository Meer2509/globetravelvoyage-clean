"use client";

import { useState } from "react";
import Link from "next/link";
import { searchFlightsWithAi, AiUnavailableError } from "@/lib/ai-api";
import type { FlightInput, FlightResult, FlightOption } from "@/lib/ai-types";

function SaveFlightButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${saved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-soft-200 bg-white text-charcoal/60 hover:border-blue/30 hover:text-navy"}`}>
      {saved ? "✓ Search saved!" : "🔖 Save search"}
    </button>
  );
}

function SetPriceAlertButton() {
  const [set, setSetAlert] = useState(false);
  return (
    <button onClick={() => { setSetAlert(true); setTimeout(() => setSetAlert(false), 3000); }} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${set ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue/30 bg-blue/5 text-blue hover:bg-blue/10"}`}>
      {set ? "✓ Alert set!" : "🔔 Set price alert"}
    </button>
  );
}

const AIRPORTS = [
  "Dubai (DXB)", "Abu Dhabi (AUH)", "Karachi (KHI)", "Lahore (LHE)", "Islamabad (ISB)",
  "Riyadh (RUH)", "Doha (DOH)", "Muscat (MCT)", "London (LHR)", "New York (JFK)",
  "Toronto (YYZ)", "Manchester (MAN)", "Bangkok (BKK)", "Singapore (SIN)", "Manila (MNL)",
];

function FlightCard({ opt, isReturn }: { opt: FlightOption; isReturn?: boolean }) {
  const price = isReturn ? opt.priceReturn ?? opt.price : opt.price;
  return (
    <div className={`card card-hover p-4 ${opt.badge === "Cheapest" ? "ring-2 ring-emerald-400" : opt.badge === "Most popular" ? "ring-2 ring-blue" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {opt.badge && (
            <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              opt.badge === "Cheapest" ? "bg-emerald-50 text-emerald-700" :
              opt.badge === "Most popular" ? "bg-blue/10 text-blue" :
              opt.badge === "Premium" ? "bg-gold/10 text-gold" :
              opt.badge === "Only direct" ? "bg-navy/10 text-navy" :
              "bg-soft text-charcoal/50"
            }`}>
              {opt.badge}
            </span>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/8 text-sm font-bold text-navy">
              {opt.airline.slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-navy text-sm">{opt.airline}</p>
              <p className="text-[11px] text-charcoal/45">{opt.flightNumber}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-extrabold text-navy">{opt.departure}</p>
              <p className="text-[10px] text-charcoal/40">Depart</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-[10px] text-charcoal/40">{opt.duration}</p>
              <div className="flex w-full items-center gap-1">
                <div className="flex-1 h-px bg-soft-200" />
                {opt.stops > 0 ? (
                  <div className="flex h-2 w-2 shrink-0 rounded-full bg-gold" title={opt.stopCity} />
                ) : (
                  <div className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                )}
                <div className="flex-1 h-px bg-soft-200" />
              </div>
              <p className="text-[10px] text-charcoal/40">
                {opt.stops === 0 ? "Non-stop" : `${opt.stops} stop${opt.stops > 1 ? "s" : ""}${opt.stopCity ? ` via ${opt.stopCity}` : ""}`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-navy">{opt.arrival}</p>
              <p className="text-[10px] text-charcoal/40">Arrive</p>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-navy">${price}</p>
          <p className="text-[11px] text-charcoal/40">per person</p>
          <p className="mt-1 text-[10px]">
            {opt.baggageIncluded
              ? <span className="text-emerald-600 font-semibold">✓ Bag incl.</span>
              : <span className="text-charcoal/40">Bag extra</span>
            }
          </p>
          <button className="mt-2 rounded-lg bg-blue px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-light transition-colors">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIFlightFinderPage() {
  const [loading, setLoading]    = useState(false);
  const [result, setResult]      = useState<FlightResult | null>(null);
  const [error, setError]        = useState("");
  const [isReturn, setIsReturn]  = useState(true);
  const [sortBy, setSortBy]      = useState<"price" | "duration" | "stops">("price");
  const [form, setForm]          = useState<FlightInput>({
    from:          "",
    to:            "",
    departDate:    "",
    returnDate:    "",
    flexibleDates: true,
    travelers:     1,
    cabin:         "economy",
    budget:        1500,
  });

  async function search() {
    setLoading(true);
    setError("");
    try {
      const r = await searchFlightsWithAi(form);
      setResult(r);
    } catch (err) {
      setResult(null);
      setError(err instanceof AiUnavailableError ? err.message : err instanceof Error ? err.message : "Flight search failed.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
  }

  const sortedOptions = result
    ? [...result.options].sort((a, b) => {
        if (sortBy === "price") return (isReturn ? (a.priceReturn ?? a.price) : a.price) - (isReturn ? (b.priceReturn ?? b.price) : b.price);
        if (sortBy === "stops") return a.stops - b.stops;
        return a.duration.localeCompare(b.duration);
      })
    : [];

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/ai-travel-assistant" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← AI Travel Assistant
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl">✈️</span>
            <div>
              <span className="eyebrow-white mb-2">AI-powered</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">AI Flight Finder</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Enter your route, dates and budget. Get AI-curated flight suggestions with price trends, cheapest days and flexible date comparison.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        {!result && !loading && (
          <div className="mx-auto max-w-3xl">
            <div className="card p-6 space-y-5">
              {/* One-way / Return toggle */}
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
                <div className="sm:col-span-2">
                  <label className="label">Max budget per person: <strong className="text-navy">${form.budget.toLocaleString()}</strong></label>
                  <input type="range" min="100" max="5000" step="50" className="w-full accent-navy mt-2" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))} />
                  <div className="flex justify-between text-[10px] text-charcoal/40 mt-1"><span>$100</span><span>$1,000</span><span>$2,500</span><span>$5,000</span></div>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={form.flexibleDates} onChange={(e) => setForm((f) => ({ ...f, flexibleDates: e.target.checked }))} className="h-4 w-4 rounded accent-blue" />
                <span className="text-sm text-charcoal/70">Show flexible dates (±3 days) comparison</span>
              </label>

              <button
                onClick={search}
                disabled={!form.from.trim() || !form.to.trim()}
                className="btn-gold w-full py-4 text-base font-extrabold disabled:opacity-50"
              >
                🤖 Find me the best flights →
              </button>
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
            </div>

            {/* Popular routes */}
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

        {/* Loading */}
        {loading && (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue/8">
              <svg className="h-10 w-10 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-navy">Searching flights…</h2>
            <p className="mt-2 text-sm text-charcoal/40 animate-pulse">Comparing airlines, prices and schedules…</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mx-auto max-w-4xl space-y-5">
            {/* Route bar */}
            <div className="card bg-navy text-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">AI Flight Results</p>
                <h2 className="text-xl font-extrabold">{result.route}</h2>
                <p className="text-white/55 text-xs mt-1">{result.tip}</p>
              </div>
              <button onClick={reset} className="btn-outline-white text-xs py-2 px-4 shrink-0">
                ← New search
              </button>
            </div>

            {/* AI insights */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card p-4">
                <p className="text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Cheapest month</p>
                <p className="font-extrabold text-navy text-sm">{result.cheapestMonth}</p>
              </div>
              <div className="card p-4">
                <p className="text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Cheapest day to fly</p>
                <p className="font-extrabold text-navy text-sm">{result.cheapestDay}</p>
              </div>
              <div className="card p-4">
                <p className="text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Price trend</p>
                <p className="text-xs text-charcoal/60 leading-relaxed">{result.priceTrend}</p>
              </div>
            </div>

            {/* Flexible dates chart */}
            {form.flexibleDates && result.flexDates && (
              <div className="card p-5">
                <h3 className="mb-3 font-bold text-navy text-sm">Flexible date comparison (this week)</h3>
                <div className="flex items-end gap-1 h-20">
                  {result.flexDates.map((d) => {
                    const min = Math.min(...result.flexDates!.map((x) => x.price));
                    const max = Math.max(...result.flexDates!.map((x) => x.price));
                    const pct = ((d.price - min) / (max - min || 1)) * 60 + 20;
                    return (
                      <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-navy">${d.price}</span>
                        <div
                          className={`w-full rounded-t-sm ${d.price === min ? "bg-emerald-500" : "bg-blue/30"} transition-all`}
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[10px] text-charcoal/40">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-charcoal/35 text-center">Green = cheapest day · Prices per person one-way (estimated)</p>
              </div>
            )}

            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal/50">Sort by:</span>
              {(["price", "duration", "stops"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all capitalize ${
                    sortBy === opt ? "border-blue bg-blue text-white" : "border-soft-200 text-charcoal/50 hover:border-navy/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsReturn(!isReturn)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    isReturn ? "border-blue bg-blue/10 text-blue" : "border-soft-200 text-charcoal/50"
                  }`}
                >
                  {isReturn ? "↔ Return price" : "→ One-way price"}
                </button>
              </div>
            </div>

            {/* Flight cards */}
            <div className="space-y-3">
              {sortedOptions.map((opt, i) => (
                <FlightCard key={i} opt={opt} isReturn={isReturn} />
              ))}
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-2">
              <SaveFlightButton />
              <SetPriceAlertButton />
              <Link href="/booking/request" className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-gold/10 transition-colors">
                ✈️ Request flight booking
              </Link>
              <Link href="/lead/contact" className="flex items-center gap-2 rounded-xl border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-charcoal/60 hover:border-blue/30 hover:text-navy transition-colors">
                👔 Contact travel expert
              </Link>
            </div>

            <p className="text-[11px] text-charcoal/35 text-center leading-relaxed">
              ⚠ Prices shown are AI estimates for planning only. No actual booking is made. Always verify live fares on airline websites or authorised agents. Globe Travel Voyage is not an airline or travel booking platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
