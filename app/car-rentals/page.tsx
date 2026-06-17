"use client";

import { useState, useMemo } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { SaveButton } from "@/components/SaveButton";
import { SampleCatalogBanner } from "@/components/SampleCatalogBanner";
import { PriceEstimateLabel } from "@/components/PriceEstimateLabel";
import { ContactModal, type ContactMode } from "@/components/ContactModal";
import { useCatalog } from "@/lib/catalog/context";
import type { CarRental } from "@/lib/data";
import Link from "next/link";

const TYPE_CHIPS: string[] = ["Economy", "SUV", "Luxury", "Van", "With driver", "Self-drive"];

const FAQS = [
  { q: "Do I need an international driving permit?",     a: "Requirements vary by country. Many countries accept your home-country license for short stays. Always check locally before renting." },
  { q: "Is car rental insurance included?",              a: "Basic insurance is typically included. Full coverage (CDW/LDW) is optional extra. Review the provider's terms before confirming." },
  { q: "Can I rent a car with a driver?",                a: "Yes — many providers offer chauffeur-driven options. Filter by 'With driver' to see those listings." },
  { q: "Are prices shown final?",                        a: "No. Live pricing is not displayed on browse pages. Request a custom quote — a Globe Travel Voyage specialist will review your request before booking." },
];

export default function CarRentalsPage() {
  const { cars } = useCatalog();
  const [query, setQuery]       = useState("");
  const [cityFilter, setCity]   = useState("");
  const [chips, setChips]       = useState<string[]>([]);
  const [savedIds, setSaved]     = useState<string[]>([]);
  const [modal, setModal]       = useState<{ open: boolean; mode: ContactMode; name: string } | null>(null);

  function openModal(car: CarRental) {
    setModal({ open: true, mode: "buy_ticket", name: `${car.model} — ${car.city}` });
  }

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setCity(values[Object.keys(values)[0]] ?? "");
    setChips(selectedChips);
    setQuery((values[Object.keys(values)[0]] ?? "").toLowerCase());
  }

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (cityFilter && !c.city.toLowerCase().includes(cityFilter.toLowerCase()) &&
          !c.model.toLowerCase().includes(cityFilter.toLowerCase()) &&
          !c.category.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (chips.includes("Automatic") && c.transmission !== "Automatic") return false;
      if (chips.includes("Manual") && c.transmission !== "Manual") return false;
      if (chips.includes("With driver") && !c.withDriver) return false;
      if (chips.includes("Self-drive") && c.withDriver) return false;
      if (chips.includes("Economy") && c.category !== "Economy") return false;
      if (chips.includes("SUV") && c.category !== "SUV") return false;
      if (chips.includes("Luxury") && c.category !== "Luxury") return false;
      if (chips.includes("Van") && c.category !== "Van") return false;
      return true;
    });
  }, [cityFilter, chips]);

  return (
    <>
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-px">
          <nav className="mb-4 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Car Rentals</span>
          </nav>
          <span className="eyebrow-white mb-3">Car rentals</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Self-drive & chauffeur rentals</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Economy hatchbacks to luxury sedans and vans — with or without a driver — across the Middle East, South Asia, and Southeast Asia.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/50">
            <span>✅ 90+ countries</span>
            <span>✅ Instant booking request</span>
            <span>✅ With driver available</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="container-px space-y-4">
        <SampleCatalogBanner />
        <FilterBar
          fields={[
            { placeholder: "City or car type", type: "text" },
            { placeholder: "Pick-up date", type: "date" },
            { placeholder: "Return date", type: "date" },
          ]}
          chips={TYPE_CHIPS}
          onSearch={handleSearch}
          className="shadow-[var(--shadow-premium)]"
        />
      </div>

      {/* Results */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Available now"
            title={query || chips.length ? `${filtered.length} car${filtered.length !== 1 ? "s" : ""} found` : "Featured cars"}
            subtitle="Illustrative daily rates. Request a verified quote — provider confirmation required."
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-20 text-center">
              <span className="text-5xl mb-4">🚗</span>
              <p className="font-semibold text-navy">No cars match your filters</p>
              <p className="mt-2 text-sm text-charcoal/45">Try removing some filters or searching a different city.</p>
              <button onClick={() => { setCity(""); setChips([]); setQuery(""); }} className="btn-primary mt-5 py-2.5 px-6">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((car) => (
                <div key={car.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-6xl">
                    <span>{car.emoji}</span>
                    <div className="absolute right-3 top-3">
                      <SaveButton id={car.id} onToggle={(s) => setSaved((p) => s ? [...p, car.id] : p.filter((i) => i !== car.id))} defaultSaved={savedIds.includes(car.id)} />
                    </div>
                    {car.withDriver && (
                      <span className="absolute left-3 top-3 rounded-full bg-blue/80 px-2 py-0.5 text-[10px] font-bold text-white">With driver</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-navy">{car.model}</h3>
                        <p className="text-sm text-charcoal/55">{car.category} · {car.city}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-navy">{car.pricePerDay}</p>
                        <PriceEstimateLabel className="mt-0.5" />
                        <p className="text-xs text-charcoal/40">per day</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="chip">{car.seats} seats</span>
                      <span className="chip">{car.transmission}</span>
                      <span className="chip">{car.withDriver ? "Chauffeur" : "Self-drive"}</span>
                    </div>
                    <button onClick={() => openModal(car)} className="btn-primary mt-4 w-full py-2.5 text-sm">Reserve this car</button>
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

      {/* Become a host CTA */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="card p-6">
              <span className="text-3xl">🏎️</span>
              <h3 className="mt-3 text-lg font-extrabold text-navy">Have a car to rent out?</h3>
              <p className="mt-2 text-sm text-charcoal/55">List your vehicle on Globe Travel Voyage and earn from verified travelers — with or without you as driver.</p>
              <Link href="/register?role=host" className="btn-primary mt-4 inline-block py-2.5 px-5 text-sm">List my vehicle</Link>
            </div>
            <div className="card p-6">
              <span className="text-3xl">🤖</span>
              <h3 className="mt-3 text-lg font-extrabold text-navy">AI trip planner</h3>
              <p className="mt-2 text-sm text-charcoal/55">Let our AI build your complete trip plan — including flights, hotel, car rental and tours — within your budget.</p>
              <Link href="/ai-trip-planner" className="btn-outline mt-4 inline-block py-2.5 px-5 text-sm">Plan my trip</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-px max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Car rental questions" />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <div key={f.q} className="card p-5">
                <p className="font-semibold text-navy text-sm">{f.q}</p>
                <p className="mt-2 text-sm text-charcoal/60 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to hit the road?"
        subtitle="Create a free account to save cars, track your bookings, and get AI trip recommendations."
        primary={{ label: "Get started free", href: "/register" }}
        secondary={{ label: "Plan my trip", href: "/ai-trip-planner" }}
      />

      {modal && (
        <ContactModal
          open={modal.open}
          onClose={() => setModal(null)}
          mode={modal.mode}
          subjectName={modal.name}
        />
      )}
    </>
  );
}
