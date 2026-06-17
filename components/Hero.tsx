"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { useCatalog } from "@/lib/catalog/context";
import { bookingRequestPath, rentalsBrowseHref } from "@/lib/marketplace-routes";
import { PRICE_ESTIMATE_LABEL } from "@/lib/launch-trust";
import { SamplePrice } from "@/components/PriceEstimateLabel";
import { analyzeVisaWithAi, getTravelAssistantReply, AiUnavailableError } from "@/lib/ai-api";
import type { VisaResult } from "@/lib/ai-types";
import { VISA_AI_DISCLAIMER } from "@/lib/ai-types";
import { FlightOfferList } from "@/components/FlightOfferList";
import { parsePassengerCount } from "@/lib/flights/airport";
import { searchFlightsClient } from "@/lib/flights/search-client";
import type { FlightCabinClass, FlightOffer } from "@/lib/flights/types";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "flights" | "hotels" | "visa" | "cruises" | "tours" | "rentals" | "ai";

// ─── Shared select option lists ───────────────────────────────────────────────

const FLIGHT_CITIES = [
  // Gulf / Middle East
  "Dubai (DXB)", "Abu Dhabi (AUH)", "Sharjah (SHJ)",
  "Riyadh (RUH)", "Jeddah (JED)", "Dammam (DMM)",
  "Doha (DOH)", "Kuwait City (KWI)", "Bahrain (BAH)", "Muscat (MCT)",
  // Pakistan
  "Lahore (LHE)", "Karachi (KHI)", "Islamabad (ISB)", "Peshawar (PEW)",
  // India
  "Delhi (DEL)", "Mumbai (BOM)", "Chennai (MAA)", "Hyderabad (HYD)",
  // Bangladesh & Philippines
  "Dhaka (DAC)", "Chittagong (CGP)", "Manila (MNL)", "Cebu (CEB)",
  // Western
  "New York (JFK)", "Washington DC (IAD)", "London (LHR)", "Toronto (YYZ)",
  "Istanbul (IST)", "Kuala Lumpur (KUL)", "Other",
];

const HOTEL_DESTINATIONS = [
  "Dubai", "Abu Dhabi", "Makkah", "Madinah", "Riyadh",
  "Doha", "Istanbul", "Cairo", "Kuala Lumpur", "Bangkok",
  "Lahore", "Karachi", "Islamabad", "Manila", "Dhaka",
  "London", "New York", "Toronto", "Paris", "Other",
];

const HOTEL_TYPES = [
  "All types", "Luxury 5★ resort", "Luxury 5★ hotel", "4★ hotel",
  "Budget / economy", "Furnished apartment", "Vacation rental",
  "Serviced apartment (monthly)", "Hostel / backpacker", "Boutique hotel",
];

const NATIONALITIES = [
  "🇵🇰 Pakistani", "🇮🇳 Indian", "🇵🇭 Filipino", "🇧🇩 Bangladeshi",
  "🇸🇦 Saudi resident", "🇦🇪 UAE resident", "🇶🇦 Qatar resident",
  "🇪🇬 Egyptian", "🇳🇬 Nigerian", "🇱🇰 Sri Lankan",
  "🇺🇸 American", "🇬🇧 British", "🇨🇦 Canadian", "Other",
];

const VISA_DESTINATIONS = [
  "🇺🇸 United States (USA)", "🇨🇦 Canada", "🇬🇧 United Kingdom",
  "🇪🇺 Schengen (Europe)", "🇦🇪 UAE / Dubai", "🇸🇦 Saudi Arabia",
  "🇦🇺 Australia", "🇩🇪 Germany", "🇫🇷 France", "🇮🇹 Italy",
  "🇵🇰 Pakistan", "🇮🇳 India", "🇵🇭 Philippines",
  "🇧🇩 Bangladesh", "🇱🇰 Sri Lanka", "🇳🇬 Nigeria",
  "🇯🇵 Japan", "🇲🇾 Malaysia", "🇹🇷 Turkey", "Other",
];

