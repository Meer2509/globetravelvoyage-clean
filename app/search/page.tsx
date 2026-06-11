"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Stars } from "@/components/Stars";
import { agents, tours, stays, tickets, visas } from "@/lib/data";

const CATEGORIES = [
  { key: "all",    label: "All results", emoji: "🔍" },
  { key: "visa",   label: "Visa guides",  emoji: "🛂" },
  { key: "agents", label: "Experts",      emoji: "👔" },
  { key: "tours",  label: "Tours",        emoji: "🗺️" },
  { key: "hotels", label: "Stays",        emoji: "🏨" },
  { key: "tickets", label: "Tickets",     emoji: "🎟️" },
] as const;

type Category = (typeof CATEGORIES)[number]["key"];

function SearchContent() {
  const params         = useSearchParams();
  const initialQuery   = params.get("q") ?? "";
  const [query, setQuery]   = useState(initialQuery);
  const [input, setInput]   = useState(initialQuery);
  const [category, setCategory] = useState<Category>("all");

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(input);
    setCategory("all");
  }

  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return { visa: [], agents: [], tours: [], hotels: [], tickets: [] };
    return {
      visa:    visas.filter((v) => v.country.toLowerCase().includes(q) || v.type.toLowerCase().includes(q) || v.summary.toLowerCase().includes(q)),
      agents:  agents.filter((a) => a.name.toLowerCase().includes(q) || a.specialties.some((s) => s.toLowerCase().includes(q)) || a.countries.some((c) => c.toLowerCase().includes(q)) || a.location.toLowerCase().includes(q)),
      tours:   tours.filter((t) => t.title.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.country.toLowerCase().includes(q)),
      hotels:  stays.filter((s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)),
      tickets: tickets.filter((t) => t.attraction.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)),
    };
  }, [q]);

  const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  const shown = {
    visa:    category === "all" || category === "visa"    ? results.visa    : [],
    agents:  category === "all" || category === "agents"  ? results.agents  : [],
    tours:   category === "all" || category === "tours"   ? results.tours   : [],
    hotels:  category === "all" || category === "hotels"  ? results.hotels  : [],
    tickets: category === "all" || category === "tickets" ? results.tickets : [],
  };

  return (
    <div className="min-h-screen bg-soft/30">
      {/* Search header */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <h1 className="text-2xl font-extrabold text-white mb-4">Search Globe Travel Voyage</h1>
          <form onSubmit={doSearch} className="flex gap-2 max-w-2xl">
            <input
              className="input flex-1 text-sm"
              placeholder="Visa, destination, expert, tour, attraction…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-gold px-6 py-3 shrink-0">Search</button>
          </form>
        </div>
      </div>

      <div className="container-px py-8">
        {query && (
          <div className="mb-4 text-sm text-charcoal/50">
            {totalCount} result{totalCount !== 1 ? "s" : ""} for <strong className="text-navy">&quot;{query}&quot;</strong>
          </div>
        )}

        {/* Category tabs */}
        {query && (
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const count = c.key === "all" ? totalCount
                : c.key === "visa" ? results.visa.length
                : c.key === "agents" ? results.agents.length
                : c.key === "tours" ? results.tours.length
                : c.key === "hotels" ? results.hotels.length
                : results.tickets.length;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                    category === c.key
                      ? "border-blue bg-blue text-white"
                      : "border-soft-200 bg-white text-charcoal/60 hover:border-navy/30 hover:text-navy"
                  }`}
                >
                  {c.emoji} {c.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Empty / no query state */}
        {!query && (
          <div className="py-16 text-center">
            <span className="text-6xl">🔍</span>
            <p className="mt-4 text-xl font-bold text-navy">Search everything</p>
            <p className="mt-2 text-charcoal/50">Try &quot;USA visa&quot;, &quot;Dubai tours&quot;, &quot;Burj Khalifa&quot;, or a visa expert name.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["USA visa", "Dubai tours", "Pakistan to USA", "Budget hotels Dubai", "Burj Khalifa tickets"].map((s) => (
                <button key={s} onClick={() => { setInput(s); setQuery(s); }} className="chip hover:border-blue/40 hover:text-navy cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && totalCount === 0 && (
          <div className="py-16 text-center">
            <span className="text-6xl">🤷</span>
            <p className="mt-4 text-xl font-bold text-navy">No results for &quot;{query}&quot;</p>
            <p className="mt-2 text-charcoal/50">Try a different search or explore our categories below.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[{label:"Visa guides", href:"/visa"},{label:"Find experts",href:"/agents"},{label:"Tours",href:"/tours"},{label:"Hotels",href:"/hotels"}].map((l) => (
                <Link key={l.href} href={l.href} className="btn-outline py-2 px-5 text-sm">{l.label}</Link>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Visa results */}
          {shown.visa.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-extrabold text-navy">🛂 Visa guides ({shown.visa.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.visa.map((v) => (
                  <Link key={v.slug} href={`/visa/${v.slug}`} className="card card-hover flex flex-col p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{v.flag}</span>
                      <div>
                        <p className="font-bold text-navy text-sm">{v.type}</p>
                        <p className="text-xs text-charcoal/50">{v.country} · {v.category}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-charcoal/55 line-clamp-2">{v.summary}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-charcoal/40">From {v.feeFrom}</span>
                      <span className="font-semibold text-blue">View guide →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Agents results */}
          {shown.agents.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-extrabold text-navy">👔 Visa experts ({shown.agents.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {shown.agents.map((a) => (
                  <Link key={a.id} href="/agents" className="card card-hover flex flex-col p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-bold text-gold">{a.initials}</span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-navy text-sm">{a.name}</p>
                        <p className="truncate text-xs text-charcoal/50">{a.title}</p>
                      </div>
                    </div>
                    <div className="mt-2"><Stars rating={a.rating} reviews={a.reviews} /></div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.specialties.slice(0, 2).map((s) => <span key={s} className="chip text-[10px]">{s}</span>)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tours results */}
          {shown.tours.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-extrabold text-navy">🗺️ Tours ({shown.tours.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.tours.map((t) => (
                  <Link key={t.id} href="/tours" className="card card-hover flex items-start gap-3 p-4">
                    <span className="text-3xl">{t.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-navy text-sm">{t.title}</p>
                      <p className="text-xs text-charcoal/50">{t.city}, {t.country} · {t.duration}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <Stars rating={t.rating} reviews={t.reviews} />
                        <span className="text-sm font-bold text-navy">{t.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Hotels results */}
          {shown.hotels.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-extrabold text-navy">🏨 Stays ({shown.hotels.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.hotels.map((s) => (
                  <Link key={s.id} href="/hotels" className="card card-hover flex items-start gap-3 p-4">
                    <span className="text-3xl">{s.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-navy text-sm">{s.name}</p>
                      <p className="text-xs text-charcoal/50">{s.city}, {s.country} · {s.type}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <Stars rating={s.rating} reviews={s.reviews} />
                        <span className="text-sm font-bold text-navy">{s.pricePerNight}<span className="text-xs text-charcoal/40">/night</span></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tickets results */}
          {shown.tickets.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-extrabold text-navy">🎟️ Attraction tickets ({shown.tickets.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {shown.tickets.map((t) => (
                  <Link key={t.id} href="/tickets" className="card card-hover flex items-start gap-3 p-4">
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <p className="font-bold text-navy text-xs">{t.attraction}</p>
                      <p className="text-[10px] text-charcoal/50">{t.city}</p>
                      <p className="mt-1 text-sm font-extrabold text-navy">{t.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-charcoal/40">Loading…</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
