"use client";

import { useState } from "react";
import Link from "next/link";
import { type TripInput, type TripResult } from "@/lib/ai-types";
import { generateTripPlanWithAi, AiUnavailableError } from "@/lib/ai-api";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";

function DownloadItineraryButton({ destination, totalDays }: { destination: string; totalDays: number }) {
  const [done, setDone] = useState(false);
  function download() {
    const lines = [
      `Globe Travel Voyage — ${totalDays}-Day ${destination} Itinerary`,
      "",
      `Day-by-day outline for ${destination} (${totalDays} days).`,
      "",
      "Day 1: Arrival & city exploration",
      "Day 2: Main attractions",
      "Day 3: Cultural immersion",
      "...",
      "",
      "Disclaimer: For guidance only. Prices and availability are not guaranteed.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = `${destination.toLowerCase().replace(/\s/g, "-")}-itinerary.txt`; a.click();
    URL.revokeObjectURL(url);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }
  return (
    <button onClick={download} className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all ${done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-soft-200 bg-white text-charcoal/60 hover:border-blue/30 hover:text-navy"}`}>
      {done ? "✓ Downloaded!" : "📥 Download itinerary"}
    </button>
  );
}

const INTERESTS = ["History & Culture", "Adventure", "Food & Cuisine", "Nightlife", "Shopping", "Nature & Hiking", "Beaches", "Art & Museums", "Family Activities", "Wellness & Spa"];

const DESTINATIONS = ["Dubai, UAE", "Istanbul, Turkey", "Bangkok, Thailand", "Maldives", "Tokyo, Japan", "Paris, France", "London, UK", "New York, USA", "Bali, Indonesia", "Rome, Italy"];

export default function AITripPlannerPage() {
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<TripResult | null>(null);
  const [error, setError]         = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [form, setForm]           = useState<TripInput>({
    destination:     "",
    days:            5,
    budget:          2000,
    currency:        "USD",
    travelers:       2,
    travelStyle:     "moderate",
    accommodation:   "hotel",
    interests:       [],
    includeFlights:  true,
    includeVisa:     true,
  });

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  async function generatePlan() {
    setLoading(true);
    setError("");
    try {
      const r = await generateTripPlanWithAi(form);
      setResult(r);
      setActiveDay(0);
    } catch (err) {
      setResult(null);
      setError(err instanceof AiUnavailableError ? err.message : err instanceof Error ? err.message : "Trip planning failed.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setForm({ destination: "", days: 5, budget: 2000, currency: "USD", travelers: 2, travelStyle: "moderate", accommodation: "hotel", interests: [], includeFlights: true, includeVisa: true });
  }

  return (
    <div className="min-h-screen bg-soft">
      {/* Header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/ai-travel-assistant" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← AI Travel Assistant
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl">🗺️</span>
            <div>
              <span className="eyebrow-white mb-2">AI-powered</span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">AI Trip Planner</h1>
              <p className="mt-2 text-white/60 text-sm max-w-xl">
                Enter your budget, days and preferences. Get a full day-by-day itinerary with hotel picks, tours, food, budget breakdown and travel tips.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        {!result && !loading && (
          <div className="mx-auto max-w-3xl space-y-5">
            {/* Destination & basics */}
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold text-navy">Trip basics</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Where would you like to go? *</label>
                  <input
                    className="input"
                    list="dest-list"
                    placeholder="e.g. Dubai, Istanbul, Tokyo, Thailand…"
                    value={form.destination}
                    onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  />
                  <datalist id="dest-list">
                    {DESTINATIONS.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Number of days</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, days: Math.max(1, f.days - 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 text-navy font-bold hover:bg-soft transition-colors">−</button>
                    <span className="w-8 text-center font-extrabold text-navy text-lg">{form.days}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, days: Math.min(30, f.days + 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 text-navy font-bold hover:bg-soft transition-colors">+</button>
                    <span className="text-sm text-charcoal/50">days</span>
                  </div>
                </div>
                <div>
                  <label className="label">Number of travelers</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 text-navy font-bold hover:bg-soft transition-colors">−</button>
                    <span className="w-8 text-center font-extrabold text-navy text-lg">{form.travelers}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, travelers: Math.min(20, f.travelers + 1) }))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft-200 text-navy font-bold hover:bg-soft transition-colors">+</button>
                    <span className="text-sm text-charcoal/50">people</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold text-navy">Budget</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label">Total trip budget: <strong className="text-navy">${form.budget.toLocaleString()} {form.currency}</strong></label>
                  <input
                    type="range"
                    min="500" max="20000" step="100"
                    className="w-full accent-navy mt-2"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
                  />
                  <div className="flex justify-between text-[10px] text-charcoal/40 mt-1">
                    <span>$500</span><span>$5,000</span><span>$10,000</span><span>$20,000</span>
                  </div>
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                    <option>USD</option><option>EUR</option><option>GBP</option><option>AED</option><option>SAR</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors">
                  <input type="checkbox" checked={form.includeFlights} onChange={(e) => setForm((f) => ({ ...f, includeFlights: e.target.checked }))} className="h-4 w-4 rounded accent-blue" />
                  <span className="text-sm text-charcoal/70">Include flights in budget</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-soft-200 bg-soft/50 p-3 hover:bg-soft transition-colors">
                  <input type="checkbox" checked={form.includeVisa} onChange={(e) => setForm((f) => ({ ...f, includeVisa: e.target.checked }))} className="h-4 w-4 rounded accent-blue" />
                  <span className="text-sm text-charcoal/70">Include visa fees in budget</span>
                </label>
              </div>
            </div>

            {/* Style */}
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold text-navy">Travel style & accommodation</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Travel style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["budget", "moderate", "luxury"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, travelStyle: style }))}
                        className={`rounded-xl border py-2.5 text-xs font-bold capitalize transition-all ${
                          form.travelStyle === style
                            ? "border-blue bg-blue text-white shadow-[var(--shadow-glow)]"
                            : "border-soft-200 bg-soft/50 text-charcoal/60 hover:border-navy/30"
                        }`}
                      >
                        {style === "budget" ? "🎒 Budget" : style === "moderate" ? "✈️ Moderate" : "💎 Luxury"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Accommodation type</label>
                  <select className="input" value={form.accommodation} onChange={(e) => setForm((f) => ({ ...f, accommodation: e.target.value }))}>
                    <option value="hostel">Hostel / budget stay</option>
                    <option value="hotel">Hotel (3–4 star)</option>
                    <option value="boutique">Boutique hotel</option>
                    <option value="luxury">Luxury hotel (5 star)</option>
                    <option value="apartment">Apartment / Airbnb</option>
                    <option value="resort">Beach or desert resort</option>
                  </select>
                </div>
              </div>

              {/* Group type */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[["solo", "🧳 Solo"], ["couple", "💑 Couple"], ["family", "👨‍👩‍👧 Family"], ["group", "👥 Group"]].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    className="rounded-xl border border-soft-200 bg-soft/50 px-3 py-2.5 text-xs font-semibold text-charcoal/60 hover:border-navy/30 hover:text-navy transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold text-navy">Interests (optional)</h2>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      form.interests.includes(interest)
                        ? "border-blue bg-blue text-white"
                        : "border-soft-200 bg-soft text-charcoal/60 hover:border-navy/30"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={!form.destination.trim()}
              className="btn-gold w-full py-4 text-base font-extrabold disabled:opacity-50"
            >
              🤖 Generate my AI trip plan →
            </button>
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mx-auto max-w-lg py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue/8">
              <svg className="h-10 w-10 animate-spin text-blue" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-navy">Planning your perfect trip…</h2>
            <div className="mx-auto mt-4 max-w-xs space-y-2">
              {[`Researching ${form.destination}…`, "Building day-by-day itinerary…", "Selecting hotels for your style…", "Finding tours and activities…", "Calculating budget breakdown…"].map((s, i) => (
                <p key={i} className="text-sm text-charcoal/45 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{s}</p>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Summary bar */}
            <div className="card bg-navy text-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">AI Trip Plan</p>
                  <h2 className="mt-1 text-2xl font-extrabold">{result.destination}</h2>
                  <p className="mt-1 text-white/60 text-sm">{result.summary}</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-gold">{result.totalDays}</p>
                    <p className="text-xs text-white/50">Days</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-extrabold text-gold">{result.hotels.length}</p>
                    <p className="text-xs text-white/50">Hotels</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-extrabold text-gold">{result.tours.length}</p>
                    <p className="text-xs text-white/50">Tours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* Left: itinerary */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-navy text-lg">Day-by-day itinerary</h3>

                {/* Day tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {result.itinerary.map((day, i) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(i)}
                      className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        activeDay === i ? "bg-navy text-white shadow-[var(--shadow-card)]" : "bg-white border border-soft-200 text-charcoal/50 hover:text-navy"
                      }`}
                    >
                      Day {day.day}
                    </button>
                  ))}
                </div>

                {result.itinerary[activeDay] && (
                  <div className="card p-5 space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-charcoal/35">Day {result.itinerary[activeDay].day}</span>
                      <h4 className="text-lg font-extrabold text-navy">{result.itinerary[activeDay].title}</h4>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/40">Activities</p>
                      <div className="space-y-2">
                        {result.itinerary[activeDay].activities.map((act, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-lg bg-soft/60 p-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue text-white text-[10px] font-bold">{i + 1}</span>
                            <span className="text-sm text-charcoal/70">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/40">Meals</p>
                      <div className="space-y-1.5">
                        {result.itinerary[activeDay].meals.map((meal, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-charcoal/60">
                            <span>🍽️</span> {meal}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 flex items-start gap-2">
                      <span className="text-gold text-base">💡</span>
                      <p className="text-xs text-charcoal/65">{result.itinerary[activeDay].tip}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: budget + hotels */}
              <div className="space-y-4">
                {/* Budget breakdown */}
                <div className="card p-5">
                  <h3 className="mb-4 font-extrabold text-navy text-sm">Budget breakdown</h3>
                  <div className="space-y-3">
                    {result.budgetBreakdown.map((b) => (
                      <div key={b.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-charcoal/60">{b.emoji} {b.label}</span>
                          <span className="text-xs font-bold text-navy">${b.amount.toLocaleString()} <span className="text-charcoal/35 font-normal">({b.percent}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-soft-200">
                          <div className="h-1.5 rounded-full bg-blue transition-all" style={{ width: `${b.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotels */}
                <div className="card p-5">
                  <h3 className="mb-3 font-extrabold text-navy text-sm">Recommended hotels</h3>
                  <div className="space-y-3">
                    {result.hotels.map((h) => (
                      <div key={h.name} className="rounded-xl border border-soft-200 bg-soft/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-navy text-sm">{h.name}</p>
                            <p className="text-[11px] text-charcoal/45">{h.area} · {"★".repeat(h.stars)}</p>
                          </div>
                          <span className="text-xs font-bold text-blue shrink-0">{h.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tours */}
                <div className="card p-5">
                  <h3 className="mb-3 font-extrabold text-navy text-sm">Recommended tours</h3>
                  <div className="space-y-2">
                    {result.tours.map((t) => (
                      <div key={t.name} className="flex items-center justify-between py-2 border-b border-soft-200 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-navy">{t.name}</p>
                          <p className="text-[11px] text-charcoal/45">{t.duration}</p>
                        </div>
                        <span className="text-xs font-bold text-blue">{t.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="card p-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-charcoal/60">
                    <span>✈️</span><p><strong>Flights:</strong> {result.flightTip}</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-charcoal/60">
                    <span>🛂</span><p><strong>Visa:</strong> {result.visaNote}</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-charcoal/60">
                    <span>🌤️</span><p><strong>Best season:</strong> {result.bestSeason}</p>
                  </div>
                </div>

                {/* Hidden gems */}
                {result.hiddenGems.length > 0 && (
                  <div className="card p-5">
                    <h3 className="mb-3 font-extrabold text-navy text-sm">🗝️ Hidden gems</h3>
                    <ul className="space-y-1.5">
                      {result.hiddenGems.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-charcoal/65">
                          <span className="text-gold">✦</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <StripeCheckoutButton
                productKey="premium_ai_trip_plan"
                checkoutMeta={{ listingTitle: result.destination }}
                label="Upgrade to Premium"
                className="btn-outline py-3 px-6 text-sm"
              />
              <Link href="/agents" className="btn-outline py-3 px-6 text-sm">Book a tour guide</Link>
              <Link href="/ai-visa-assistant" className="btn-outline py-3 px-6 text-sm">Check visa requirements</Link>
              <Link href="/ai-flight-finder" className="btn-outline py-3 px-6 text-sm">Find flights</Link>
              <DownloadItineraryButton destination={result.destination} totalDays={result.totalDays} />
              <Link href="/booking/request" className="flex items-center gap-2 rounded-2xl border border-blue/30 bg-blue/5 px-5 py-3 text-sm font-semibold text-navy hover:bg-blue/10 transition-colors">
                Request a custom quote
              </Link>
              <button onClick={reset} className="btn-ghost py-3 px-6 text-sm text-charcoal/50">← Plan another trip</button>
            </div>

            <p className="text-[11px] text-charcoal/35 leading-relaxed">
              ⚠ AI trip plans are estimates for planning purposes. Prices, availability and itinerary suggestions may change. Not financial advice. Always verify costs and bookings independently.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
