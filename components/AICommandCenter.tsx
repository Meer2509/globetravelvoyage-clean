"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

// ─── Mock plan generator ──────────────────────────────────────────────────────

interface TravelPlan {
  destination: string;
  days: number;
  budget: string;
  totalBudget: number;
  style: string;
  itinerary: { day: string; activities: string[] }[];
  flights: { route: string; airline: string; price: string }[];
  hotels: { name: string; stars: number; price: string; area: string }[];
  budgetBreakdown: { category: string; amount: string; pct: number; emoji: string }[];
  tips: string[];
  visaNote: string;
}

function generatePlan(dest: string, days: number, budget: number, travelers: number, style: string): TravelPlan {
  const perPerson = Math.round(budget / travelers);
  const lDest = dest.toLowerCase();

  const isDubai = lDest.includes("dubai") || lDest.includes("uae");
  const isEurope = lDest.includes("europe") || lDest.includes("paris") || lDest.includes("london") || lDest.includes("schengen");
  const isUSA = lDest.includes("usa") || lDest.includes("new york") || lDest.includes("america");
  const isTurkey = lDest.includes("turkey") || lDest.includes("istanbul");
  const isThailand = lDest.includes("thailand") || lDest.includes("bangkok") || lDest.includes("thai");
  const isMaldives = lDest.includes("maldives");

  if (isDubai) {
    return {
      destination: "Dubai, UAE 🇦🇪",
      days,
      budget: `$${budget.toLocaleString()}`,
      totalBudget: budget,
      style,
      itinerary: [
        { day: "Day 1", activities: ["Arrive Dubai International (DXB)", "Check-in Dubai Marina hotel", "JBR Beach Walk & sunset", "Dinner at Marina Promenade"] },
        { day: "Day 2", activities: ["Burj Khalifa At the Top (124F)", "Dubai Mall & Dubai Fountain show", "Traditional Arabic lunch", "Dubai Frame at sunset"] },
        { day: "Day 3", activities: ["Museum of the Future (morning)", "Old Dubai: Gold Souk & Spice Souk", "Abra ride across the Creek", "Al Fahidi historical neighborhood"] },
        { day: "Day 4", activities: ["Desert Safari (departs 3PM)", "Camel ride & dune bashing", "BBQ dinner under the stars", "Belly dance & cultural show"] },
        { day: "Day 5", activities: ["Brunch at a beach club", "Ski Dubai (optional)", "Palm Jumeirah drive & Atlantis view", "Depart"] },
      ].slice(0, days),
      flights: [
        { route: "LHE/KHI → DXB", airline: "Emirates / FlyDubai", price: "$145–$280 pp" },
        { route: "RUH/JED → DXB", airline: "Saudia / Air Arabia", price: "$120–$220 pp" },
      ],
      hotels: [
        { name: "Marriott Marina", stars: 5, price: "$150/night", area: "Dubai Marina" },
        { name: "Rove Downtown", stars: 3, price: "$75/night", area: "Downtown Dubai" },
      ],
      budgetBreakdown: [
        { category: "Flights (return)", amount: `$${Math.round(perPerson * 0.28).toLocaleString()}`, pct: 28, emoji: "✈️" },
        { category: "Hotel", amount: `$${Math.round(perPerson * 0.32).toLocaleString()}`, pct: 32, emoji: "🏨" },
        { category: "Tours & activities", amount: `$${Math.round(perPerson * 0.18).toLocaleString()}`, pct: 18, emoji: "🎯" },
        { category: "Food & dining", amount: `$${Math.round(perPerson * 0.14).toLocaleString()}`, pct: 14, emoji: "🍽️" },
        { category: "Transport", amount: `$${Math.round(perPerson * 0.06).toLocaleString()}`, pct: 6, emoji: "🚗" },
        { category: "Contingency", amount: `$${Math.round(perPerson * 0.02).toLocaleString()}`, pct: 2, emoji: "💰" },
      ],
      tips: ["UAE e-Visa costs ~AED 250 (most nationalities)", "Metro is cheapest for Downtown/Mall", "Dubai Mall free entry — just buy parking", "Best exchange rates at Gold Souk money changers"],
      visaNote: "UAE e-Visa required for most nationalities — 24–72h processing, very high approval rate.",
    };
  }

  if (isTurkey) {
    return {
      destination: "Istanbul & Turkey 🇹🇷",
      days,
      budget: `$${budget.toLocaleString()}`,
      totalBudget: budget,
      style,
      itinerary: [
        { day: "Day 1", activities: ["Arrive Istanbul IST", "Sultanahmet walking tour", "Blue Mosque & Hagia Sophia", "Rooftop dinner with Bosphorus view"] },
        { day: "Day 2", activities: ["Topkapi Palace (morning)", "Grand Bazaar shopping", "Spice Bazaar", "Bosphorus Sunset Cruise"] },
        { day: "Day 3", activities: ["Breakfast in Balat (colorful houses)", "Galata Tower climb", "Istiklal Street", "Traditional Turkish Bath (Hammam)"] },
        { day: "Day 4", activities: ["Fly/bus to Cappadocia", "Sunset at Göreme viewpoint", "Underground city tour"] },
        { day: "Day 5", activities: ["Hot air balloon at sunrise (optional)", "Rock valley hike", "Return Istanbul / Depart"] },
      ].slice(0, days),
      flights: [
        { route: "DXB/RUH → IST", airline: "Turkish Airlines / FlyDubai", price: "$180–$380 pp" },
        { route: "LHE/KHI → IST", airline: "Turkish Airlines (direct)", price: "$280–$520 pp" },
      ],
      hotels: [
        { name: "Eresin Crown Hotel", stars: 5, price: "$95/night", area: "Sultanahmet" },
        { name: "Marmara Guesthaus", stars: 3, price: "$45/night", area: "Beyoglu" },
      ],
      budgetBreakdown: [
        { category: "Flights (return)", amount: `$${Math.round(perPerson * 0.35).toLocaleString()}`, pct: 35, emoji: "✈️" },
        { category: "Hotel", amount: `$${Math.round(perPerson * 0.25).toLocaleString()}`, pct: 25, emoji: "🏨" },
        { category: "Tours & activities", amount: `$${Math.round(perPerson * 0.20).toLocaleString()}`, pct: 20, emoji: "🎯" },
        { category: "Food & dining", amount: `$${Math.round(perPerson * 0.14).toLocaleString()}`, pct: 14, emoji: "🍽️" },
        { category: "Transport", amount: `$${Math.round(perPerson * 0.06).toLocaleString()}`, pct: 6, emoji: "🚗" },
      ],
      tips: ["Turkish e-Visa is $50 — apply before flying", "Haggle at Grand Bazaar — start at 40% of asking price", "Turkish lira is favorable — use local currency", "Book hot air balloon weeks in advance"],
      visaNote: "Turkey e-Visa required — apply at evisa.gov.tr. Takes minutes, $50 fee.",
    };
  }

  if (isUSA) {
    return {
      destination: "United States 🇺🇸",
      days,
      budget: `$${budget.toLocaleString()}`,
      totalBudget: budget,
      style,
      itinerary: [
        { day: "Day 1–2", activities: ["Arrive JFK/LAX/ORD", "Hotel check-in", "Explore Times Square or Central Park (NYC)", "Brooklyn Bridge walk"] },
        { day: "Day 3–4", activities: ["Statue of Liberty ferry", "9/11 Memorial & Museum", "High Line walk", "Broadway show (evening)"] },
        { day: "Day 5–6", activities: ["Day trip: Niagara Falls (from NYC)", "Empire State Building observation deck", "MoMA or Metropolitan Museum", "5th Avenue shopping"] },
        { day: "Day 7+", activities: ["Washington DC day trip", "Smithsonian museums (free)", "Capitol Hill & White House exterior", "Depart"] },
      ].slice(0, Math.ceil(days / 2)),
      flights: [
        { route: "KHI/LHE → JFK", airline: "Turkish Airlines / Qatar Airways", price: "$720–$1,400 pp" },
        { route: "DXB → JFK", airline: "Emirates (direct)", price: "$800–$1,600 pp" },
      ],
      hotels: [
        { name: "Marriott Marquis Times Sq.", stars: 5, price: "$290/night", area: "Midtown Manhattan" },
        { name: "Pod 51 Hotel", stars: 3, price: "$120/night", area: "Midtown East" },
      ],
      budgetBreakdown: [
        { category: "Flights (return)", amount: `$${Math.round(perPerson * 0.38).toLocaleString()}`, pct: 38, emoji: "✈️" },
        { category: "Hotel", amount: `$${Math.round(perPerson * 0.30).toLocaleString()}`, pct: 30, emoji: "🏨" },
        { category: "Activities", amount: `$${Math.round(perPerson * 0.15).toLocaleString()}`, pct: 15, emoji: "🎯" },
        { category: "Food & dining", amount: `$${Math.round(perPerson * 0.12).toLocaleString()}`, pct: 12, emoji: "🍽️" },
        { category: "Transport", amount: `$${Math.round(perPerson * 0.05).toLocaleString()}`, pct: 5, emoji: "🚇" },
      ],
      tips: ["Apply USA B1/B2 visa 3–6 months early", "NYC subway is cheapest transport — $3.25/ride", "Tipping is expected: 18–20% at restaurants", "Times Square TKTS for 50% off Broadway tickets"],
      visaNote: "USA B1/B2 visa required. Apply 3–6 months before travel. Processing: 3–12 weeks. No approval guaranteed.",
    };
  }

  // Generic fallback
  const destDisplay = dest || "Your Destination";
  return {
    destination: `${destDisplay} ✈️`,
    days,
    budget: `$${budget.toLocaleString()}`,
    totalBudget: budget,
    style,
    itinerary: [
      { day: "Day 1", activities: ["Arrive at destination", "Hotel check-in & rest", "Explore nearby area", "Local dinner"] },
      { day: "Day 2", activities: ["Main city tour", "Key landmarks visit", "Local market exploration", "Cultural experience"] },
      { day: "Day 3+", activities: ["Day trip to nearby attraction", "Activity of your choice", "Shopping", "Depart or continue journey"] },
    ].slice(0, Math.min(days, 3)),
    flights: [
      { route: "Your origin → " + destDisplay, airline: "Best available airline", price: `$${Math.round(perPerson * 0.3).toLocaleString()} est.` },
    ],
    hotels: [
      { name: "Luxury Option", stars: 5, price: `$${Math.round(perPerson * 0.12).toLocaleString()}/night`, area: "City Center" },
      { name: "Budget Option", stars: 3, price: `$${Math.round(perPerson * 0.06).toLocaleString()}/night`, area: "Good area" },
    ],
    budgetBreakdown: [
      { category: "Flights (return)", amount: `$${Math.round(perPerson * 0.35).toLocaleString()}`, pct: 35, emoji: "✈️" },
      { category: "Hotel", amount: `$${Math.round(perPerson * 0.28).toLocaleString()}`, pct: 28, emoji: "🏨" },
      { category: "Activities", amount: `$${Math.round(perPerson * 0.18).toLocaleString()}`, pct: 18, emoji: "🎯" },
      { category: "Food", amount: `$${Math.round(perPerson * 0.13).toLocaleString()}`, pct: 13, emoji: "🍽️" },
      { category: "Other", amount: `$${Math.round(perPerson * 0.06).toLocaleString()}`, pct: 6, emoji: "💰" },
    ],
    tips: ["Compare prices 2–3 months ahead", "Check visa requirements early", "Travel insurance is strongly recommended", "Keep digital copies of all documents"],
    visaNote: "Check visa requirements for your nationality before booking. Globe Travel Voyage can connect you with verified visa experts.",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AICommandCenter() {
  const [destination, setDestination] = useState("Dubai");
  const [days, setDays] = useState("5");
  const [budget, setBudget] = useState("2000");
  const [travelers, setTravelers] = useState("2");
  const [style, setStyle] = useState("Balanced");
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(false);

  function generate() {
    if (!destination.trim()) return;
    setLoading(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(generatePlan(destination, parseInt(days) || 5, parseInt(budget) || 2000, parseInt(travelers) || 2, style));
      setLoading(false);
    }, 1200);
  }

  const colorMap: Record<string, string> = {
    "✈️": "bg-blue",
    "🏨": "bg-emerald-500",
    "🎯": "bg-gold",
    "🍽️": "bg-orange-400",
    "🚗": "bg-purple-500",
    "🚇": "bg-purple-500",
    "💰": "bg-charcoal/40",
    "🛂": "bg-red-400",
  };

  return (
    <section className="section-dark bg-section-dark relative overflow-hidden">
      {/* BG orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-blue/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" />

      <div className="container-px relative">
        <div className="mb-10 text-center">
          <span className="eyebrow-gold mb-4">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI Travel Command Center
          </span>
          <h2 className="mt-4 h-section text-white">
            Build your perfect trip in{" "}
            <span className="text-gradient-gold">30 seconds</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
            Tell the AI your destination, budget and travel style. Instantly get a personalized itinerary, budget breakdown, hotel picks and travel tips.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ── Input panel ── */}
          <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-[var(--shadow-premium)]" style={{ borderColor: "var(--gtv-border)" }}>
            <h3 className="font-bold text-navy text-sm uppercase tracking-wide">Your travel preferences</h3>

            <div>
              <label className="label">Destination</label>
              <input
                className="input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dubai, Istanbul, New York, Bangkok..."
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div>
                <label className="label">Days</label>
                <select className="input select" value={days} onChange={(e) => setDays(e.target.value)}>
                  {[3,4,5,6,7,8,10,14].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div>
                <label className="label">Travelers</label>
                <select className="input select" value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option value="1">Solo</option>
                  <option value="2">Couple (2)</option>
                  <option value="3">3 people</option>
                  <option value="4">Family (4)</option>
                  <option value="5">Group (5+)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Total budget (USD)</label>
              <select className="input select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="800">$800 (Budget)</option>
                <option value="1500">$1,500</option>
                <option value="2000">$2,000</option>
                <option value="3000">$3,000</option>
                <option value="5000">$5,000</option>
                <option value="8000">$8,000</option>
                <option value="15000">$15,000 (Luxury)</option>
              </select>
            </div>
            <div>
              <label className="label">Travel style</label>
              <select className="input select" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option>Balanced</option>
                <option>Budget traveler</option>
                <option>Luxury & comfort</option>
                <option>Family friendly</option>
                <option>Adventure seeker</option>
                <option>Business travel</option>
                <option>Couple / romantic</option>
                <option>Cultural explorer</option>
              </select>
            </div>
            <div>
              <label className="label">Special needs</label>
              <select className="input select" defaultValue="None">
                <option>None</option>
                <option>Halal food required</option>
                <option>Wheelchair accessible</option>
                <option>With pets</option>
                <option>Medical travel</option>
                <option>Umrah / Religious</option>
              </select>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm font-bold disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Generating your plan…
                </span>
              ) : (
                <>
                  <Icon name="sparkles" className="h-4 w-4" />
                  Generate AI Travel Plan
                </>
              )}
            </button>

            <p className="text-[11px] text-white/30 text-center leading-relaxed">
              AI-generated estimates for inspiration only. Prices, availability and visa outcomes are never guaranteed.
            </p>
          </div>

          {/* ── Output panel ── */}
          <div className="min-h-[400px]">
            {!plan && !loading && (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
                <div className="text-6xl animate-float">🗺️</div>
                <h3 className="mt-5 text-lg font-bold text-white/80">Your AI plan appears here</h3>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  Fill in your preferences and click "Generate AI Travel Plan" to see a personalized itinerary, budget breakdown, flights and hotel picks.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["Dubai 5 days $2k", "Istanbul 7 days $3k", "New York 10 days $5k"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const parts = s.split(" ");
                        setDestination(parts[0]);
                        setDays(parts[1]);
                        setBudget(parts[2].replace(/\D/g, "000"));
                        generate();
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:border-gold/40 hover:text-gold transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-8 space-y-4">
                <div className="skeleton h-7 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-3/4" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            )}

            {plan && !loading && (
              <div className="animate-fade-up space-y-4">
                {/* Header */}
                <div className="rounded-2xl border border-gold/20 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{plan.destination}</h3>
                      <p className="text-sm text-white/55">{plan.days} days · {plan.budget} total · {plan.style}</p>
                    </div>
                    <span className="chip bg-gold/15 text-gold border-gold/20 text-xs font-bold">AI Generated</span>
                  </div>
                </div>

                {/* Budget breakdown */}
                <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Budget Breakdown</h4>
                  <div className="space-y-2.5">
                    {plan.budgetBreakdown.map((b) => (
                      <div key={b.category}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-white/70">
                            <span>{b.emoji}</span>
                            {b.category}
                          </span>
                          <span className="font-bold text-white">{b.amount}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-700 ${colorMap[b.emoji] ?? "bg-blue"}`}
                            style={{ width: `${b.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary */}
                <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/50">Day-by-Day Itinerary</h4>
                  <div className="space-y-3">
                    {plan.itinerary.map((d) => (
                      <div key={d.day} className="flex gap-3">
                        <span className="mt-0.5 flex h-6 w-16 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-[11px] font-bold text-gold">{d.day}</span>
                        <ul className="space-y-0.5">
                          {d.activities.map((a, i) => (
                            <li key={i} className="text-xs text-white/65 flex items-start gap-1.5">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flights + Hotels row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">✈️ Flights</h4>
                    {plan.flights.map((f) => (
                      <div key={f.route} className="mb-2 last:mb-0 rounded-xl bg-white/5 p-3">
                        <p className="text-xs font-semibold text-white">{f.route}</p>
                        <p className="text-xs text-white/50">{f.airline}</p>
                        <p className="text-sm font-bold text-gold">{f.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">🏨 Hotels</h4>
                    {plan.hotels.map((h) => (
                      <div key={h.name} className="mb-2 last:mb-0 rounded-xl bg-white/5 p-3">
                        <p className="text-xs font-semibold text-white">{h.name}</p>
                        <p className="text-xs text-white/50">{"★".repeat(h.stars)} · {h.area}</p>
                        <p className="text-sm font-bold text-gold">{h.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visa note */}
                <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 flex items-start gap-3">
                  <Icon name="visa" className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                  <p className="text-xs text-white/70">{plan.visaNote}</p>
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">🔑 AI Travel Tips</h4>
                  <ul className="space-y-2">
                    {plan.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                        <Icon name="sparkles" className="h-3.5 w-3.5 shrink-0 text-gold mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <Link href="/trip-planner" className="btn-gold flex-1 py-2.5 text-sm">
                    Full AI Planner
                  </Link>
                  <Link href="/agents" className="btn border border-white/20 flex-1 py-2.5 text-sm text-white hover:bg-white/10">
                    Find Travel Agent
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
