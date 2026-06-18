"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/Stars";
import type { GroupTourRow } from "@/lib/supabase/group-tour-types";

export function GroupToursCatalog({ tours }: { tours: GroupTourRow[] }) {
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");

  const destinations = useMemo(
    () => [...new Set(tours.map((t) => t.destination))].sort(),
    [tours]
  );

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q);
      const matchesDest = !destination || t.destination === destination;
      return matchesQuery && matchesDest;
    });
  }, [tours, query, destination]);

  return (
    <section className="section">
      <div className="container-px">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:max-w-2xl">
            <input
              className="input flex-1"
              placeholder="Search tours, destinations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input select sm:w-48"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="">All destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-charcoal/55">{filtered.length} tour{filtered.length === 1 ? "" : "s"}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl">🗺️</div>
            <h2 className="mt-4 text-xl font-extrabold text-navy">No group tours yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">
              Verified travel agents are listing premium group departures. Check back soon or become a verified agent to list your first tour.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/register?role=agent" className="btn-gold px-6 py-2.5 text-sm">
                Become a travel agent
              </Link>
              <Link href="/travel-agents" className="btn-outline px-6 py-2.5 text-sm">
                Browse agents
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tour) => {
              const seatsLeft = tour.seat_limit - tour.seats_booked;
              return (
                <Link
                  key={tour.id}
                  href={`/group-tours/${tour.id}`}
                  className="group card card-hover flex flex-col overflow-hidden"
                >
                  <div className="relative bg-hero-gradient px-5 py-8 text-white">
                    {tour.featured && (
                      <span className="absolute right-3 top-3 rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                        Featured
                      </span>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{tour.destination}</p>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug">{tour.title}</h3>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {tour.agent_name && (
                      <p className="text-xs text-charcoal/50">
                        by {tour.agent_name}{tour.agency_name ? ` · ${tour.agency_name}` : ""}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-charcoal/55">
                      {tour.start_date && (
                        <span>📅 {new Date(tour.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                      <span>👥 {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left</span>
                    </div>
                    {tour.price != null && (
                      <p className="mt-3 text-lg font-extrabold text-navy">
                        {tour.currency} {Number(tour.price).toLocaleString()}
                        <span className="text-xs font-normal text-charcoal/45"> / person</span>
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={tour.rating ?? 0} reviews={tour.review_count ?? 0} />
                    </div>
                    {tour.description && (
                      <p className="mt-3 line-clamp-2 flex-1 text-sm text-charcoal/60">{tour.description}</p>
                    )}
                    <span className="mt-4 text-sm font-semibold text-blue group-hover:underline">
                      View tour →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
