"use client";

import { useState, useMemo } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { SaveButton } from "@/components/SaveButton";
import { ContactModal, type ContactMode } from "@/components/ContactModal";
import { cruises, type Cruise } from "@/lib/data";
import Link from "next/link";

const TYPE_CHIPS: string[] = ["Cruise", "Yacht", "Boat", "Ferry", "Day charter", "Multi-night"];

const FAQS = [
  { q: "What is included in cruise packages?",   a: "Inclusions vary by cruise — typically meals, accommodation, and select excursions. Always check the provider's terms for what is and isn't included." },
  { q: "Can I book a private yacht charter?",    a: "Yes. Filter by 'Yacht' or 'Day charter' and submit a booking request. Private charters are confirmed subject to availability and minimum group sizes." },
  { q: "Are prices per person or total?",        a: "Prices shown are the starting price (from) and may be per person or for the full vessel. The provider will confirm exact pricing in their response." },
  { q: "Is Globe Travel Voyage a cruise line?",  a: "No. Globe Travel Voyage is an independent marketplace connecting travelers with third-party cruise and boat providers. We are not a cruise line or travel supplier." },
];

export default function CruisesPage() {
  const [regionFilter, setRegion] = useState("");
  const [chips, setChips]         = useState<string[]>([]);
  const [savedIds, setSaved]       = useState<string[]>([]);
  const [modal, setModal]         = useState<{ open: boolean; mode: ContactMode; name: string } | null>(null);

  function openModal(c: Cruise) {
    setModal({ open: true, mode: "book_tour", name: `${c.name} — ${c.region}` });
  }

  function handleSearch(values: Record<string, string>, selectedChips: string[]) {
    setRegion(values[Object.keys(values)[0]] ?? "");
    setChips(selectedChips);
  }

  const filtered = useMemo(() => {
    return cruises.filter((c) => {
      if (regionFilter && !c.region.toLowerCase().includes(regionFilter.toLowerCase()) &&
          !c.name.toLowerCase().includes(regionFilter.toLowerCase())) return false;
      const dayCharter = chips.includes("Day charter");
      const multiNight = chips.includes("Multi-night");
      if (dayCharter && c.nights !== 0) return false;
      if (multiNight && c.nights === 0) return false;
      const typeChips = chips.filter((ch) => ["Cruise", "Yacht", "Boat", "Ferry"].includes(ch));
      if (typeChips.length > 0 && !typeChips.includes(c.type)) return false;
      return true;
    });
  }, [regionFilter, chips]);

  return (
    <>
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-px">
          <nav className="mb-4 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Cruises</span>
          </nav>
          <span className="eyebrow-white mb-3">On the water</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Cruises, boats & yacht charters</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Ocean cruises, river boats, coastal ferries, and private yacht charters across the Gulf, Mediterranean, Egypt, and Southeast Asia.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/50">
            <span>✅ Gulf & Mediterranean routes</span>
            <span>✅ Private yacht charters</span>
            <span>✅ Day trips & multi-night</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="container-px">
        <FilterBar
          fields={[
            { placeholder: "Region or port", type: "text" },
            { placeholder: "Departure date", type: "date" },
            { placeholder: "Number of guests", type: "text" },
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
            eyebrow="Set sail"
            title={regionFilter || chips.length ? `${filtered.length} cruise${filtered.length !== 1 ? "s" : ""} found` : "Featured cruises & charters"}
            subtitle="From Gulf day trips to multi-night ocean voyages. Request a booking and get confirmation within 24 hours."
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-20 text-center">
              <span className="text-5xl mb-4">🛳️</span>
              <p className="font-semibold text-navy">No cruises match your filters</p>
              <p className="mt-2 text-sm text-charcoal/45">Try removing filters or searching a different region.</p>
              <button onClick={() => { setRegion(""); setChips([]); }} className="btn-primary mt-5 py-2.5 px-6">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cruise) => (
                <div key={cruise.id} className="card card-hover flex flex-col overflow-hidden">
                  <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-blue/5 to-soft-200 text-6xl">
                    <span>{cruise.emoji}</span>
                    <div className="absolute right-3 top-3">
                      <SaveButton id={cruise.id} onToggle={(s) => setSaved((p) => s ? [...p, cruise.id] : p.filter((i) => i !== cruise.id))} defaultSaved={savedIds.includes(cruise.id)} />
                    </div>
                    <span className="absolute left-3 top-3 rounded-full bg-navy/70 px-2 py-0.5 text-[10px] font-bold text-white">{cruise.type}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-navy">{cruise.name}</h3>
                        <p className="text-sm text-charcoal/55">{cruise.region}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-charcoal/40">from</p>
                        <p className="text-lg font-extrabold text-navy">{cruise.priceFrom}</p>
                        <p className="text-xs text-charcoal/40">{cruise.nights > 0 ? `${cruise.nights} nights` : "Day charter"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cruise.highlights.map((h) => <span key={h} className="chip">{h}</span>)}
                    </div>
                    <button onClick={() => openModal(cruise)} className="btn-primary mt-4 w-full py-2.5 text-sm">Book this cruise</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8"><Disclaimer variant="compact" /></div>
        </div>
      </section>

      {/* Why book section */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader eyebrow="Why Globe Travel Voyage" title="Cruise smarter" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: "🛡️", title: "Verified providers",  desc: "All cruise and boat operators are identity-checked and reviewed." },
              { icon: "🤝", title: "No upfront payment",  desc: "Submit a booking request. Payment is arranged directly with the provider." },
              { icon: "🤖", title: "AI trip planner",     desc: "Let AI build your full itinerary including the best cruise or boat for your trip." },
            ].map((b) => (
              <div key={b.title} className="card p-6 text-center">
                <span className="text-3xl">{b.icon}</span>
                <h3 className="mt-3 font-bold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm text-charcoal/55">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-px max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Cruise booking questions" />
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
        title="Ready to set sail?"
        subtitle="Browse verified cruise and boat providers — from Gulf day trips to Mediterranean voyages."
        primary={{ label: "Browse all cruises", href: "/cruises" }}
        secondary={{ label: "Plan full trip", href: "/ai-trip-planner" }}
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
