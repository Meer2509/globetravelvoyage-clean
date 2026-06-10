"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { stats, aiPrompts } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "flights" | "hotels" | "visa" | "cruises" | "tours" | "rentals" | "ai";

interface AiResult {
  prompt: string;
  response: string;
}

// ─── AI response logic ────────────────────────────────────────────────────────

function getAiResponse(q: string): string {
  const lq = q.toLowerCase();
  if (lq.includes("usa") || lq.includes("b1") || lq.includes("b2") || lq.includes("tourist visa"))
    return "For a USA B1/B2 visitor visa: DS-160 form ($185 fee), 6 months bank statements, employment letter and strong ties to home country. Processing: 3–12 weeks. Connect with a verified agent for the best preparation. Note: no platform guarantees visa approval.";
  if (lq.includes("dubai") || lq.includes("uae"))
    return "Dubai offers an easy e-visa for most South Asian passports. Flights from Pakistan start from $145. Stays at Dubai Marina from $120/night. I've drafted a 5-day Dubai itinerary — estimated budget $2,200 including flights, hotel and tours.";
  if (lq.includes("flight") || lq.includes("ticket") || lq.includes("cheap"))
    return "Cheapest routes this week: Dubai → Lahore from $145 ✈️, Riyadh → Karachi from $170, Abu Dhabi → Delhi from $130. For PK → USA, Turkish Airlines via IST from $720. Prices are estimates — confirm before booking.";
  if (lq.includes("europe") || lq.includes("switzerland") || lq.includes("schengen"))
    return "For Europe you'll need a Schengen visa (€90 fee). Apply at your main destination's consulate. Switzerland: flights from $640, 10-day budget ~$2,800–$3,500 with mid-range stays. I can draft a detailed Schengen itinerary.";
  if (lq.includes("cruise"))
    return "Top cruise picks: Arabian Gulf Explorer (4 nights from $420 all-inclusive), Mediterranean Jewel (7 nights from $890). For under $2,000 the Gulf cruise is perfect. Private Dubai Marina yacht charters from $300.";
  if (lq.includes("umrah") || lq.includes("hajj"))
    return "Umrah packages from Lahore: 10 nights from $1,650 including flights, 5★ hotel near Haram and visa. Verified agencies: Voyage Pro Travels and Orient Express Travel — both rated 4.8+ with group packages available.";
  if (lq.includes("student") || lq.includes("f-1") || lq.includes("f1"))
    return "For the US F-1 student visa you need: accepted I-20 form, SEVIS fee ($350), DS-160, financial proof and transcripts. Apply as soon as you receive your I-20. Processing: 4–10 weeks. Connect with Sana Malik — top student visa specialist.";
  if (lq.includes("london") || lq.includes("uk") || lq.includes("england"))
    return "UK Standard Visitor Visa: £115 fee, 3–6 weeks processing. Flights from Lahore from $580. London 7-day budget: $2,800–$4,500 depending on accommodation. Tip: book early for summer — July/August rates spike 40%.";
  if (lq.includes("hotel") || lq.includes("stay"))
    return "Best value luxury hotels: Dubai Marina — from $120/night, Istanbul Bosphorus view — from $85/night, Bangkok Sukhumvit — from $55/night, Kuala Lumpur Twin Towers area — from $65/night. I can filter by budget and dates.";
  if (lq.includes("budget") || lq.includes("cheap trip"))
    return "Top budget destinations from Middle East: Thailand (7 days ~$1,200), Malaysia (7 days ~$950), Georgia (5 days ~$800), Egypt (5 days ~$700). I can create a full itinerary with flights, hotels and tours for any of these.";
  return `Great question about "${q}". I can help with visas, flights, hotels, cruises, car rentals, local tours, properties and full AI trip planning. Try asking about specific destinations, visa requirements, or budget options for maximum results. (Demo assistant — sample answers only.)`;
}

// ─── Tab search forms ─────────────────────────────────────────────────────────

function FlightsForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">From</label>
          <input className="input-dark" placeholder="Dubai (DXB)" />
        </div>
        <div>
          <label className="label-dark">To</label>
          <input className="input-dark" placeholder="Lahore (LHE), New York (JFK)..." />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label-dark">Departure</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Return</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Passengers</label>
          <select className="input-dark">
            <option>1 Adult</option>
            <option>2 Adults</option>
            <option>2 Adults + 1 Child</option>
            <option>2 Adults + 2 Children</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/flights" className="btn-gold flex-1 py-3">
          <Icon name="sparkles" className="h-4 w-4" />
          Search Flights
        </Link>
        <Link href="/trip-planner" className="btn border border-white/20 px-5 py-3 text-white hover:bg-white/10">
          Plan with AI
        </Link>
      </div>
    </div>
  );
}

function HotelsForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div>
        <label className="label-dark">Destination</label>
        <input className="input-dark" placeholder="Dubai, Istanbul, Bangkok, London..." />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label-dark">Check-in</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Check-out</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Guests</label>
          <select className="input-dark">
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3–4 Guests</option>
            <option>5+ Guests</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/hotels" className="btn-gold flex-1 py-3">Search Hotels</Link>
        <select className="input-dark w-auto">
          <option>Any star rating</option>
          <option>5 stars</option>
          <option>4+ stars</option>
          <option>Budget</option>
        </select>
      </div>
    </div>
  );
}

function VisaForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Your Nationality / Passport</label>
          <select className="input-dark">
            <option>🇵🇰 Pakistani</option>
            <option>🇮🇳 Indian</option>
            <option>🇵🇭 Filipino</option>
            <option>🇧🇩 Bangladeshi</option>
            <option>🇪🇬 Egyptian</option>
            <option>🇳🇬 Nigerian</option>
            <option>🇵🇰 Other</option>
          </select>
        </div>
        <div>
          <label className="label-dark">Destination Country</label>
          <select className="input-dark">
            <option>🇺🇸 United States</option>
            <option>🇬🇧 United Kingdom</option>
            <option>🇨🇦 Canada</option>
            <option>🇪🇺 Schengen Zone</option>
            <option>🇦🇪 UAE</option>
            <option>🇸🇦 Saudi Arabia</option>
            <option>🇦🇺 Australia</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label-dark">Purpose of visit</label>
        <select className="input-dark">
          <option>Tourism / Holiday</option>
          <option>Business</option>
          <option>Study / University</option>
          <option>Work</option>
          <option>Family visit</option>
          <option>Medical treatment</option>
        </select>
      </div>
      <Link href="/visa" className="btn-gold py-3 text-center">
        <Icon name="visa" className="h-4 w-4" />
        Check Visa Requirements
      </Link>
      <p className="text-center text-xs text-white/35">Visa approval is never guaranteed. Globe TV is not an immigration authority.</p>
    </div>
  );
}

function CruisesForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Region</label>
          <select className="input-dark">
            <option>Arabian Gulf</option>
            <option>Mediterranean</option>
            <option>Indian Ocean</option>
            <option>Southeast Asia</option>
            <option>Caribbean</option>
          </select>
        </div>
        <div>
          <label className="label-dark">Duration</label>
          <select className="input-dark">
            <option>2–4 nights</option>
            <option>5–7 nights</option>
            <option>8–14 nights</option>
            <option>15+ nights</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Departure date</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Guests</label>
          <select className="input-dark">
            <option>2 guests</option>
            <option>3–4 guests</option>
            <option>5–8 guests</option>
            <option>Private yacht</option>
          </select>
        </div>
      </div>
      <Link href="/cruises" className="btn-gold py-3">Browse Cruises & Yachts</Link>
    </div>
  );
}

function ToursForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Destination / City</label>
          <input className="input-dark" placeholder="Dubai, Istanbul, Bangkok..." />
        </div>
        <div>
          <label className="label-dark">Category</label>
          <select className="input-dark">
            <option>All experiences</option>
            <option>City tours</option>
            <option>Adventure & nature</option>
            <option>Food & culture</option>
            <option>Desert safaris</option>
            <option>Water sports</option>
            <option>Night experiences</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Date</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Group size</label>
          <select className="input-dark">
            <option>1–2 people</option>
            <option>3–5 people</option>
            <option>6–10 people</option>
            <option>Private group</option>
          </select>
        </div>
      </div>
      <Link href="/tours" className="btn-gold py-3">Find Local Experiences</Link>
    </div>
  );
}

function RentalsForm() {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">City / Location</label>
          <input className="input-dark" placeholder="Dubai, Karachi, Manila..." />
        </div>
        <div>
          <label className="label-dark">Type</label>
          <select className="input-dark">
            <option>Short stay (nightly)</option>
            <option>Monthly furnished rental</option>
            <option>Long-term lease</option>
            <option>Villa / vacation home</option>
            <option>Buy / invest</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Move-in / Check-in</label>
          <input className="input-dark" type="date" />
        </div>
        <div>
          <label className="label-dark">Budget (per month)</label>
          <select className="input-dark">
            <option>Under $500</option>
            <option>$500 – $1,200</option>
            <option>$1,200 – $2,500</option>
            <option>$2,500+</option>
          </select>
        </div>
      </div>
      <Link href="/properties" className="btn-gold py-3">Search Properties</Link>
    </div>
  );
}

// ─── AI Planner form (existing logic, upgraded UI) ────────────────────────────

