"use client";

import { useState } from "react";
import Link from "next/link";
import type { Country } from "@/lib/data";

export function CountryExplorer({ countries }: { countries: Country[] }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");

  const regions = ["All", ...Array.from(new Set(countries.map((c) => c.region)))];
  const filtered = countries.filter(
    (c) =>
      (region === "All" || c.region === region) &&
      c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="Search a country…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input select sm:w-56"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((c) => (
          <Link
            key={c.name}
            href="/visa"
            className="card card-hover flex flex-col gap-2 p-5"
          >
            <span className="text-3xl">{c.flag}</span>
            <h3 className="text-sm font-bold text-navy">{c.name}</h3>
            <p className="text-xs text-navy/50">{c.region}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-navy/60">{c.visaTypes} visa types</span>
              <span
                className={`rounded-full px-2 py-0.5 font-semibold ${
                  c.difficulty === "Easy"
                    ? "bg-blue/10 text-blue"
                    : c.difficulty === "Complex"
                    ? "bg-gold/15 text-navy"
                    : "bg-soft text-navy/60"
                }`}
              >
                {c.difficulty}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-navy/50">
          No countries match your search.
        </p>
      )}
    </div>
  );
}