const VISA_PURPOSES = [
  "Tourism / Holiday", "Business meeting / Conference", "Family visit / Reunion",
  "Study / University enrolment", "Work / Employment permit", "Medical treatment",
  "Religious / Umrah / Hajj", "Transit (stopover)", "Permanent Residency (PR)",
  "Spousal / Dependent visa", "Other",
];

const CRUISE_REGIONS = [
  "Dubai / Arabian Gulf", "Dubai Marina (yacht charter)",
  "Mediterranean (Italy, Greece, Spain)", "Caribbean islands",
  "Luxury yacht — private charter", "Maldives & Indian Ocean",
  "Aegean / Turkey coast", "Southeast Asia (Philippines, Bali)",
  "Nile River, Egypt", "European rivers (Rhine / Danube)", "Other",
];

const TOUR_TYPES = [
  "All tour types", "City sightseeing", "Heritage & culture", "Adventure & hiking",
  "Desert safari", "Boat / water tours", "Guided historical", "Local food experience",
  "Religious / pilgrimage", "Private guided tour",
];

const TOUR_DESTINATIONS = [
  "Dubai", "Abu Dhabi", "Istanbul", "Makkah / Madinah", "Cairo",
  "Lahore", "Islamabad", "Hunza Valley", "Karachi",
  "Bangkok", "Manila", "Bali", "Kuala Lumpur",
  "London", "Paris", "New York", "Tokyo", "Other",
];

const RENTAL_LOCATIONS = [
  "Dubai", "Abu Dhabi", "Riyadh", "Doha",
  "Lahore", "Karachi", "Islamabad", "Manila",
  "London", "New York", "Istanbul", "Other",
];

// ─── Mock result data ─────────────────────────────────────────────────────────

const MOCK_HOTELS = [
  { name: "Atlantis The Palm",    city: "Dubai",    stars: 5, price: "$450/night", type: "Resort" },
  { name: "Grand Hyatt Makkah",   city: "Makkah",   stars: 5, price: "$320/night", type: "Hotel" },
  { name: "The Ritz-Carlton Doha",city: "Doha",     stars: 5, price: "$380/night", type: "Hotel" },
  { name: "Pullman Istanbul",     city: "Istanbul", stars: 5, price: "$195/night", type: "Hotel" },
  { name: "Pearl Continental",   city: "Lahore",   stars: 5, price: "$140/night", type: "Hotel" },
];

const MOCK_CRUISES = [
  { name: "Arabian Gulf Explorer", nights: "4 nights", region: "Dubai · Abu Dhabi · Qatar", price: "from $420", type: "Cruise" },
  { name: "Dubai Marina Sunset",   nights: "Day charter", region: "Dubai Marina",           price: "from $300", type: "Yacht" },
  { name: "Mediterranean Jewel",  nights: "7 nights",   region: "Italy · Greece · Spain",  price: "from $890", type: "Cruise" },
  { name: "Nile Heritage Voyage",  nights: "3 nights",   region: "Luxor · Aswan, Egypt",    price: "from $260", type: "River boat" },
  { name: "Palawan Island Hop",    nights: "Day trip",    region: "El Nido, Philippines",    price: "from $45",  type: "Boat" },
];

const MOCK_TOURS = [
  { title: "Old Dubai Heritage Walk",     city: "Dubai",     price: "$45/pp",  duration: "4 hrs",  tag: "Heritage" },
  { title: "Desert Safari & BBQ",         city: "Dubai",     price: "$55/pp",  duration: "6 hrs",  tag: "Adventure" },
  { title: "Bosphorus Sunset Cruise",     city: "Istanbul",  price: "$38/pp",  duration: "2 hrs",  tag: "Cruise" },
  { title: "Hunza Valley Day Trip",       city: "Islamabad", price: "$65/pp",  duration: "Full day", tag: "Nature" },
  { title: "Taal Volcano Boat Tour",      city: "Manila",    price: "$30/pp",  duration: "5 hrs",  tag: "Boat tour" },
];