function AiPlannerForm() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);

  function submit(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({ prompt: q, response: getAiResponse(q) });
      setLoading(false);
    }, 900);
  }

  return (
    <div className="p-4 sm:p-5">
      <form onSubmit={(e) => { e.preventDefault(); submit(query); }} className="flex gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy">
          <Icon name="sparkles" className="h-5 w-5" />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: "10 days Japan for $3,000" or "USA visa from Pakistan" or "Dubai 5 days family trip"'
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-gold shrink-0 px-5 py-2.5 text-sm disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Planning…
            </span>
          ) : (
            <>
              <Icon name="sparkles" className="h-4 w-4" />
              Ask AI
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-4 animate-tab-slide rounded-xl border border-gold/20 bg-white/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gold">Globe AI Response</p>
          <p className="text-sm leading-relaxed text-white/85">{result.response}</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-white/35">Sample answers — prices never guaranteed.</p>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-white/40 hover:text-white/60"
            >
              Clear ×
            </button>
          </div>
        </div>
      )}

      {!result && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {aiPrompts.slice(0, 4).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setQuery(p); submit(p); }}
              className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/70 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const tabs: { id: TabId; label: string; emoji: string; href: string }[] = [
  { id: "flights", label: "Flights", emoji: "✈️", href: "/flights" },
  { id: "hotels", label: "Hotels", emoji: "🏨", href: "/hotels" },
  { id: "visa", label: "Visa", emoji: "🛂", href: "/visa" },
  { id: "cruises", label: "Cruises", emoji: "🚢", href: "/cruises" },
  { id: "tours", label: "Tours", emoji: "🎯", href: "/tours" },
  { id: "rentals", label: "Rentals", emoji: "🏠", href: "/properties" },
  { id: "ai", label: "AI Planner", emoji: "✨", href: "/trip-planner" },
];

const tabForms: Record<TabId, React.ReactNode> = {
  flights: <FlightsForm />,
  hotels: <HotelsForm />,
  visa: <VisaForm />,
  cruises: <CruisesForm />,
  tours: <ToursForm />,
  rentals: <RentalsForm />,
  ai: <AiPlannerForm />,
};

export function Hero() {
  const [activeTab, setActiveTab] = useState<TabId>("ai");

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -left-48 -top-24 h-[600px] w-[600px] rounded-full bg-blue/25 blur-[120px] opacity-60" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[450px] w-[450px] rounded-full bg-gold/15 blur-[100px] opacity-50" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[700px] rounded-full bg-blue/10 blur-[80px]" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating decorations */}
      <div className="pointer-events-none absolute right-[6%] top-[8%] hidden text-6xl lg:block animate-float opacity-20">✈️</div>
      <div className="pointer-events-none absolute right-[14%] bottom-[15%] hidden text-5xl lg:block animate-float-med opacity-15" style={{ animationDelay: "1.5s" }}>🌍</div>
      <div className="pointer-events-none absolute left-[4%] bottom-[20%] hidden text-4xl lg:block animate-float opacity-10" style={{ animationDelay: "3s" }}>🗺️</div>
      <div className="pointer-events-none absolute left-[8%] top-[20%] hidden text-3xl xl:block animate-float-med opacity-15" style={{ animationDelay: "2s" }}>🛂</div>

      <div className="container-px relative py-16 sm:py-20 lg:py-28">
        {/* Top badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI-First Global Travel Operating System
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-7 max-w-5xl text-center h-hero text-white">
          Your AI Travel Command Center for{" "}
          <span className="text-gradient-gold">Visas</span>,{" "}
          <span className="text-blue-light">Flights</span>
          , Tours, Luxury Stays &{" "}
          <span className="text-gradient-gold">Global Journeys.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-white/65 sm:text-lg">
          Plan smarter, travel cheaper, apply confidently. Search flights, check visa requirements,
          compare hotels, book tours, find properties and get AI-powered trip planning — all in one place.
        </p>

        {/* ── Tabbed Search ── */}
        <div className="mx-auto mt-10 max-w-4xl">
          {/* Tab bar */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-t-2xl border border-b-0 border-white/12 bg-white/6 px-2 pt-2 backdrop-blur-md scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/15 text-white shadow-[0_-2px_0_0_#C9A227_inset]"
                    : "text-white/50 hover:bg-white/8 hover:text-white/80"
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search panel */}
          <div className="overflow-hidden rounded-b-2xl rounded-tr-2xl border border-white/12 bg-white/8 backdrop-blur-md shadow-[0_24px_60px_-12px_rgba(8,28,58,0.7)]">
            <div className="animate-tab-slide" key={activeTab}>
              {tabForms[activeTab]}
            </div>
          </div>
        </div>

        {/* Quick nav links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {[
            { label: "🇵🇰→🇺🇸 PK to USA Guide", href: "/visa/usa-from-pakistan" },
            { label: "🎯 Dubai Tours", href: "/tours" },
            { label: "🛳️ Gulf Cruises", href: "/cruises" },
            { label: "✈️ Cheap flights", href: "/flights" },
            { label: "🏠 Rentals", href: "/properties" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs text-white/60 transition-all hover:border-gold/30 hover:text-gold backdrop-blur-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45">
          {[
            { icon: "shield" as const, label: "Verified providers" },
            { icon: "check" as const, label: "No visa approval guarantee" },
            { icon: "globe" as const, label: "190+ countries" },
            { icon: "sparkles" as const, label: "AI-powered guidance" },
          ].map((item, i) => (
            <span key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="mr-4 hidden sm:block h-px w-px rounded-full bg-white/30" />}
              <Icon name={item.icon} className="h-3.5 w-3.5 text-gold" />
              {item.label}
            </span>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm transition-all duration-300 hover:border-gold/20 hover:bg-white/8"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-1 text-2xl font-extrabold text-gold sm:text-3xl">{s.value}</p>
              <p className="mt-0.5 text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
