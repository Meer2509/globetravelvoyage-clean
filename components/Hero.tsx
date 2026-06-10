"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { stats, aiPrompts } from "@/lib/data";

interface AiResult {
  prompt: string;
  response: string;
}

function getAiResponse(q: string): string {
  const lq = q.toLowerCase();
  if (lq.includes("usa") || lq.includes("tourist visa") || lq.includes("b1") || lq.includes("b2"))
    return "For a USA B1/B2 visitor visa, you'll need: DS-160 form, $185 consular fee, bank statements (6 months), employment letter and strong ties to your home country. Processing takes 3–12 weeks. Connect with a verified agent for the best preparation. Note: no platform guarantees visa approval.";
  if (lq.includes("dubai") || lq.includes("uae"))
    return "Dubai offers an easy e-visa for most South Asian passports. Flights from Pakistan start from $165 (direct). Top stays: Burj Vista from $180/night. I've drafted a 5-day Dubai itinerary — check the AI Planner for a full budget breakdown.";
  if (lq.includes("flight") || lq.includes("ticket") || lq.includes("cheap"))
    return "Cheapest routes this week: Dubai → Lahore from $165 ✈️, Riyadh → Karachi from $180, Abu Dhabi → Delhi from $150. For PK → USA, Turkish Airlines via IST from $760. Prices are estimates — confirm before booking.";
  if (lq.includes("europe") || lq.includes("switzerland") || lq.includes("schengen"))
    return "For Europe you'll need a Schengen visa (€90 fee). Apply at your main destination's consulate. Switzerland: flights from $650, 10-day budget ~$2,800–$3,500 with mid-range stays. I can draft a detailed Schengen itinerary.";
  if (lq.includes("cruise"))
    return "Top cruise picks: Arabian Gulf Explorer (4 nights from $420 all-inclusive), Mediterranean Jewel (7 nights from $890). For under $2,000 the Gulf cruise is perfect. Private Dubai Marina yacht charters from $300.";
  if (lq.includes("apartment") || lq.includes("monthly") || lq.includes("rent"))
    return "In Dubai, furnished 1BR apartments run $1,200–$2,400/month depending on area. Marina and JBR are premium; JVC and Business Bay offer better value. I can show properties in Karachi, Riyadh and Manila too.";
  if (lq.includes("umrah") || lq.includes("hajj"))
    return "Umrah packages from Lahore: 10 nights from $1,650 including flights, 5★ hotel near Haram and visa. Saudi tourist eVisa also covers Umrah. Crescent Travel House and Skyline Tours are verified agencies with strong reviews.";
  if (lq.includes("student") || lq.includes("f-1") || lq.includes("f1"))
    return "For the US F-1 student visa you need: accepted I-20 form, SEVIS fee ($350), DS-160, financial proof and transcripts. Apply as soon as you receive your I-20. Processing: 4–10 weeks. Connect with Priya Nair — our top student visa specialist.";
  return `Great question about "${q}". I can help with visas, flights, hotels, cruises, car rentals, local tours, properties and full budget trip planning. Try the AI Trip Planner for a complete itinerary, or ask me anything more specific. (Demo assistant — sample answers only.)`;
}

export function Hero() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent | null, presetQuery?: string) {
    if (e) e.preventDefault();
    const q = (presetQuery ?? query).trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({ prompt: q, response: getAiResponse(q) });
      setLoading(false);
    }, 800);
  }

  function usePrompt(p: string) {
    setQuery(p);
    handleSubmit(null, p);
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -left-48 -top-24 h-[500px] w-[500px] rounded-full bg-blue/30 blur-[100px] opacity-60" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-gold/20 blur-[80px] opacity-50" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-blue/15 blur-[80px]" />

      {/* Floating decorations */}
      <div className="pointer-events-none absolute right-[5%] top-[12%] hidden text-6xl lg:block animate-float opacity-30">✈️</div>
      <div className="pointer-events-none absolute right-[15%] bottom-[20%] hidden text-5xl lg:block animate-float-med opacity-25" style={{ animationDelay: "1.5s" }}>🌍</div>
      <div className="pointer-events-none absolute left-[3%] bottom-[25%] hidden text-4xl lg:block animate-float opacity-20" style={{ animationDelay: "3s" }}>🛂</div>

      <div className="container-px relative py-20 sm:py-24 lg:py-32">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI-First Global Travel Operating System
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-7 max-w-5xl text-center h-hero text-white">
          Your AI Travel Command Center for{" "}
          <span className="text-gradient-gold">Visas</span>,{" "}
          <span className="relative inline-block">
            <span className="text-blue-light">Flights</span>
          </span>
          , Tours, Luxury Stays &{" "}
          <span className="text-gradient-gold">Global Journeys.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl">
          Plan smarter, travel cheaper, apply confidently. Globe Travel Voyage helps you discover
          flights, visas, hotels, cruises, local experiences, trusted travel experts and
          AI-powered travel planning — all in one place.
        </p>

        {/* ── AI Command Search ── */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-[0_24px_60px_-12px_rgba(8,28,58,0.6)] backdrop-blur-md">
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="flex items-center gap-3 p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-navy">
                <Icon name="sparkles" className="h-5 w-5" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "USA visa from Pakistan" or "10 days Europe for $3,000"'
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none sm:text-base"
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
                    Plan with AI
                  </>
                )}
              </button>
            </form>

            {/* AI Response */}
            {result && (
              <div className="border-t border-white/10 bg-white/5 px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">AI Response</p>
                <p className="text-sm leading-relaxed text-white/85">{result.response}</p>
                <p className="mt-2 text-xs text-white/40">
                  Demo mode — sample answers only. Prices and approvals are never guaranteed.
                </p>
              </div>
            )}

            {/* Quick prompts */}
            {!result && (
              <div className="border-t border-white/10 px-3 pb-3 pt-2">
                <p className="mb-2 px-1 text-xs text-white/40">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiPrompts.slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => usePrompt(p)}
                      className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/70 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/trip-planner" className="btn-gold w-full px-7 py-3.5 sm:w-auto">
            <Icon name="sparkles" className="h-4 w-4" />
            Start Planning With AI
          </Link>
          <Link
            href="/visa"
            className="btn w-full border border-white/20 px-7 py-3.5 text-white backdrop-blur-sm hover:bg-white/10 sm:w-auto"
          >
            <Icon name="visa" className="h-4 w-4" />
            Explore Travel Services
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <Icon name="shield" className="h-3.5 w-3.5 text-gold" />
            Verified providers
          </span>
          <span className="h-px w-px rounded-full bg-white/30 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="h-3.5 w-3.5 text-gold" />
            No visa approval guarantee
          </span>
          <span className="h-px w-px rounded-full bg-white/30 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Icon name="globe" className="h-3.5 w-3.5 text-gold" />
            190+ countries covered
          </span>
          <span className="h-px w-px rounded-full bg-white/30 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-gold" />
            AI-powered guidance
          </span>
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm"
            >
              <p className="text-2xl font-extrabold text-gold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-white/55">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
