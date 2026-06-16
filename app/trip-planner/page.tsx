"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { useCatalog } from "@/lib/catalog/context";
import { generateTripPlanWithAi, mapTravelStyleLabel, AiUnavailableError } from "@/lib/ai-api";
import type { TripResult } from "@/lib/ai-types";

const TRIP_PLAN_DISCLAIMER =
  "These estimates are for planning purposes only. Prices may vary significantly based on season, availability, and booking source. Globe Travel Voyage does not guarantee any price or service. Always verify with official providers before booking.";

type TripPlan = TripResult & {
  style: string;
  totalBudget: number;
  disclaimer: string;
};

// ── Main component ────────────────────────────────────────────────────────────

const TRAVEL_STYLES = ["Budget traveller", "Comfort seeker", "Luxury explorer", "Adventure lover", "Family trip", "Business + leisure"];

export default function TripPlannerPage() {
  const [destination, setDestination] = useState("");
  const [days, setDays]               = useState(5);
  const [budget, setBudget]           = useState(1500);
  const [style, setStyle]             = useState("Comfort seeker");
  const [travelers, setTravelers]     = useState(2);
  const [plan, setPlan]               = useState<TripPlan | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [modal, setModal]             = useState(false);

  const { packages } = useCatalog();
  const pkgFilter = useMemo(() => packages.filter((p) => !destination || p.destinations.toLowerCase().includes(destination.toLowerCase())).slice(0, 4), [destination, packages]);

  async function generatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) return;
    setLoading(true);
    setPlan(null);
    setError("");
    const totalBudget = budget * travelers;
    try {
      const result = await generateTripPlanWithAi({
        destination: destination.trim(),
        days,
        budget: totalBudget,
        currency: "USD",
        travelers,
        travelStyle: mapTravelStyleLabel(style),
        accommodation: "hotel",
        interests: [],
        includeFlights: true,
        includeVisa: true,
      });
      setPlan({
        ...result,
        style,
        totalBudget,
        disclaimer: TRIP_PLAN_DISCLAIMER,
      });
    } catch (err) {
      setError(
        err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Trip planning failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-px">
          <nav className="mb-4 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Trip Planner</span>
          </nav>
          <span className="eyebrow-white mb-3">AI trip planner</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Plan your trip by budget & days</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Tell our AI your destination, budget, and travel days — get a full budget breakdown, day-by-day itinerary, and visa checklist instantly.
          </p>
        </div>
      </div>

      {/* Planner form */}
      <section className="section">
        <div className="container-px">
          <div className="mx-auto max-w-3xl">
            <div className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-navy mb-6">✨ AI trip planner</h2>
              <form onSubmit={generatePlan} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Destination *</label>
                    <input className="input" placeholder="Dubai, Istanbul, Thailand…" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Travel days: {days} days</label>
                    <input type="range" min={3} max={14} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-blue" />
                    <div className="flex justify-between text-xs text-charcoal/40 mt-1"><span>3</span><span>14</span></div>
                  </div>
                  <div>
                    <label className="label">Budget per person: ${budget.toLocaleString()}</label>
                    <input type="range" min={500} max={10000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-blue" />
                    <div className="flex justify-between text-xs text-charcoal/40 mt-1"><span>$500</span><span>$10,000</span></div>
                  </div>
                  <div>
                    <label className="label">Number of travelers</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setTravelers((n) => Math.max(1, n - 1))} className="btn-outline h-9 w-9 text-lg font-bold">−</button>
                      <span className="text-lg font-extrabold text-navy w-8 text-center">{travelers}</span>
                      <button type="button" onClick={() => setTravelers((n) => Math.min(10, n + 1))} className="btn-outline h-9 w-9 text-lg font-bold">+</button>
                      <span className="text-xs text-charcoal/40">Total budget: ${(budget * travelers).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Travel style</label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((s) => (
                      <button key={s} type="button" onClick={() => setStyle(s)}
                        className={`chip transition-all ${style === s ? "border-blue bg-blue/10 text-navy font-semibold" : "hover:border-navy/30"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || !destination.trim()} className="btn-primary w-full py-3.5 disabled:opacity-50">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                      </svg>
                      Generating your trip plan…
                    </span>
                  ) : "✨ Generate AI trip plan"}
                </button>
              </form>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* AI Output */}
            {plan && (
              <div className="mt-8 space-y-6">
                {/* Header */}
                <div className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-extrabold text-navy">{plan.destination}</h3>
                      <p className="text-charcoal/55">{plan.totalDays} days · ${plan.totalBudget.toLocaleString()} total budget · {plan.style}</p>
                    </div>
                    <button onClick={() => setModal(true)} className="btn-primary py-2.5 px-5">Book this trip</button>
                  </div>
                </div>

                {/* Budget breakdown */}
                <div className="card p-6">
                  <h4 className="font-extrabold text-navy mb-4">💰 Budget breakdown</h4>
                  <div className="space-y-3">
                    {plan.budgetBreakdown.map((b) => {
                      const total = plan.budgetBreakdown.reduce((sum, x) => sum + x.amount, 0);
                      const pct = total > 0 ? Math.round((b.amount / total) * 100) : 0;
                      return (
                        <div key={b.label} className="flex items-center gap-3">
                          <span className="text-xl w-7">{b.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-navy">{b.label}</span>
                              <span className="font-extrabold text-navy">${b.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-soft-200 overflow-hidden">
                              <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-charcoal/40 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Itinerary */}
                <div className="card p-6">
                  <h4 className="font-extrabold text-navy mb-4">🗓️ Day-by-day itinerary</h4>
                  <div className="space-y-4">
                    {plan.itinerary.map((d) => (
                      <div key={d.day} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-gold">{d.day}</div>
                        <div>
                          <p className="font-bold text-navy text-sm">{d.title}</p>
                          <ul className="mt-1 space-y-0.5">
                            {d.activities.map((a) => <li key={a} className="text-sm text-charcoal/60 before:mr-2 before:content-['→']">{a}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visa note */}
                <div className="card border border-blue/15 bg-blue/5 p-5">
                  <h4 className="font-extrabold text-navy mb-2">🛂 Visa note</h4>
                  <p className="text-sm text-charcoal/65 leading-relaxed">{plan.visaNote}</p>
                  <Link href="/visa/start" className="btn-primary mt-3 inline-block py-2 px-4 text-sm">Start visa application →</Link>
                </div>

                {/* Disclaimer */}
                <Disclaimer>
                  {plan.disclaimer}
                </Disclaimer>

                <div className="flex gap-3">
                  <button onClick={() => setModal(true)} className="btn-primary flex-1 py-3">📩 Request expert help</button>
                  <Link href="/ai-visa-assistant" className="btn-outline flex-1 py-3 text-center">🤖 Visa AI assistant</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Packages section */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Ready-made"
            title="Vacation packages from verified agencies"
            subtitle="Prefer a done-for-you trip? Explore curated packages including flights, stays and tours."
            linkHref="/agencies"
            linkLabel="View agencies"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pkgFilter.map((p) => (
              <div key={p.id} className="card card-hover flex flex-col p-5">
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="mt-3 font-bold text-navy">{p.title}</h3>
                <p className="text-sm text-charcoal/55">{p.destinations} · {p.nights} nights</p>
                <div className="mt-2 flex flex-wrap gap-1">{p.includes.slice(0, 2).map((i) => <span key={i} className="chip text-[10px]">{i}</span>)}</div>
                <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-4">
                  <div>
                    <p className="text-lg font-extrabold text-navy">{p.price}</p>
                    <p className="text-xs text-charcoal/40">per person</p>
                  </div>
                  <Link href="/booking/request" className="btn-blue px-3 py-1.5 text-xs">Book</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8"><Disclaimer variant="compact" /></div>
        </div>
      </section>

      <CTASection
        title="Want a real expert to plan your trip?"
        subtitle="Connect with a verified travel agency or AI-assisted trip consultant who specialises in your destination."
        primary={{ label: "Find travel agencies", href: "/agencies" }}
        secondary={{ label: "AI visa assistant", href: "/ai-visa-assistant" }}
      />

      {modal && (
        <ContactModal open={modal} onClose={() => setModal(false)} mode="request_quote" subjectName={plan ? `AI Trip Plan — ${plan.destination}` : "Custom trip"} />
      )}
    </>
  );
}
