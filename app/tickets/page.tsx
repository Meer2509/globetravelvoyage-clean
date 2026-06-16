"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { ListingGrid } from "@/components/ListingGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { SampleCatalogBanner } from "@/components/SampleCatalogBanner";
import { SamplePrice } from "@/components/PriceEstimateLabel";
import { useCatalog } from "@/lib/catalog/context";
import type { Ticket } from "@/lib/data";

export default function TicketsPage() {
  const { tickets } = useCatalog();
  const cityChips = useMemo(() => [...new Set(tickets.map((t) => t.city))], [tickets]);
  const categoryChips = useMemo(() => [...new Set(tickets.map((t) => t.category))], [tickets]);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [, setSavedIds] = useState<Set<string>>(new Set());

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["0"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = tickets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.attraction.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    const activeCities = chips.filter((c) => cityChips.includes(c));
    if (activeCities.length > 0) list = list.filter((t) => activeCities.includes(t.city));
    const activeCategories = chips.filter((c) => categoryChips.includes(c));
    if (activeCategories.length > 0) list = list.filter((t) => activeCategories.includes(t.category));
    if (chips.includes("Skip the line")) list = list.filter((t) => t.skipLine);
    return list;
  }, [tickets, search, chips, cityChips, categoryChips]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Attraction tickets</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Attraction tickets, skip the line
          </h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Book entry to landmarks, museums and family attractions worldwide. Request a verified quote — provider confirmation required.
          </p>
        </div>
      </div>

      <div className="container-px space-y-4 pt-6">
        <SampleCatalogBanner />
        <FilterBar
          fields={[
            { key: "0", placeholder: "City, attraction or category…" },
            { key: "date", placeholder: "Visit date", type: "date" },
            { key: "qty", placeholder: "Tickets" },
          ]}
          chips={[...cityChips, ...categoryChips, "Skip the line"]}
          onSearch={handleSearch}
        />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5">
            <span className="eyebrow mb-1">Featured</span>
            <h2 className="text-xl font-extrabold text-navy">
              Attraction tickets{" "}
              <span className="text-sm font-normal text-charcoal/40">({filtered.length})</span>
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🎟️</span>
              <p className="font-semibold text-navy">No tickets match your search</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different filters or search terms.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ticket) => (
                <div key={ticket.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                    <span>{ticket.emoji}</span>
                    {ticket.skipLine && (
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        Skip the line
                      </span>
                    )}
                    <div className="absolute right-2 top-2">
                      <SaveButton
                        id={ticket.id}
                        onToggle={() => setSavedIds((prev) => new Set(prev).add(ticket.id))}
                        className="rounded-lg bg-white/80 shadow-sm p-1.5"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-bold text-navy">{ticket.attraction}</h3>
                    <p className="text-sm text-charcoal/55">{ticket.city} · {ticket.category}</p>
                    <div className="mt-5 flex items-end justify-between border-t border-soft-200 pt-4">
                      <div>
                        <SamplePrice value={ticket.price} size="md" />
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

      <section className="section bg-soft/50">
        <div className="container-px">
          <ListingGrid
            columns={3}
            items={filtered.slice(0, 3).map((t) => ({
              id: t.id,
              emoji: t.emoji,
              title: t.attraction,
              subtitle: `${t.city} · ${t.category}`,
              price: t.price,
              priceNote: t.skipLine ? "Skip-the-line available" : undefined,
              ctaLabel: "Request quote",
            }))}
            onCta={(id) => {
              const ticket = tickets.find((t) => t.id === id);
              if (ticket) setSelectedTicket(ticket);
            }}
          />
        </div>
      </section>

      <CTASection
        title="Need help booking attraction tickets?"
        subtitle="Submit a request and we will connect you with verified ticket providers for confirmed availability."
        primary={{ label: "Request ticket help", href: "/booking/request" }}
        secondary={{ label: "Browse tours", href: "/tours" }}
      />

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
