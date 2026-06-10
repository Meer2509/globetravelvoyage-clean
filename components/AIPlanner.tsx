"use client";

import { useState } from "react";
import { Icon } from "./Icon";

interface Plan {
  destination: string;
  days: number;
  budget: number;
  breakdown: { label: string; pct: number; amount: number; icon: string }[];
  perDay: number;
  itinerary: string[];
  visaNote: string;
}

const SPLIT = [
  { label: "Flights", pct: 0.32, icon: "✈️" },
  { label: "Stay", pct: 0.28, icon: "🏨" },
  { label: "Food", pct: 0.16, icon: "🍽️" },
  { label: "Tours & tickets", pct: 0.14, icon: "🎟️" },
  { label: "Transport", pct: 0.06, icon: "🚗" },
  { label: "Buffer", pct: 0.04, icon: "🛟" },
];

function buildItinerary(destination: string, days: number): string[] {
  const base = [
    `Arrive in ${destination} — check in, relax, sunset walk`,
    `${destination} highlights & landmark city tour`,
    `Local food trail + cultural experience`,
    `Day trip or guided attraction tour`,
    `Shopping, markets & leisure`,
    `Adventure / nature / beach day`,
    `Free morning, souvenirs & departure`,
  ];
  return Array.from({ length: Math.max(1, days) }, (_, i) =>
    base[i % base.length].replace("Arrive", i === 0 ? "Arrive" : "Explore")
  );
}

export function AIPlanner() {
  const [destination, setDestination] = useState("Dubai");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(1200);
  const [travelers, setTravelers] = useState(2);
  const [plan, setPlan] = useState<Plan | null>(null);

  function generate(e: React.FormEvent) {
    e.preventDefault();
    const breakdown = SPLIT.map((s) => ({
      label: s.label,
      pct: Math.round(s.pct * 100),
      amount: Math.round(budget * s.pct),
      icon: s.icon,
    }));
    setPlan({
      destination,
      days,
      budget,
      breakdown,
      perDay: Math.round(budget / Math.max(1, days)),
      itinerary: buildItinerary(destination, days),
      visaNote: `Before you travel to ${destination}, check the visa requirements for your nationality in the Visa Marketplace. We can suggest the right visa type and document checklist — but we never guarantee approval.`,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={generate}
        className="card h-fit space-y-4 p-6 lg:sticky lg:top-20"
      >
        <div className="flex items-center gap-2">
          <Icon name="sparkles" className="h-5 w-5 text-blue" />
          <h3 className="text-lg font-bold text-navy">AI Trip Planner</h3>
        </div>
        <div>
          <label className="label">Destination</label>
          <input
            className="input"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Travel days</label>
            <input
              type="number"
              min={1}
              max={30}
              className="input"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Travelers</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="label">Total budget (USD): ${budget.toLocaleString()}</label>
          <input
            type="range"
            min={300}
            max={10000}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-blue"
          />
          <div className="mt-1 flex justify-between text-xs text-navy/45">
            <span>$300</span>
            <span>$10,000</span>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          <Icon name="sparkles" className="h-4 w-4" /> Generate AI plan
        </button>
        <p className="text-xs text-navy/45">
          Demo planner using sample data. Estimates only — not a quote or guarantee.
        </p>
      </form>

      <div className="min-h-[300px]">
        {!plan ? (
          <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
            <span className="text-5xl">🗺️</span>
            <h3 className="mt-4 text-xl font-bold text-navy">
              Your AI itinerary appears here
            </h3>
            <p className="mt-2 max-w-md text-sm text-navy/60">
              Enter a destination, days and budget — the AI will split your budget,
              draft a day-by-day plan and flag visa steps.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-navy">
                    {plan.days}-day {plan.destination} plan for {travelers}{" "}
                    traveler{travelers > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-navy/55">
                    Budget ${plan.budget.toLocaleString()} · ~$
                    {plan.perDay.toLocaleString()} per day
                  </p>
                </div>
                <span className="chip bg-blue/10 text-blue">AI generated</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plan.breakdown.map((b) => (
                  <div key={b.label} className="rounded-xl border border-soft-200 bg-soft/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-navy">
                        {b.icon} {b.label}
                      </span>
                      <span className="text-xs text-navy/45">{b.pct}%</span>
                    </div>
                    <p className="mt-1 text-lg font-extrabold text-navy">
                      ${b.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h4 className="text-base font-bold text-navy">Day-by-day itinerary</h4>
              <ol className="mt-4 space-y-3">
                {plan.itinerary.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-sm text-navy/75">{d}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
              <Icon name="visa" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm text-navy/70">{plan.visaNote}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
