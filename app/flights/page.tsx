"use client";

import { useState } from "react";
import Link from "next/link";
import { FlightOfferList } from "@/components/FlightOfferList";
import {
  FlightSearchForm,
  type FlightSearchFormValues,
} from "@/components/flights/FlightSearchForm";
import { formatAirportShort } from "@/lib/flights/airports";
import { searchFlightsClient } from "@/lib/flights/search-client";
import type { FlightOffer } from "@/lib/flights/types";
import { SITE_CONFIG, supportMailto } from "@/lib/site-config";
import { EmailCaptureStrip } from "@/components/growth/EmailCaptureStrip";
import { ConversionTrustStrip } from "@/components/growth/ConversionTrustStrip";

export default function FlightsPage() {
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState<FlightSearchFormValues | null>(null);

  async function handleSearch(values: FlightSearchFormValues) {
    setHasSearched(true);
    setLoading(true);
    setFallbackMessage(null);
    setFlights([]);
    setLastSearch(values);

    try {
      const result = await searchFlightsClient({
        origin: values.origin.iata,
        destination: values.destination.iata,
        departureDate: values.departureDate,
        returnDate: values.tripType === "roundtrip" ? values.returnDate : undefined,
        passengers: values.adults,
        cabinClass: values.cabinClass,
      });

      if (!result.ok) {
        setFallbackMessage(result.message);
        setFlights([]);
      } else {
        setFlights(result.flights);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient pb-20 pt-12 sm:pb-24 sm:pt-14">
        <div className="container-px">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
          >
            ← Home
          </Link>
          <div className="max-w-3xl">
            <span className="eyebrow-white mb-3">Flights</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Search flights worldwide
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
              Compare live fares on routes across the Gulf, South Asia, Europe, and North America.
              Select your airports, dates, and cabin — then request a verified booking quote.
            </p>
          </div>
        </div>
      </div>

      <div className="container-px pb-6">
        <FlightSearchForm onSearch={handleSearch} loading={loading} />
      </div>

      <section className="section pt-4">
        <div className="container-px">
          {hasSearched && lastSearch && (
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow mb-1">Results</span>
                <h2 className="text-xl font-extrabold text-navy sm:text-2xl">
                  {formatAirportShort(lastSearch.origin)} → {formatAirportShort(lastSearch.destination)}
                </h2>
                <p className="mt-1 text-sm text-charcoal/50">
                  {lastSearch.departureDate}
                  {lastSearch.tripType === "roundtrip" && lastSearch.returnDate
                    ? ` → ${lastSearch.returnDate}`
                    : ""}
                  {" · "}
                  {lastSearch.adults} {lastSearch.adults === 1 ? "adult" : "adults"}
                  {" · "}
                  {lastSearch.cabinClass.replace("_", " ")}
                </p>
              </div>
              {!loading && !fallbackMessage && flights.length > 0 && (
                <p className="text-sm font-medium text-charcoal/45">
                  {flights.length} {flights.length === 1 ? "offer" : "offers"} found
                </p>
              )}
            </div>
          )}

          <FlightOfferList
            flights={hasSearched ? flights : []}
            loading={loading}
            fallbackMessage={hasSearched ? fallbackMessage : null}
            searched={hasSearched}
          />

          {hasSearched && !loading && (
            <div className="mt-8 rounded-2xl border border-soft-200 bg-white p-5 text-center shadow-[var(--shadow-card)] sm:p-6">
              <p className="text-sm text-charcoal/60">
                Need help booking?{" "}
                <a
                  href={supportMailto}
                  className="font-semibold text-blue hover:underline"
                >
                  {SITE_CONFIG.supportEmail}
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-soft-200 bg-white py-10">
        <div className="container-px max-w-3xl mx-auto space-y-6">
          <EmailCaptureStrip source="flights" headline="Get fare alerts & travel deals" />
          <ConversionTrustStrip />
          <p className="text-center text-xs leading-relaxed text-charcoal/45">
            Globe Travel Voyage is an independent travel marketplace, not an airline or ticketing agent.
            Live fares are sourced via Duffel. Final price and availability are confirmed at booking.
          </p>
        </div>
      </section>
    </div>
  );
}
