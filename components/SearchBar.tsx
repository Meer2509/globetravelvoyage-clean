"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/data";

type Tab = {
  key: string;
  label: string;
  icon: IconName;
  fields: { name: string; placeholder: string; type?: string }[];
};

const tabs: Tab[] = [
  {
    key: "ai",
    label: "Ask AI",
    icon: "sparkles",
    fields: [{ name: "q", placeholder: "e.g. Cheapest trip from Dubai to Manila for 7 days under $1200" }],
  },
  {
    key: "visa",
    label: "Visa",
    icon: "visa",
    fields: [
      { name: "nationality", placeholder: "Your nationality" },
      { name: "destination", placeholder: "Destination country" },
    ],
  },
  {
    key: "flights",
    label: "Flights",
    icon: "flight",
    fields: [
      { name: "from", placeholder: "From (city/airport)" },
      { name: "to", placeholder: "To (city/airport)" },
      { name: "date", placeholder: "Departure", type: "date" },
    ],
  },
  {
    key: "hotels",
    label: "Stays",
    icon: "hotel",
    fields: [
      { name: "city", placeholder: "Destination city" },
      { name: "checkin", placeholder: "Check-in", type: "date" },
    ],
  },
  {
    key: "tours",
    label: "Tours",
    icon: "tour",
    fields: [{ name: "city", placeholder: "City or experience" }],
  },
];

export function SearchBar() {
  const [active, setActive] = useState("ai");
  const [result, setResult] = useState<string | null>(null);
  const tab = tabs.find((t) => t.key === active)!;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(data.entries());
    const summary =
      active === "ai"
        ? `Planning your request: “${values.q || "your trip"}”. I'll suggest visa steps, flight routes, stays and a budget breakdown.`
        : `Searching ${tab.label.toLowerCase()} for ${Object.values(values)
            .filter(Boolean)
            .join(" · ") || "your selection"}. Showing the best matches with verified providers.`;
    setResult(summary);
  }

  return (
    <div className="w-full rounded-2xl bg-white p-2 shadow-[var(--shadow-premium)]">
      <div className="flex flex-wrap gap-1 px-1 pt-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setActive(t.key);
              setResult(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active === t.key
                ? "bg-navy text-white"
                : "text-navy/60 hover:bg-soft"
            }`}
          >
            <Icon name={t.icon} className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col gap-2 p-1 sm:flex-row sm:items-center"
      >
        <div className="grid flex-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {tab.fields.map((f) => (
            <input
              key={f.name}
              name={f.name}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-soft-200 bg-soft/60 px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:border-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue/15"
            />
          ))}
        </div>
        <button type="submit" className="btn-gold shrink-0 px-6 py-3">
          <Icon name="sparkles" className="h-4 w-4" />
          {active === "ai" ? "Plan with AI" : "Search"}
        </button>
      </form>

      {result && (
        <div className="m-1 flex items-start gap-3 rounded-xl border border-blue/20 bg-blue/5 p-4">
          <Icon name="sparkles" className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
          <div>
            <p className="text-sm text-navy/80">{result}</p>
            <p className="mt-1 text-xs text-navy/45">
              Demo preview — sample results only. We never guarantee prices or visa
              approval.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
