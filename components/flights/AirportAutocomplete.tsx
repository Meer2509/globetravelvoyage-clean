"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  formatAirportShort,
  searchAirports,
  type AirportRecord,
} from "@/lib/flights/airports";

export function AirportAutocomplete({
  label,
  value,
  onChange,
  placeholder = "City or airport",
  required,
}: {
  label: string;
  value: AirportRecord | null;
  onChange: (airport: AirportRecord | null) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = searchAirports(query);
  const displayValue = open ? query : value ? formatAirportShort(value) : query;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleInputChange(next: string) {
    setQuery(next);
    setOpen(true);
    setActiveIndex(0);
    if (!next.trim()) onChange(null);
  }

  function selectAirport(airport: AirportRecord) {
    onChange(airport);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && suggestions[activeIndex]) {
      e.preventDefault();
      selectAirport(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35" aria-hidden>
          ✈
        </span>
        <input
          className="input pl-9"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setOpen(true);
            if (value) {
              setQuery(formatAirportShort(value));
              onChange(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
        />
      </div>

      {open && query.trim() && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-soft-200 bg-white py-1 shadow-[var(--shadow-premium)]"
        >
          {suggestions.map((airport, index) => (
            <li key={airport.iata} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAirport(airport)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  index === activeIndex ? "bg-blue/5" : "hover:bg-soft/80"
                }`}
              >
                <span className="mt-0.5 flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/8 text-xs font-bold text-navy">
                  {airport.iata}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy">
                    {airport.city}, {airport.country}
                  </span>
                  <span className="block text-xs text-charcoal/50 truncate">
                    {airport.airportName}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-soft-200 bg-white px-4 py-3 text-sm text-charcoal/50 shadow-[var(--shadow-card)]">
          No airports found. Try a city name or IATA code.
        </div>
      )}
    </div>
  );
}
