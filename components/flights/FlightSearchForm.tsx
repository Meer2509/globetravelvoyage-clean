"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { AirportAutocomplete } from "@/components/flights/AirportAutocomplete";
import {
  getAirportByIata,
  POPULAR_FLIGHT_SEARCHES,
  type AirportRecord,
  type PopularFlightSearch,
} from "@/lib/flights/airports";
import type { FlightCabinClass } from "@/lib/flights/types";

export interface FlightSearchFormValues {
  tripType: "roundtrip" | "oneway";
  origin: AirportRecord;
  destination: AirportRecord;
  departureDate: string;
  returnDate: string;
  adults: number;
  cabinClass: FlightCabinClass;
}

function defaultDepartureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function minDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FlightSearchForm({
  onSearch,
  loading,
}: {
  onSearch: (values: FlightSearchFormValues) => void;
  loading?: boolean;
}) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState<AirportRecord | null>(null);
  const [destination, setDestination] = useState<AirportRecord | null>(null);
  const [departureDate, setDepartureDate] = useState(defaultDepartureDate());
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState<FlightCabinClass>("economy");
  const [error, setError] = useState("");

  function applyPopular(search: PopularFlightSearch) {
    const from = getAirportByIata(search.originIata);
    const to = getAirportByIata(search.destinationIata);
    if (from) setOrigin(from);
    if (to) setDestination(to);
    setError("");
  }

  function swapAirports() {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!origin || !destination) {
      setError("Select origin and destination airports from the suggestions.");
      return;
    }
    if (origin.iata === destination.iata) {
      setError("Origin and destination must be different.");
      return;
    }
    if (!departureDate) {
      setError("Choose a departure date.");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      setError("Choose a return date for round-trip searches.");
      return;
    }
    if (tripType === "roundtrip" && returnDate < departureDate) {
      setError("Return date must be on or after departure.");
      return;
    }

    onSearch({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      cabinClass,
    });
  }

  return (
    <div className="card -mt-12 relative z-10 overflow-hidden border-white/60 shadow-[var(--shadow-premium)]">
      <div className="border-b border-soft-200 bg-gradient-to-r from-navy/[0.03] to-gold/[0.06] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {(["roundtrip", "oneway"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tripType === type
                  ? "bg-navy text-white shadow-[var(--shadow-card)]"
                  : "bg-white text-charcoal/55 hover:text-navy border border-soft-200"
              }`}
            >
              {type === "roundtrip" ? "Round trip" : "One way"}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <AirportAutocomplete
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder="e.g. New York, Dubai, LHR"
            required
          />

          <button
            type="button"
            onClick={swapAirports}
            aria-label="Swap origin and destination"
            className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-soft-200 bg-white text-navy shadow-sm transition-all hover:border-gold/40 hover:bg-gold/5 lg:mb-0.5"
          >
            ⇄
          </button>

          <AirportAutocomplete
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="e.g. Karachi, London, DXB"
            required
          />
        </div>

        <div className={`grid gap-4 ${tripType === "roundtrip" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          <div>
            <label className="label">Departure</label>
            <input
              type="date"
              className="input"
              value={departureDate}
              min={minDate()}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>
          {tripType === "roundtrip" && (
            <div>
              <label className="label">Return</label>
              <input
                type="date"
                className="input"
                value={returnDate}
                min={departureDate || minDate()}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="label">Adults</label>
            <select
              className="input select"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Adult" : "Adults"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Cabin class</label>
            <select
              className="input select"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as FlightCabinClass)}
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex w-full items-center justify-center gap-2 py-4 text-base font-extrabold disabled:opacity-60"
        >
          <Icon name="sparkles" className="h-5 w-5" />
          {loading ? "Searching…" : "Search flights"}
        </button>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/45">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_FLIGHT_SEARCHES.map((search) => (
              <button
                key={search.label}
                type="button"
                onClick={() => applyPopular(search)}
                className="rounded-full border border-soft-200 bg-soft/50 px-3 py-1.5 text-xs font-semibold text-navy transition-all hover:border-blue/30 hover:bg-blue/5"
              >
                {search.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
