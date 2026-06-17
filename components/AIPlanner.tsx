"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import {
  generateTripPlanWithAi,
  mapTravelStyleLabel,
  AiUnavailableError,
} from "@/lib/ai-api";
import { VISA_AI_DISCLAIMER } from "@/lib/ai-types";

export function AIPlanner() {
  const [destination, setDestination] = useState("Dubai");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(1200);
  const [travelers, setTravelers] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Awaited<ReturnType<typeof generateTripPlanWithAi>> | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const result = await generateTripPlanWithAi({
        destination,
        days,
        budget,
        currency: "USD",
        travelers,
        travelStyle: mapTravelStyleLabel("Balanced"),
        accommodation: "hotel",
        interests: [],
        includeFlights: true,
        includeVisa: true,
      });
      setPlan(result);
    } catch (err) {
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

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={(e) => void generate(e)}
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
            required
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
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
          {loading ? "Generating plan…" : "Generate AI plan"}
        </button>
        <p className="text-[11px] text-navy/45 leading-relaxed">{VISA_AI_DISCLAIMER}</p>
      </form>

      <div className="card min-h-[320px] p-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {!plan && !loading && !error && (
          <div className="flex h-full flex-col items-center justify-center text-center text-navy/50">
            <span className="text-4xl">🗺️</span>
            <p className="mt-3 text-sm">Your AI itinerary will appear here.</p>
          </div>
        )}
        {loading && (
          <p className="text-sm text-navy/50 animate-pulse">Building your itinerary…</p>
        )}
        {plan && !loading && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-extrabold text-navy">{plan.destination}</h4>
              <p className="text-sm text-navy/60">{plan.summary}</p>
            </div>
            {plan.itinerary.length > 0 && (
              <div className="space-y-2">
                {plan.itinerary.map((day) => (
                  <div key={day.day} className="rounded-lg border border-soft-200 p-3">
                    <p className="text-xs font-bold text-navy">Day {day.day}: {day.title}</p>
                    <ul className="mt-1 space-y-0.5">
                      {day.activities.map((a) => (
                        <li key={a} className="text-xs text-navy/65">• {a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {plan.visaNote && (
              <p className="text-xs text-navy/60 border-t border-soft-200 pt-3">{plan.visaNote}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
