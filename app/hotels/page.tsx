"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { SaveButton } from "@/components/SaveButton";
import { SampleCatalogBanner } from "@/components/SampleCatalogBanner";
import { stays } from "@/lib/data";

const CITY_CHIPS  = [...new Set(stays.map((s) => s.city))];
const TYPE_CHIPS: string[]  = [...new Set(stays.map((s) => s.type))];

type Stay = (typeof stays)[0];

export default function HotelsPage() {
  const [modalStay, setModalStay]   = useState<Stay | null>(null);
  const [search, setSearch]         = useState("");
  const [chips, setChips]           = useState<string[]>([]);
  const [savedIds, setSavedIds]     = useState<Set<string>>(new Set());
  const [checkIn, setCheckIn]       = useState("");
  const [checkOut, setCheckOut]     = useState("");
  const [guestsRaw, setGuestsRaw]   = useState("");

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setSearch(values["dest"] ?? "");
    setCheckIn(values["checkin"] ?? "");
    setCheckOut(values["checkout"] ?? "");
    setGuestsRaw(values["guests"] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    let list = stays;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      );
    }
    const cityChips = chips.filter((c) => CITY_CHIPS.includes(c));
    if (cityChips.length > 0) list = list.filter((s) => cityChips.includes(s.city));
    const typeChips = chips.filter((c) => TYPE_CHIPS.includes(c));
    if (typeChips.length > 0) list = list.filter((s) => typeChips.includes(s.type));
    if (chips.includes("Free cancellation")) list = list.filter((s) => s.amenities.some((a) => a.toLowerCase().includes("cancel")));
    return list;
  }, [search, chips]);

  return (
    <>
      <div className="bg-hero-gradient py-14">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <span className="eyebrow-white mb-3">Stays</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Hotels & apartment rentals</h1>
          <p className="mt-2 text-white/60 text-sm max-w-2xl">
            Hotels, serviced apartments, villas and long-stay rentals across the Gulf, South Asia and beyond.
          </p>
        </div>
      </div>

      <div className="container-px">
        <FilterBar
          fields={[
            { key: "dest",     placeholder: "Destination city or country" },
            { key: "checkin",  placeholder: "Check-in", type: "date" },
            { key: "checkout", placeholder: "Check-out", type: "date" },
            { key: "guests",   placeholder: "Guests" },
          ]}
          chips={["Hotels", "Apartments", "Villas", "Long stay", "Free cancellation", ...CITY_CHIPS]}
          onSearch={handleSearch}
        />
      </div>

      <div className="container-px pb-2">
        <SampleCatalogBanner label="Sample hotel listings" />
      </div>

      <section className="section">
        <div className="container-px">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="eyebrow mb-1">Available now</span>
              <h2 className="text-xl font-extrabold text-navy">
                Featured stays <span className="text-sm font-normal text-charcoal/40">({filtered.length})</span>
              </h2>
            </div>
            {(checkIn || checkOut || guestsRaw) && (
              <div className="flex gap-3 text-xs text-charcoal/50 bg-soft rounded-xl px-3 py-2 border border-soft-200">
                {checkIn && <span>📅 {checkIn}</span>}
                {checkOut && <span>→ {checkOut}</span>}
                {guestsRaw && <span>👥 {guestsRaw} guests</span>}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-16 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-semibold text-navy">No stays found</p>
              <p className="mt-1 text-sm text-charcoal/45">Try different search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((stay) => (
                <div key={stay.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl">
                    <span>{stay.emoji}</span>
                    <div className="absolute right-2 top-2">
                      <SaveButton
                        id={stay.id}
                        onToggle={(saved) =>
                          setSavedIds((prev) => {
                            const next = new Set(prev);
                            saved ? next.add(stay.id) : next.delete(stay.id);
                            return next;
                          })
                        }
                        className="rounded-lg bg-white/80 shadow-sm"
                      />
                    </div>
                    <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-2.5 py-1 text-[10px] font-bold text-white">
                      {stay.type}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-navy">{stay.name}</h3>
                        <p className="text-sm text-charcoal/55">{stay.city}, {stay.country}</p>
                      </div>
                      <span className="text-xs font-semibold text-gold">{"★".repeat(stay.stars ?? 5)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {stay.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="chip text-[10px]">{a}</span>
                      ))}
                      {stay.amenities.length > 3 && (
                        <span className="chip text-[10px]">+{stay.amenities.length - 3} more</span>
                      )}
                    </div>
                    <div className="mt-5 flex items-end justify-between border-t border-soft-200 pt-4">
                      <div>
                        <p className="text-lg font-extrabold text-navy">{stay.pricePerNight}</p>
                        <p className="text-xs text-charcoal/45">per night</p>
                      </div>
                      <button
                        onClick={() => setModalStay(stay)}
                        className="btn-blue px-4 py-2 text-sm"
                      >
                        Book stay
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

      <CTASection
        title="Host your property on Globe Travel Voyage"
        subtitle="List houses, apartments and travel stays, capture leads and manage bookings from your host dashboard."
        primary={{ label: "Become a host", href: "/register?role=host" }}
        secondary={{ label: "Browse properties", href: "/properties" }}
      />

      <ContactModal
        open={!!modalStay}
        onClose={() => setModalStay(null)}
        mode="book_stay"
        subjectName={modalStay?.name}
        subjectMeta={modalStay ? `${modalStay.city}, ${modalStay.country} · ${modalStay.pricePerNight}/night` : undefined}
      />
    </>
  );
}
