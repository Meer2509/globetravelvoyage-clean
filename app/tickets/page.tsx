"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { tickets } from "@/lib/data";

type Ticket = (typeof tickets)[0];

const CITY_CHIPS     = [...new Set(tickets.map((t) => t.city))];
const CATEGORY_CHIPS = [...new Set(tickets.map((t) => t.category))];

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch]   = useState("");
  const [chips, setChips]     = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = tickets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.attraction.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (chips.includes("Skip the line")) list = list.filter((t) => t.skipLine);
    const cityChips = chips.filter((c) => CITY_CHIPS.includes(c));
    if (cityChips.length > 0) list = list.filter((t) => cityChips.includes(t.city));
    const catChips = chips.filter((c) => CATEGORY_CHIPS.includes(c));
    if (catChips.length > 0) list = list.filter((t) => catChips.includes(t.category));
    return list;
  }, [search, chips]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Attractions</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Attraction tickets, skip the line
          </h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Book entry to landmarks, museums and family attractions worldwide. Sample prices for demonstration.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[
            { key: "0",    placeholder: "City, attraction or category…" },
            { key: "date", placeholder: "Visit date", type: "date" },
            { key: "qty",  placeholder: "Tickets" },
          ]}
          chips={["Skip the line", ...CITY_CHIPS, ...CATEGORY_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-1">Popular</span>
              <h2 className="text-xl font-extrabold text-navy">
                Featured attraction tickets{" "}
                <span className="text-sm font-normal text-charcoal/40">({filtered.length})</span>
              </h2>
            </div>
            <div className="text-xs text-charcoal/45 bg-emerald-50 rounded-full border border-emerald-100 px-3 py-1.5 font-semibold text-emerald-600">
              ⚡ Skip the line available
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🎟️</span>
              <p className="font-semibold text-navy">No tickets found</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ticket) => (
                <div key={ticket.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                    <span>{ticket.emoji}</span>
                    <div className="absolute right-2 top-2">
                      <SaveButton
                        id={ticket.id}
                        onToggle={(saved) =>
                          setSavedIds((prev) => {
                            const next = new Set(prev);
                            saved ? next.add(ticket.id) : next.delete(ticket.id);
                            return next;
                          })
                        }
                        className="rounded-lg bg-white/80 shadow-sm"
                      />
                    </div>
                    {ticket.skipLine && (
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        Skip the line
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-navy">{ticket.attraction}</h3>
                        <p className="text-sm text-charcoal/55">{ticket.city} · {ticket.category}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-end justify-between border-t border-soft-200 pt-4">
                      <div>
                        <p className="text-lg font-extrabold text-navy">{ticket.price}</p>
                        <p className="text-xs text-charcoal/45">per ticket</p>
                      </div>
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="btn-blue px-4 py-2 text-sm"
                      >
                        Get tickets
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      <CTASection />

      <ContactModal
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        mode="buy_ticket"
        subjectName={selectedTicket?.attraction}
        subjectMeta={selectedTicket ? `${selectedTicket.city} · ${selectedTicket.price}/ticket` : undefined}
      />
    </>
  );
}
