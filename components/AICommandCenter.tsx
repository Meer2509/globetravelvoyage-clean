"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { generateTripPlanWithAi, mapTravelStyleLabel, AiUnavailableError } from "@/lib/ai-api";
import type { TripResult } from "@/lib/ai-types";

export function AICommandCenter() {
  const [destination, setDestination] = useState("Dubai");
  const [days, setDays] = useState("5");
  const [budget, setBudget] = useState("2000");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState("Balanced");
  const [plan, setPlan] = useState<TripResult | null>(null);
  const [planMeta, setPlanMeta] = useState<{ style: string; totalBudget: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate(overrides?: {
    destination?: string;
    days?: string;
    budget?: string;
    travelers?: string;
  }) {
    const dest = (overrides?.destination ?? destination).trim();
    if (!dest) return;

    const dayCount = parseInt(overrides?.days ?? days) || 5;
    const totalBudget = parseInt(overrides?.budget ?? budget) || 2000;
    const travelerCount = parseInt(overrides?.travelers ?? travelers) || 2;

    setLoading(true);
    setPlan(null);
    setError("");

    try {
      const result = await generateTripPlanWithAi({
        destination: dest,
        days: dayCount,
        budget: totalBudget,
        currency: "USD",
        travelers: travelerCount,
        travelStyle: mapTravelStyleLabel(style),
        accommodation: "hotel",
        interests: [],
        includeFlights: true,
        includeVisa: true,
      });
      setPlan(result);
      setPlanMeta({ style, totalBudget });
    } catch (err) {
      setPlan(null);
      setError(
        err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not generate a travel plan."
      );
    } finally {
      setLoading(false);
    }
  }

  const colorMap: Record<string, string> = {
    "✈️": "bg-blue",
    "🏨": "bg-emerald-500",
    "🎯": "bg-gold",
    "🍽️": "bg-orange-400",
    "🚗": "bg-purple-500",
    "🚇": "bg-purple-500",
    "💰": "bg-charcoal/40",
    "🛂": "bg-red-400",
  };

  const tips = plan
    ? [...plan.packingTips, ...plan.safetyTips, ...plan.hiddenGems].filter(Boolean)
    : [];

  return (
    <section className="section-dark bg-section-dark relative overflow-hidden">
      {/* BG orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-blue/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" />

      <div className="container-px relative">
        <div className="mb-10 text-center">
          <span className="eyebrow-gold mb-4">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI Travel Command Center
          </span>
          <h2 className="mt-4 h-section text-white">
            Build your perfect trip in{" "}
            <span className="text-gradient-gold">30 seconds</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
            Tell the AI your destination, budget and travel style. Instantly get a personalized itinerary, budget breakdown, hotel picks and travel tips.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ── Input panel ── */}
          <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-[var(--shadow-premium)]" style={{ borderColor: "var(--gtv-border)" }}>
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Your travel preferences</h3>

            <div>
              <label className="label">Destination</label>
              <input
                className="input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dubai, Istanbul, New York, Bangkok..."
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="label">Days</label>
                <select className="input select" value={days} onChange={(e) => setDays(e.target.value)}>
                  {[3,4,5,6,7,8,10,14].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div>
                <label className="label">Travelers</label>
                <select className="input select" value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option value="1">Solo</option>
                  <option value="2">Couple (2)</option>
                  <option value="3">3 people</option>
                  <option value="4">Family (4)</option>
                  <option value="5">Group (5+)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Total budget (USD)</label>
              <select className="input select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="800">$800 (Budget)</option>
                <option value="1500">$1,500</option>
                <option value="2000">$2,000</option>
                <option value="3000">$3,000</option>
                <option value="5000">$5,000</option>
                <option value="8000">$8,000</option>
                <option value="15000">$15,000 (Luxury)</option>
              </select>
            </div>
            <div>
              <label className="label">Travel style</label>
              <select className="input select" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option>Balanced</option>
                <option>Budget traveler</option>
                <option>Luxury & comfort</option>
                <option>Family friendly</option>
                <option>Adventure seeker</option>
                <option>Business travel</option>
                <option>Couple / romantic</option>
                <option>Cultural explorer</option>
              </select>
            </div>
            <div>
              <label className="label">Special needs</label>
              <select className="input select" defaultValue="None">
                <option>None</option>
                <option>Halal food required</option>
                <option>Wheelchair accessible</option>
                <option>With pets</option>
                <option>Medical travel</option>
                <option>Umrah / Religious</option>
              </select>
            </div>

            <button
              onClick={() => void generate()}
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Generating your plan…
                </span>
              ) : (
                <>
                  <Icon name="sparkles" className="h-4 w-4" />
                  Generate AI Travel Plan
                </>
              )}
            </button>

            <p className="text-[11px] text-white/30 text-center leading-relaxed">
              AI-generated estimates for inspiration only. Prices, availability and visa outcomes are never guaranteed.
            </p>
          </div>

          {/* ── Output panel ── */}
          <div className="min-h-[400px]">
            {!plan && !loading && !error && (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
                <div className="text-6xl animate-float">🗺️</div>
                <h3 className="mt-5 text-lg font-bold text-white/80">Your AI plan appears here</h3>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  Fill in your preferences and click &quot;Generate AI Travel Plan&quot; to see a personalized itinerary, budget breakdown, flights and hotel picks.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    { dest: "Dubai", days: "5", budget: "2000", label: "Dubai 5 days $2k" },
                    { dest: "Istanbul", days: "7", budget: "3000", label: "Istanbul 7 days $3k" },
                    { dest: "New York", days: "10", budget: "5000", label: "New York 10 days $5k" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setDestination(s.dest);
                        setDays(s.days);
                        setBudget(s.budget);
                        void generate({ destination: s.dest, days: s.days, budget: s.budget });
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:border-gold/40 hover:text-gold transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-sm text-white/80">
                {error}
              </div>
            )}

            {loading && (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-8 space-y-4">
                <div className="skeleton h-7 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-3/4" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            )}

            {plan && planMeta && !loading && (
              <div className="animate-fade-up space-y-4">
                {/* Header */}
                <div className="rounded-2xl border border-gold/20 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{plan.destination}</h3>
                      <p className="text-sm text-white/55">
                        {plan.totalDays} days · ${planMeta.totalBudget.toLocaleString()} total · {planMeta.style}
                      </p>
                      {plan.summary && (
                        <p className="mt-2 text-xs text-white/50 leading-relaxed">{plan.summary}</p>
                      )}
                    </div>
                    <span className="chip bg-gold/15 text-gold border-gold/20 text-xs font-bold">AI Generated</span>
                  </div>
                </div>

                {/* Budget breakdown */}
                {plan.budgetBreakdown.length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Budget Breakdown</h4>
                    <div className="space-y-2.5">
                      {plan.budgetBreakdown.map((b) => (
                        <div key={b.label}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-white/70">
                              <span>{b.emoji}</span>
                              {b.label}
                            </span>
                            <span className="font-bold text-white">${b.amount.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 ${colorMap[b.emoji] ?? "bg-blue"}`}
                              style={{ width: `${b.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itinerary */}
                {plan.itinerary.length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Day-by-Day Itinerary</h4>
                    <div className="space-y-3">
                      {plan.itinerary.map((d) => (
                        <div key={d.day} className="flex gap-3">
                          <span className="mt-0.5 flex h-6 w-16 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-[11px] font-bold text-gold">
                            Day {d.day}
                          </span>
                          <ul className="space-y-0.5">
                            {d.title && (
                              <li className="text-xs font-semibold text-white/80">{d.title}</li>
                            )}
                            {d.activities.map((a, i) => (
                              <li key={i} className="text-xs text-white/65 flex items-start gap-1.5">
                                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flights + Hotels row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">✈️ Flights</h4>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-xs text-white/70 leading-relaxed">{plan.flightTip}</p>
                    </div>
                    {plan.tours.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {plan.tours.slice(0, 2).map((t) => (
                          <div key={t.name} className="rounded-xl bg-white/5 p-3">
                            <p className="text-xs font-semibold text-white">{t.name}</p>
                            <p className="text-xs text-white/50">{t.duration}</p>
                            <p className="text-sm font-bold text-gold">{t.price}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">🏨 Hotels</h4>
                    {plan.hotels.map((h) => (
                      <div key={h.name} className="mb-2 last:mb-0 rounded-xl bg-white/5 p-3">
                        <p className="text-xs font-semibold text-white">{h.name}</p>
                        <p className="text-xs text-white/50">{"★".repeat(h.stars)} · {h.area}</p>
                        <p className="text-sm font-bold text-gold">{h.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visa note */}
                {plan.visaNote && (
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 flex items-start gap-3">
                    <Icon name="visa" className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                    <p className="text-xs text-white/70">{plan.visaNote}</p>
                  </div>
                )}

                {/* Tips */}
                {tips.length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">🔑 AI Travel Tips</h4>
                    <ul className="space-y-2">
                      {tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                          <Icon name="sparkles" className="h-3.5 w-3.5 shrink-0 text-gold mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <Link href="/trip-planner" className="btn-gold flex-1 py-2.5 text-sm">
                    Full AI Planner
                  </Link>
                  <Link href="/agents" className="btn border border-white/20 flex-1 py-2.5 text-sm text-white hover:bg-white/10">
                    Find Travel Agent
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