const MOCK_RENTALS = [
  { title: "Toyota Corolla — self drive",     type: "Car",      city: "Dubai",     price: "$32/day",   tag: "Economy" },
  { title: "Nissan Patrol — with driver",     type: "Car",      city: "Riyadh",    price: "$95/day",   tag: "SUV + chauffeur" },
  { title: "2BR Furnished Apartment",         type: "Apartment",city: "Dubai Marina", price: "$1,400/mo", tag: "Monthly" },
  { title: "Beachfront Villa",                type: "Villa",    city: "Karachi",   price: "$180/night",tag: "Vacation stay" },
  { title: "Studio — short stay",             type: "Studio",   city: "Islamabad", price: "$45/night", tag: "Nightly" },
];

// ─── Disclaimer banner ────────────────────────────────────────────────────────

function ResultDisclaimer() {
  return (
    <p className="mt-2 px-4 pb-2 text-center text-[10px] text-charcoal/40 leading-relaxed">
      {PRICE_ESTIMATE_LABEL} Globe Travel Voyage is not an airline, hotel, immigration authority, or official visa body.
    </p>
  );
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

function Diff({ d }: { d: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-700",
    Moderate: "bg-amber-50 text-amber-700",
    Complex: "bg-red-50 text-red-600",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors[d] ?? "bg-soft text-navy"}`}>{d}</span>;
}

// ─── Flights Form ─────────────────────────────────────────────────────────────

function mapHeroCabin(cabin: string): FlightCabinClass {
  if (cabin === "Premium Economy") return "premium_economy";
  if (cabin === "Business") return "business";
  if (cabin === "First Class") return "first";
  return "economy";
}

function FlightsForm() {
  const [from, setFrom]     = useState("");
  const [to, setTo]         = useState("");
  const [tripType, setType] = useState("Round-trip");
  const [cabin, setCabin]   = useState("Economy");
  const [pax, setPax]       = useState("1 Adult");
  const [dep, setDep]       = useState("");
  const [ret, setRet]       = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setFallbackMessage(null);
    setFlights([]);
    try {
      const result = await searchFlightsClient({
        origin: from,
        destination: to,
        departureDate: dep,
        returnDate: tripType === "Round-trip" ? ret : undefined,
        passengers: parsePassengerCount(pax),
        cabinClass: mapHeroCabin(cabin),
      });
      if (!result.ok) {
        setFallbackMessage(result.message);
        setFlights([]);
      } else {
        setFlights(result.flights);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">From</label>
          <select className="input select" value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Select departure city</option>
            {FLIGHT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">To</label>
          <select className="input select" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Select destination city</option>
            {FLIGHT_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Trip type</label>
          <select className="input select" value={tripType} onChange={(e) => setType(e.target.value)}>
            <option>One-way</option>
            <option>Round-trip</option>
            <option>Multi-city</option>
          </select>
        </div>
        <div>
          <label className="label">Cabin class</label>
          <select className="input select" value={cabin} onChange={(e) => setCabin(e.target.value)}>
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First Class</option>
          </select>
        </div>
        <div>
          <label className="label">Departure</label>
          <input className="input" type="date" value={dep} onChange={(e) => setDep(e.target.value)} />
        </div>
        <div>
          <label className="label">Passengers</label>
          <select className="input select" value={pax} onChange={(e) => setPax(e.target.value)}>
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <option key={n}>{n} {n === 1 ? "Adult" : "Adults"}</option>
            ))}
            <option>2 Adults + 1 Child</option>
            <option>2 Adults + 2 Children</option>
            <option>Family group</option>
          </select>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
          <Icon name="sparkles" className="h-4 w-4" />
          Search Flights
        </button>
        <Link href="/flights" className="btn-outline px-5 py-3">Browse all →</Link>
      </form>

      {showResults && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">
              Live flights {from && to ? `${from} → ${to}` : ""}
            </p>
            <button onClick={() => setShowResults(false)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <FlightOfferList
            flights={flights}
            loading={loading}
            fallbackMessage={fallbackMessage}
            compact
            searched={showResults}
          />
          <p className="mt-2 text-center text-[10px] text-charcoal/40 leading-relaxed">
            Live fares via Duffel. Request a verified quote — provider confirmation required before booking.
          </p>
          <div className="mt-3 text-center border-t border-soft-200 pt-3">
            <Link href="/flights" className="text-xs font-semibold text-blue hover:underline">View all routes on flights page →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hotels Form ──────────────────────────────────────────────────────────────

function HotelsForm() {
  const [dest, setDest]         = useState("");
  const [stayType, setStayType] = useState("");
  const [guests, setGuests]     = useState("2 Guests");
  const [budget, setBudget]     = useState("");
  const [checkin, setCheckin]   = useState("");
  const [checkout, setCheckout] = useState("");
  const [results, setResults]   = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResults(true);
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Destination</label>
          <select className="input select" value={dest} onChange={(e) => setDest(e.target.value)}>
            <option value="">Select city</option>
            {HOTEL_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Property type</label>
          <select className="input select" value={stayType} onChange={(e) => setStayType(e.target.value)}>
            <option value="">Any type</option>
            {HOTEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Check-in</label>
          <input className="input" type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </div>
        <div>
          <label className="label">Check-out</label>
          <input className="input" type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        <div>
          <label className="label">Guests</label>
          <select className="input select" value={guests} onChange={(e) => setGuests(e.target.value)}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Budget tier</label>
          <select className="input select" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Any budget</option>
            <option>Budget (under $60/night)</option>
            <option>Mid-range ($60–$150/night)</option>
            <option>Premium ($150–$350/night)</option>
            <option>Luxury ($350+/night)</option>
          </select>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 py-3">Search Hotels</button>
        <Link href="/hotels" className="btn-outline px-5 py-3">Browse all →</Link>
      </form>

      {results && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden">
          <div className="bg-navy/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">Featured stays {dest ? `in ${dest}` : "— featured properties"}</p>
            <button onClick={() => setResults(false)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <div className="divide-y divide-soft-200">
            {MOCK_HOTELS.map((h) => (
              <div key={h.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">🏨</span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-sm">{h.name}</p>
                    <p className="text-xs text-charcoal/50">{h.city} · {h.type} · {"⭐".repeat(h.stars)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <SamplePrice value={h.price} size="sm" />
                  <Link
                    href={bookingRequestPath({
                      service: "hotel",
                      subject: h.name,
                      destination: dest || h.city,
                    })}
                    className="btn-blue px-3 py-1.5 text-xs"
                  >
                    Request quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <ResultDisclaimer />
          <div className="p-3 text-center border-t border-soft-200">
            <Link href="/hotels" className="text-xs font-semibold text-blue hover:underline">View all stays on hotels page →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Visa Form ────────────────────────────────────────────────────────────────

function VisaForm() {
  const [nat, setNat]         = useState("");
  const [dest, setDest]       = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<VisaResult | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!nat || !dest) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysis = await analyzeVisaWithAi({
        nationality: nat,
        currentCountry: nat,
        destination: dest,
        purpose: purpose || "Tourism / Holiday",
        previousVisaRefusals: false,
        travelHistory: "limited",
        employmentStatus: "employed",
        financialSituation: "moderate",
      });
      setResult(analysis);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not run visa analysis. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Your nationality / passport</label>
          <select className="input select" value={nat} onChange={(e) => setNat(e.target.value)} required>
            <option value="">Select passport</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Destination country</label>
          <select className="input select" value={dest} onChange={(e) => setDest(e.target.value)} required>
            <option value="">Select destination</option>
            {VISA_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Purpose of visit</label>
        <select className="input select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">Select purpose</option>
          {VISA_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <form onSubmit={(e) => void search(e)} className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={loading || !nat || !dest} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <Icon name="visa" className="h-4 w-4" />
              Check requirements
            </>
          )}
        </button>
        <Link href="/ai-visa-assistant" className="btn-gold px-5 py-3 text-center text-sm">
          Start AI Visa Check →
        </Link>
      </form>
      <p className="text-center text-[11px] text-charcoal/45">
        ⚠ {VISA_AI_DISCLAIMER}
      </p>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden">
          <div className="bg-navy/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">
              AI visa overview — {result.visaType}
            </p>
            <button type="button" onClick={() => setResult(null)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-charcoal/60">Fee: <strong className="text-navy">{result.fee}</strong></span>
              <span className="text-charcoal/60">Processing: <strong className="text-navy">{result.processingTime}</strong></span>
              <span className="text-charcoal/60">Readiness: <strong className="text-navy">{result.approvalScore}%</strong></span>
            </div>
            <p className="text-xs text-charcoal/60 leading-relaxed">{result.approvalNote}</p>
            {result.requiredDocs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-navy mb-1.5">Key documents</p>
                <ul className="space-y-1">
                  {result.requiredDocs.slice(0, 5).map((doc) => (
                    <li key={doc} className="text-xs text-charcoal/60 flex items-start gap-1.5">
                      <span className="text-blue shrink-0">•</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[10px] text-charcoal/45 leading-relaxed">{result.disclaimer}</p>
          </div>
          <div className="p-3 text-center border-t border-soft-200 flex flex-wrap justify-center gap-3">
            <Link href="/ai-visa-assistant" className="text-xs font-semibold text-blue hover:underline">Full AI analysis →</Link>
            <Link href="/visa/start" className="text-xs font-semibold text-blue hover:underline">Apply with an expert →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cruises Form ─────────────────────────────────────────────────────────────

function CruisesForm() {
  const [region, setRegion]   = useState("");
  const [dur, setDur]         = useState("");
  const [type, setType]       = useState("");
  const [guests, setGuests]   = useState("2 guests");
  const [dep, setDep]         = useState("");
  const [results, setResults] = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResults(true);
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Region</label>
          <select className="input select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Select region</option>
            {CRUISE_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Cruise type</label>
          <select className="input select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any type</option>
            <option>Ocean cruise</option>
            <option>Private yacht</option>
            <option>Boat tour</option>
            <option>Ship charter</option>
            <option>River boat</option>
          </select>
        </div>
        <div>
          <label className="label">Duration</label>
          <select className="input select" value={dur} onChange={(e) => setDur(e.target.value)}>
            <option value="">Any duration</option>
            <option>Day trip (1 day)</option>
            <option>2–4 nights</option>
            <option>5–7 nights</option>
            <option>8–14 nights</option>
            <option>15+ nights</option>
          </select>
        </div>
        <div>
          <label className="label">Guests</label>
          <select className="input select" value={guests} onChange={(e) => setGuests(e.target.value)}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
            <option>Private group (10+)</option>
          </select>
        </div>
        <div>
          <label className="label">Departure date</label>
          <input className="input" type="date" value={dep} onChange={(e) => setDep(e.target.value)} />
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 py-3">Search Cruises & Yachts</button>
        <Link href="/cruises" className="btn-outline px-5 py-3">Browse all →</Link>
      </form>

      {results && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden">
          <div className="bg-navy/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">Featured cruises {region ? `— ${region}` : "— featured options"}</p>
            <button onClick={() => setResults(false)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <div className="divide-y divide-soft-200">
            {MOCK_CRUISES.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">🛳️</span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-sm">{c.name}</p>
                    <p className="text-xs text-charcoal/50">{c.region} · {c.nights} · {c.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <SamplePrice value={c.price} size="sm" />
                  <Link
                    href={bookingRequestPath({
                      service: "cruise",
                      subject: c.name,
                      destination: c.region,
                    })}
                    className="btn-blue px-3 py-1.5 text-xs"
                  >
                    Request quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <ResultDisclaimer />
          <div className="p-3 text-center border-t border-soft-200">
            <Link href="/cruises" className="text-xs font-semibold text-blue hover:underline">View all cruises →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tours Form ───────────────────────────────────────────────────────────────

function ToursForm() {
  const [dest, setDest]     = useState("");
  const [tourType, setType] = useState("");
  const [group, setGroup]   = useState("1–2 people");
  const [date, setDate]     = useState("");
  const [results, setResults] = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResults(true);
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Destination / City</label>
          <select className="input select" value={dest} onChange={(e) => setDest(e.target.value)}>
            <option value="">Select destination</option>
            {TOUR_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tour type</label>
          <select className="input select" value={tourType} onChange={(e) => setType(e.target.value)}>
            <option value="">Any type</option>
            {TOUR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Group size</label>
          <select className="input select" value={group} onChange={(e) => setGroup(e.target.value)}>
            <option>1 person</option>
            <option>1–2 people</option>
            <option>3–5 people</option>
            <option>6–10 people</option>
            <option>Private group (10+)</option>
          </select>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 py-3">Find Local Experiences</button>
        <Link href="/tours" className="btn-outline px-5 py-3">Browse all →</Link>
      </form>

      {results && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden">
          <div className="bg-navy/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">Featured tours {dest ? `in ${dest}` : "— featured experiences"}</p>
            <button onClick={() => setResults(false)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <div className="divide-y divide-soft-200">
            {MOCK_TOURS.map((t) => (
              <div key={t.title} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">🗺️</span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-sm">{t.title}</p>
                    <p className="text-xs text-charcoal/50">{t.city} · {t.duration} · {t.tag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <SamplePrice value={t.price} size="sm" />
                  <Link
                    href={bookingRequestPath({
                      service: "tour",
                      subject: t.title,
                      destination: dest || t.city,
                    })}
                    className="btn-blue px-3 py-1.5 text-xs"
                  >
                    Request quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <ResultDisclaimer />
          <div className="p-3 text-center border-t border-soft-200">
            <Link href="/tours" className="text-xs font-semibold text-blue hover:underline">View all tours →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rentals Form ─────────────────────────────────────────────────────────────

function RentalsForm() {
  const [rentalType, setRentalType] = useState("");
  const [location, setLocation]     = useState("");
  const [duration, setDuration]     = useState("");
  const [from, setFrom]             = useState("");
  const [results, setResults]       = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResults(true);
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">What do you need?</label>
          <select className="input select" value={rentalType} onChange={(e) => setRentalType(e.target.value)}>
            <option value="">Select type</option>
            <option>Car rental (self-drive)</option>
            <option>Car with chauffeur</option>
            <option>Apartment</option>
            <option>Villa / vacation home</option>
            <option>Monthly furnished stay</option>
            <option>Buy / invest in property</option>
          </select>
        </div>
        <div>
          <label className="label">Location / City</label>
          <select className="input select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select city</option>
            {RENTAL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">From date</label>
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">Duration</label>
          <select className="input select" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="">Select duration</option>
            <option>Daily (1–6 days)</option>
            <option>Weekly (1–3 weeks)</option>
            <option>Monthly (1–11 months)</option>
            <option>Long-term (1 year+)</option>
          </select>
        </div>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 py-3">Search Rentals & Stays</button>
        <Link href={rentalsBrowseHref(rentalType)} className="btn-outline px-5 py-3">Browse all →</Link>
      </form>

      {results && (
        <div className="mt-1 rounded-xl border border-soft-200 overflow-hidden">
          <div className="bg-navy/5 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-navy">Featured rentals {location ? `in ${location}` : "— featured options"}</p>
            <button onClick={() => setResults(false)} className="text-xs text-charcoal/40 hover:text-navy">✕</button>
          </div>
          <div className="divide-y divide-soft-200">
            {MOCK_RENTALS.map((r) => (
              <div key={r.title} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{r.type === "Car" ? "🚗" : r.type === "Villa" ? "🏡" : "🏢"}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-sm">{r.title}</p>
                    <p className="text-xs text-charcoal/50">{r.city} · {r.tag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <SamplePrice value={r.price} size="sm" />
                  <Link
                    href={bookingRequestPath({
                      service: r.type === "Car" ? "car_rental" : "property",
                      subject: r.title,
                      destination: location || r.city,
                    })}
                    className="btn-blue px-3 py-1.5 text-xs"
                  >
                    Request quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <ResultDisclaimer />
          <div className="p-3 text-center border-t border-soft-200">
            <Link href={rentalsBrowseHref(rentalType)} className="text-xs font-semibold text-blue hover:underline">
              View all properties & rentals →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Planner Form ──────────────────────────────────────────────────────────

function AiPlannerForm() {
  const { aiPrompts } = useCatalog();
  const [mode, setMode]           = useState<"quick" | "form">("quick");
  const [query, setQuery]         = useState("");
  const [budget, setBudget]       = useState("");
  const [days, setDays]           = useState("");
  const [style, setStyle]         = useState("");
  const [dest, setDest]           = useState("");
  const [response, setResponse]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function submit(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const { text } = await getTravelAssistantReply(q);
      setResponse(text);
    } catch (err) {
      setResponse("");
      setError(
        err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not reach the AI service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const q = `${days} days trip to ${dest} with ${budget} budget, ${style} style`;
    setQuery(q);
    void submit(q);
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Mode toggle */}
      <div className="mb-3 flex gap-1 rounded-lg bg-soft p-1 w-fit">
        <button onClick={() => setMode("quick")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${mode === "quick" ? "bg-white text-navy shadow-sm" : "text-charcoal/50 hover:text-navy"}`}>
          ✨ Quick ask
        </button>
        <button onClick={() => setMode("form")} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${mode === "form" ? "bg-white text-navy shadow-sm" : "text-charcoal/50 hover:text-navy"}`}>
          🗓️ Trip form
        </button>
      </div>

      {mode === "quick" && (
        <form onSubmit={(e) => { e.preventDefault(); void submit(query); }} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "10 days Japan for $3,000" or "USA visa from Pakistan"'
            className="input flex-1 text-sm"
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0 px-5 py-3 text-sm disabled:opacity-70">
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : <><Icon name="sparkles" className="h-4 w-4" /> Ask</>}
          </button>
        </form>
      )}

      {mode === "form" && (
        <form onSubmit={submitForm} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Destination</label>
              <input className="input" placeholder="Dubai, Istanbul, Japan…" value={dest} onChange={(e) => setDest(e.target.value)} required />
            </div>
            <div>
              <label className="label">Total budget</label>
              <select className="input select" value={budget} onChange={(e) => setBudget(e.target.value)} required>
                <option value="">Select budget</option>
                <option>$500</option>
                <option>$1,000</option>
                <option>$2,000</option>
                <option>$3,000</option>
                <option>$5,000</option>
                <option>$10,000+</option>
              </select>
            </div>
            <div>
              <label className="label">Travel days</label>
              <select className="input select" value={days} onChange={(e) => setDays(e.target.value)} required>
                <option value="">Select days</option>
                {[3,5,7,10,14,21,30].map((d) => <option key={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="label">Travel style</label>
              <select className="input select" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="">Any style</option>
                <option>Budget traveller</option>
                <option>Family trip</option>
                <option>Luxury explorer</option>
                <option>Honeymoon / couples</option>
                <option>Business + leisure</option>
                <option>Adventure lover</option>
                <option>Religious (Umrah/Hajj)</option>
                <option>Medical travel</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? (
              <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg> Planning…</>
            ) : (
              <><Icon name="sparkles" className="h-4 w-4" /> Generate AI trip plan</>
            )}
          </button>
        </form>
      )}

      {/* Suggested prompts */}
      {!response && mode === "quick" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {aiPrompts.slice(0, 4).map((p) => (
            <button key={p} type="button" onClick={() => { setQuery(p); void submit(p); }}
              className="rounded-full border border-soft-200 bg-soft px-3 py-1 text-xs text-charcoal/60 transition-colors hover:border-blue/30 hover:text-navy">
              {p}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* AI response */}
      {response && (
        <div className="mt-4 rounded-xl border border-blue/15 bg-blue/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wide text-blue">🤖 Globe AI Response</p>
            <button onClick={() => setResponse("")} className="text-xs text-charcoal/40 hover:text-navy">Clear ×</button>
          </div>
          <p className="text-sm leading-relaxed text-navy">{response}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/trip-planner" className="btn-primary py-2 px-4 text-xs">Full trip planner →</Link>
            <Link href="/visa/start" className="btn-outline py-2 px-4 text-xs">Apply for visa →</Link>
          </div>
          <p className="mt-2 text-[10px] text-charcoal/40">{VISA_AI_DISCLAIMER}</p>
        </div>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero({ statsBar }: { statsBar?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -left-48 -top-24 h-[600px] w-[600px] rounded-full bg-blue/25 blur-[120px] opacity-60" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[450px] w-[450px] rounded-full bg-gold/15 blur-[100px] opacity-50" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[700px] rounded-full bg-blue/10 blur-[80px]" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="pointer-events-none absolute right-[8%] top-[10%] hidden text-5xl lg:block animate-float opacity-15">🛂</div>
      <div className="pointer-events-none absolute left-[6%] bottom-[18%] hidden text-4xl lg:block animate-float-med opacity-10" style={{ animationDelay: "2s" }}>✨</div>

      <div className="container-px relative py-16 sm:py-20 lg:py-24">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold backdrop-blur-sm">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI Visa · International Travel
          </span>
        </div>

        <h1 className="mx-auto mt-7 max-w-4xl text-center h-hero text-white">
          AI-powered visa guidance &{" "}
          <span className="text-gradient-gold">luxury travel</span>{" "}
          planning
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-white/75 sm:text-lg">
          Check visa requirements, plan international trips with AI, and connect with verified experts —
          one premium platform for global journeys.
        </p>

        {/* Primary CTAs */}
        <div className="mx-auto mt-9 flex max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link href="/ai-visa-assistant" className="btn-gold flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base">
            <Icon name="visa" className="h-4 w-4" />
            Start AI Visa Check
          </Link>
          <Link href="/ai-trip-planner" className="btn flex items-center justify-center gap-2 border border-white/25 bg-white/10 px-6 py-3.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:text-base">
            <Icon name="sparkles" className="h-4 w-4" />
            Plan My Trip
          </Link>
          <Link href="/register?role=agent" className="btn flex items-center justify-center gap-2 border border-white/15 px-6 py-3.5 text-sm text-white/90 transition-colors hover:border-gold/40 hover:text-gold sm:text-base">
            Become a Verified Provider
          </Link>
        </div>

        {/* Visa quick check */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(8,28,58,0.40)]">
            <div className="border-b border-soft-200 bg-navy/[0.03] px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-navy">
                Quick visa requirement check
              </p>
            </div>
            <VisaForm />
          </div>
          <p className="mt-3 text-center text-[11px] text-white/40">
            For full AI analysis and document checklist →{" "}
            <Link href="/ai-visa-assistant" className="font-semibold text-gold/80 hover:text-gold">
              AI Visa Assistant
            </Link>
            {" · "}
            <Link href="#travel-services" className="font-semibold text-white/55 hover:text-white/80">
              Flights & stays
            </Link>
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45">
          {[
            { icon: "shield" as const, label: "Verified provider marketplace" },
            { icon: "check" as const, label: "No visa approval guarantee" },
            { icon: "sparkles" as const, label: "AI-powered guidance" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <Icon name={item.icon} className="h-3.5 w-3.5 text-gold" />
              {item.label}
            </span>
          ))}
        </div>

        {statsBar}
      </div>
    </section>
  );
}
