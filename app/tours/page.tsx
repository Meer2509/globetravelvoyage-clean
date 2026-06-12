"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { Stars } from "@/components/Stars";
import { tours, tickets } from "@/lib/data";

const CATEGORY_CHIPS = ["Food", "Heritage", "Adventure", "City tour", "Half day", "Full day", "Beach", "Desert"];
const CITY_CHIPS     = [...new Set(tours.map((t) => t.city))];

type Tour   = (typeof tours)[0];
type Ticket = (typeof tickets)[0];

export default function ToursPage() {
  const [modalTour, setModalTour]       = useState<Tour | null>(null);
  const [modalTicket, setModalTicket]   = useState<Ticket | null>(null);
  const [search, setSearch]             = useState("");
  const [chips, setChips]               = useState<string[]>([]);
  const [savedIds, setSavedIds]         = useState<Set<string>>(new Set());

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filteredTours = useMemo(() => {
    let list = tours;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.guide.toLowerCase().includes(q)
      );
    }
    const cityChips = chips.filter((c) => CITY_CHIPS.includes(c));
    if (cityChips.length > 0) list = list.filter((t) => cityChips.includes(t.city));
    if (chips.includes("Half day"))  list = list.filter((t) => t.duration.toLowerCase().includes("half") || t.duration.includes("3") || t.duration.includes("4"));
    if (chips.includes("Full day"))  list = list.filter((t) => t.duration.toLowerCase().includes("full") || t.duration.includes("7") || t.duration.includes("8"));
    return list;
  }, [search, chips]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Experiences</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Local tours led by verified guides
          </h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Discover cities, food, heritage and adventure with identity-checked local guides — plus attraction tickets.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[
            { key: "0", placeholder: "City, experience or guide name…" },
            { key: "date", placeholder: "Date", type: "date" },
            { key: "travelers", placeholder: "Travelers" },
          ]}
          chips={[...CITY_CHIPS, ...CATEGORY_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-1">Top rated</span>
              <h2 className="text-xl font-extrabold text-navy">
                Featured tours <span className="text-sm font-normal text-charcoal/40">({filteredTours.length})</span>
              </h2>
            </div>
          </div>

          {filteredTours.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-navy">No tours found</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTours.map((tour) => {
                const saved = savedIds.has(tour.id);
                return (
                  <div key={tour.id} className="card card-hover flex flex-col overflow-hidden">
                    <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                      <span>{tour.emoji}</span>
                      <div className="absolute right-2 top-2">
                        <SaveButton
                          id={tour.id}
                          defaultSaved={saved}
                          onToggle={(s) =>
                            setSavedIds((prev) => {
                              const next = new Set(prev);
                              s ? next.add(tour.id) : next.delete(tour.id);
                              return next;
                            })
                          }
                          className="rounded-lg bg-white/80 shadow-sm"
                        />
                      </div>
                      <span className="absolute left-3 top-3 rounded-full bg-blue/90 px-2.5 py-1 text-[10px] font-bold text-white">
                        {tour.duration}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-navy">{tour.title}</h3>
                          <p className="text-sm text-charcoal/55">{tour.city}, {tour.country}</p>
                        </div>
                        <Stars rating={tour.rating} reviews={tour.reviews} />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-charcoal/50">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold">
                          {tour.guide.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                        Guide: {tour.guide}
                      </div>
                      <div className="mt-5 border-t border-soft-200 pt-4 space-y-2">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-lg font-extrabold text-navy">{tour.price}</p>
                            <p className="text-xs text-muted">per person · sample estimate</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setModalTour(tour)}
                          className="btn-primary w-full py-2.5 text-sm"
                        >
                          Request quote — free
                        </button>
                        <Link
                          href="/booking/request"
                          className="btn-outline w-full py-2 text-sm text-center"
                        >
                          General booking help
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Attraction tickets */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-1">Skip the line</span>
              <h2 className="text-xl font-extrabold text-navy">Attraction tickets</h2>
            </div>
            <Link href="/tickets" className="btn-outline py-2 px-4 text-sm">All tickets →</Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="card card-hover flex flex-col overflow-hidden">
                <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-4xl">
                  <span>{ticket.emoji}</span>
                  {ticket.skipLine && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                      Skip the line
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold text-navy text-sm">{ticket.attraction}</h3>
                  <p className="text-xs text-charcoal/55">{ticket.city} · {ticket.category}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-3">
                    <div>
                      <p className="font-extrabold text-navy">{ticket.price}</p>
                      <p className="text-[10px] text-charcoal/45">per ticket</p>
                    </div>
                    <button
                      onClick={() => setModalTicket(ticket)}
                      className="btn-blue px-3 py-1.5 text-xs"
                    >
                      Get tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection
        title="Are you a local tour guide?"
        subtitle="List your tours, set pricing and availability, and grow your reviews on Globe Travel Voyage."
        primary={{ label: "Become a guide", href: "/register?role=guide" }}
        secondary={{ label: "View verified guides", href: "/agents" }}
      />

      <ContactModal
        open={!!modalTour}
        onClose={() => setModalTour(null)}
        mode="book_tour"
        subjectName={modalTour?.title}
        subjectMeta={modalTour ? `${modalTour.city} · ${modalTour.duration} · ${modalTour.price}/person` : undefined}
      />

      <ContactModal
        open={!!modalTicket}
        onClose={() => setModalTicket(null)}
        mode="buy_ticket"
        subjectName={modalTicket?.attraction}
        subjectMeta={modalTicket ? `${modalTicket.city} · ${modalTicket.price}/ticket` : undefined}
      />
    </>
  );
}
