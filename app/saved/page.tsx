"use client";

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/Stars";

const TABS = [
  { key: "tours",   label: "Tours",    emoji: "🗺️" },
  { key: "hotels",  label: "Stays",    emoji: "🏨" },
  { key: "agents",  label: "Experts",  emoji: "👔" },
  { key: "tickets", label: "Tickets",  emoji: "🎟️" },
] as const;
type Tab = (typeof TABS)[number]["key"];

// Mock saved items
const MOCK_SAVED = {
  tours: [
    { id: "t1", title: "Old Dubai Heritage Walk",        city: "Dubai",    emoji: "🕌", price: "$45",  rating: 4.9, reviews: 234, duration: "4 hours" },
    { id: "t2", title: "Desert Safari — Evening BBQ",    city: "Dubai",    emoji: "🏜️", price: "$55",  rating: 4.8, reviews: 512, duration: "6 hours" },
    { id: "t3", title: "Bosphorus Sunset Cruise",        city: "Istanbul", emoji: "⛵", price: "$38",  rating: 4.7, reviews: 178, duration: "2 hours" },
  ],
  hotels: [
    { id: "h1", name: "Atlantis, The Palm",  city: "Dubai",    emoji: "🏝️", price: "$450", rating: 4.9, reviews: 3241, type: "Resort" },
    { id: "h2", name: "Karachi Marriott",    city: "Karachi",  emoji: "🏨", price: "$120", rating: 4.5, reviews: 892,  type: "Hotel"  },
  ],
  agents: [
    { id: "a1", name: "Sana Malik",   title: "Senior Visa Consultant", initials: "SM", rating: 4.9, reviews: 312, specialties: ["USA B1/B2", "UK Visitor"] },
    { id: "a2", name: "Omar Haddad",  title: "Visa & Immigration Advisor", initials: "OH", rating: 4.8, reviews: 204, specialties: ["Canada", "Schengen"] },
  ],
  tickets: [
    { id: "tk1", attraction: "Burj Khalifa — Top deck", city: "Dubai", emoji: "🌆", price: "$42", skipLine: true },
    { id: "tk2", attraction: "Dubai Frame",              city: "Dubai", emoji: "🖼️", price: "$15", skipLine: false },
  ],
};

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tours");
  const [saved, setSaved] = useState(() => ({
    tours:   MOCK_SAVED.tours.map((t) => t.id),
    hotels:  MOCK_SAVED.hotels.map((h) => h.id),
    agents:  MOCK_SAVED.agents.map((a) => a.id),
    tickets: MOCK_SAVED.tickets.map((t) => t.id),
  }));

  function remove(tab: Tab, id: string) {
    setSaved((prev) => ({ ...prev, [tab]: prev[tab].filter((i) => i !== id) }));
  }

  const tours   = MOCK_SAVED.tours.filter((t) => saved.tours.includes(t.id));
  const hotels  = MOCK_SAVED.hotels.filter((h) => saved.hotels.includes(h.id));
  const agents  = MOCK_SAVED.agents.filter((a) => saved.agents.includes(a.id));
  const tickets = MOCK_SAVED.tickets.filter((t) => saved.tickets.includes(t.id));

  const totalSaved = tours.length + hotels.length + agents.length + tickets.length;

  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/dashboard/customer" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Dashboard
          </Link>
          <span className="eyebrow-white mb-3">Saved</span>
          <h1 className="text-3xl font-extrabold text-white">Your saved items</h1>
          <p className="mt-2 text-white/60 text-sm">{totalSaved} saved item{totalSaved !== 1 ? "s" : ""} across all categories.</p>
        </div>
      </div>

      <div className="container-px py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 w-fit rounded-xl bg-white border border-soft-200 p-1 shadow-sm">
          {TABS.map((tab) => {
            const count = tab.key === "tours" ? tours.length : tab.key === "hotels" ? hotels.length : tab.key === "agents" ? agents.length : tickets.length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-navy text-white shadow-sm"
                    : "text-charcoal/50 hover:text-navy"
                }`}
              >
                {tab.emoji} {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Tours */}
        {activeTab === "tours" && (
          tours.length === 0 ? <Empty category="tours" href="/tours" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t) => (
                <div key={t.id} className="card flex flex-col overflow-hidden">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl relative">
                    <span>{t.emoji}</span>
                    <button onClick={() => remove("tours", t.id)} className="absolute right-2 top-2 rounded-lg bg-white/80 p-1.5 text-red-400 hover:bg-red-50" title="Remove">♥</button>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-navy text-sm">{t.title}</h3>
                    <p className="text-xs text-charcoal/50">{t.city} · {t.duration}</p>
                    <div className="mt-1"><Stars rating={t.rating} reviews={t.reviews} /></div>
                    <div className="mt-3 flex items-center justify-between border-t border-soft-200 pt-3">
                      <span className="font-extrabold text-navy">{t.price}<span className="text-xs text-charcoal/40">/person</span></span>
                      <Link href="/booking/request" className="btn-blue px-3 py-1.5 text-xs">Book tour</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Hotels */}
        {activeTab === "hotels" && (
          hotels.length === 0 ? <Empty category="stays" href="/hotels" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((h) => (
                <div key={h.id} className="card flex flex-col overflow-hidden">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-5xl relative">
                    <span>{h.emoji}</span>
                    <button onClick={() => remove("hotels", h.id)} className="absolute right-2 top-2 rounded-lg bg-white/80 p-1.5 text-red-400 hover:bg-red-50">♥</button>
                    <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-2 py-0.5 text-[10px] font-bold text-white">{h.type}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-navy text-sm">{h.name}</h3>
                    <p className="text-xs text-charcoal/50">{h.city}</p>
                    <div className="mt-1"><Stars rating={h.rating} reviews={h.reviews} /></div>
                    <div className="mt-3 flex items-center justify-between border-t border-soft-200 pt-3">
                      <span className="font-extrabold text-navy">{h.price}<span className="text-xs text-charcoal/40">/night</span></span>
                      <Link href="/booking/request" className="btn-blue px-3 py-1.5 text-xs">Book stay</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Agents */}
        {activeTab === "agents" && (
          agents.length === 0 ? <Empty category="experts" href="/agents" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {agents.map((a) => (
                <div key={a.id} className="card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-base font-bold text-gold">{a.initials}</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-navy">{a.name}</p>
                      <p className="truncate text-xs text-charcoal/50">{a.title}</p>
                    </div>
                    <button onClick={() => remove("agents", a.id)} className="shrink-0 text-red-400 hover:text-red-600">♥</button>
                  </div>
                  <div className="mt-2"><Stars rating={a.rating} reviews={a.reviews} /></div>
                  <div className="mt-2 flex flex-wrap gap-1">{a.specialties.slice(0, 2).map((s) => <span key={s} className="chip text-[10px]">{s}</span>)}</div>
                  <Link href="/lead/contact" className="btn-outline mt-4 w-full py-2 text-xs text-center block">Contact expert</Link>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tickets */}
        {activeTab === "tickets" && (
          tickets.length === 0 ? <Empty category="tickets" href="/tickets" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tickets.map((t) => (
                <div key={t.id} className="card flex flex-col overflow-hidden">
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-soft to-soft-200 text-4xl relative">
                    <span>{t.emoji}</span>
                    <button onClick={() => remove("tickets", t.id)} className="absolute right-2 top-2 rounded-lg bg-white/80 p-1.5 text-red-400 hover:bg-red-50">♥</button>
                    {t.skipLine && <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">Skip line</span>}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-navy text-xs">{t.attraction}</p>
                    <p className="text-[10px] text-charcoal/50">{t.city}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-soft-200 pt-3">
                      <span className="font-extrabold text-navy text-sm">{t.price}</span>
                      <Link href="/booking/request" className="btn-blue px-3 py-1.5 text-xs">Get tickets</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ category, href }: { category: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 py-20 text-center">
      <span className="text-5xl mb-4">♡</span>
      <p className="font-semibold text-navy">No saved {category} yet</p>
      <p className="mt-2 text-sm text-charcoal/45">Browse listings and tap the heart icon to save.</p>
      <Link href={href} className="btn-primary mt-5 py-2.5 px-6">Browse {category}</Link>
    </div>
  );
}
