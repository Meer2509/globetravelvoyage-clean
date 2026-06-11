// ─────────────────────────────────────────────────────────────────────────────
// Globe Travel Voyage — Central mock data layer
// All static so the frontend builds and deploys without external services.
// ─────────────────────────────────────────────────────────────────────────────

export type IconName =
  | "visa"
  | "flight"
  | "hotel"
  | "car"
  | "cruise"
  | "tour"
  | "ticket"
  | "planner"
  | "property"
  | "agency"
  | "agent"
  | "guide"
  | "referral"
  | "shield"
  | "globe"
  | "sparkles"
  | "check"
  | "star"
  | "users"
  | "doc"
  | "heart"
  | "map"
  | "compass"
  | "camera"
  | "medical"
  | "student"
  | "prayer"
  | "yacht"
  | "insurance";

// ─── Services (20) ───────────────────────────────────────────────────────────

export interface Service {
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  emoji: string;
  accent: string;
  badge?: string;
}

export const services: Service[] = [
  { slug: "visa", title: "AI Visa Assistant", description: "AI-powered visa guidance for every country with document checklists.", href: "/visa", icon: "visa", emoji: "🛂", accent: "from-blue/20 to-blue/5", badge: "AI" },
  { slug: "usa-visa", title: "USA Visa Guide", description: "Featured B1/B2, F-1 & family visa paths from Pakistan and South Asia.", href: "/visa/usa-from-pakistan", icon: "visa", emoji: "🇺🇸", accent: "from-navy/20 to-navy/5", badge: "Popular" },
  { slug: "flights", title: "Flights", description: "Compare cheap routes: Middle East ↔ South & Southeast Asia, USA, Europe.", href: "/flights", icon: "flight", emoji: "✈️", accent: "from-blue/20 to-blue/5" },
  { slug: "hotels", title: "Hotels & Luxury Stays", description: "5-star hotels, boutique stays, serviced apartments and long-stay rentals.", href: "/hotels", icon: "hotel", emoji: "🏨", accent: "from-gold/20 to-gold/5" },
  { slug: "apartments", title: "Apartment Rentals", description: "Furnished monthly apartments in Dubai, Riyadh, London, New York and more.", href: "/properties", icon: "property", emoji: "🏠", accent: "from-navy/20 to-navy/5" },
  { slug: "car-rentals", title: "Car Rentals", description: "Economy to luxury cars with or without a chauffeur in 90+ countries.", href: "/car-rentals", icon: "car", emoji: "🚗", accent: "from-blue/20 to-blue/5" },
  { slug: "cruises", title: "Cruises & Ships", description: "Ocean cruises, river voyages, luxury liners and private ship charters.", href: "/cruises", icon: "cruise", emoji: "🛳️", accent: "from-gold/20 to-gold/5" },
  { slug: "yachts", title: "Boats & Yacht Tours", description: "Private yacht charters, sunset cruises and island-hopping boat tours.", href: "/cruises", icon: "yacht", emoji: "⛵", accent: "from-navy/20 to-navy/5" },
  { slug: "tours", title: "Local Tours", description: "Guided experiences led by verified local guides worldwide.", href: "/tours", icon: "tour", emoji: "🗺️", accent: "from-blue/20 to-blue/5" },
  { slug: "tickets", title: "Attraction Tickets", description: "Skip-the-line tickets to the world's top landmarks and attractions.", href: "/tickets", icon: "ticket", emoji: "🎟️", accent: "from-gold/20 to-gold/5" },
  { slug: "guides", title: "Travel Guides", description: "Deep-dive city and country guides with local insider knowledge.", href: "/guides", icon: "compass", emoji: "📖", accent: "from-navy/20 to-navy/5" },
  { slug: "agencies", title: "Verified Travel Agencies", description: "Curated, identity-checked agencies offering packages, Umrah and more.", href: "/agencies", icon: "agency", emoji: "🏢", accent: "from-blue/20 to-blue/5" },
  { slug: "agents", title: "Verified Visa Experts", description: "Application-ready agents who prepare, review and guide your visa files.", href: "/agents", icon: "agent", emoji: "👔", accent: "from-gold/20 to-gold/5" },
  { slug: "local-guides", title: "Tour Guides", description: "Book certified local guides for private or group tours.", href: "/tours", icon: "guide", emoji: "🧑‍🦯", accent: "from-navy/20 to-navy/5" },
  { slug: "properties", title: "Property Rentals", description: "Short and long-term rental properties for travel and relocation.", href: "/properties", icon: "property", emoji: "🏡", accent: "from-blue/20 to-blue/5" },
  { slug: "property-sales", title: "Buy / Sell Property", description: "Travel-related property listings: homes, holiday villas and more.", href: "/properties", icon: "property", emoji: "🔑", accent: "from-gold/20 to-gold/5" },
  { slug: "insurance", title: "Travel Insurance", description: "Multi-trip and single-trip travel insurance options for global coverage.", href: "/", icon: "insurance", emoji: "🛡️", accent: "from-navy/20 to-navy/5", badge: "Coming soon" },
  { slug: "student", title: "Student Travel", description: "Student visa paths, campus housing, flight discounts and more.", href: "/visa", icon: "student", emoji: "🎓", accent: "from-blue/20 to-blue/5" },
  { slug: "medical", title: "Medical Travel", description: "Medical tourism guidance, hospital connections and travel coordination.", href: "/", icon: "medical", emoji: "🏥", accent: "from-gold/20 to-gold/5", badge: "Coming soon" },
  { slug: "umrah", title: "Umrah & Hajj Travel", description: "Complete Umrah and Hajj packages from verified agencies and operators.", href: "/agencies", icon: "prayer", emoji: "🕋", accent: "from-navy/20 to-navy/5", badge: "Trusted" },
];

// ─── Visas ────────────────────────────────────────────────────────────────────

export interface Visa {
  slug: string;
  country: string;
  flag: string;
  type: string;
  category: "Visitor" | "Student" | "Business" | "Work" | "Family" | "Transit";
  summary: string;
  processing: string;
  validity: string;
  stay: string;
  feeFrom: string;
  difficulty: "Easy" | "Moderate" | "Complex";
  featured?: boolean;
  documents: string[];
  steps: string[];
  commonMistakes?: string[];
  tips?: string[];
}

export const visas: Visa[] = [
  {
    slug: "usa-b1-b2",
    country: "United States",
    flag: "🇺🇸",
    type: "B1/B2 Visitor Visa",
    category: "Visitor",
    summary: "Tourism, business meetings and family visits to the USA on a non-immigrant visitor visa.",
    processing: "3–12 weeks (embassy-dependent)",
    validity: "Up to 10 years (multiple entry)",
    stay: "Up to 6 months per entry",
    feeFrom: "$185 (consular fee)",
    difficulty: "Complex",
    featured: true,
    documents: [
      "Valid passport (6+ months remaining)",
      "DS-160 online application confirmation",
      "Visa fee payment receipt (MRV fee)",
      "Interview appointment confirmation letter",
      "Recent passport-size photo (per US spec)",
      "Bank statements (last 3–6 months)",
      "Employment letter or business registration",
      "Income tax returns (last 2 years)",
      "Property deeds or strong ties to home country",
      "Sponsor's invitation letter (if applicable)",
    ],
    steps: [
      "Determine the correct visa category (B1 business, B2 tourism)",
      "Complete DS-160 — the online non-immigrant visa application",
      "Pay the MRV consular fee ($185)",
      "Create a CEAC account and schedule your interview",
      "Prepare and organise all supporting documents",
      "Attend the visa interview at the US Embassy or Consulate",
      "Track your passport return via courier",
    ],
    commonMistakes: [
      "Submitting inconsistent financial information",
      "Not showing strong ties to your home country",
      "Providing vague answers during the interview",
      "Missing or expired supporting documents",
    ],
    tips: [
      "Rehearse short, factual answers for common questions",
      "Bring originals AND copies of all documents",
      "Show genuine intent to return home after your visit",
      "Apply at least 3 months before your intended travel date",
    ],
  },
  {
    slug: "usa-f1-student",
    country: "United States",
    flag: "🇺🇸",
    type: "F-1 Student Visa",
    category: "Student",
    summary: "Study at an accredited US college or university on an approved I-20 from your institution.",
    processing: "4–10 weeks",
    validity: "Duration of study program",
    stay: "Program length + 60-day grace period",
    feeFrom: "$185 + SEVIS fee $350",
    difficulty: "Complex",
    featured: true,
    documents: [
      "Form I-20 from your accredited school",
      "SEVIS I-901 fee payment receipt",
      "DS-160 confirmation page",
      "University acceptance letter",
      "Financial support evidence (sponsorship or own funds)",
      "Academic transcripts, diplomas and test scores",
      "Scholarship letters (if applicable)",
    ],
    steps: [
      "Get accepted and receive Form I-20 from your school",
      "Pay the SEVIS I-901 fee online",
      "Complete DS-160 and pay the visa fee",
      "Schedule your F-1 interview",
      "Attend the interview with all documents",
    ],
    commonMistakes: [
      "Paying SEVIS fee after applying for the visa",
      "Not bringing the original I-20",
      "Unclear financial sponsorship documentation",
    ],
    tips: [
      "Apply as soon as you receive your I-20",
      "Be clear about your academic plans and career goals",
      "Show ties to your home country even as a student",
    ],
  },
  {
    slug: "uk-standard-visitor",
    country: "United Kingdom",
    flag: "🇬🇧",
    type: "Standard Visitor Visa",
    category: "Visitor",
    summary: "Tourism, family visits and short business trips to the UK for up to 6 months.",
    processing: "3 weeks (standard)",
    validity: "6 months, or 2 / 5 / 10-year options",
    stay: "Up to 6 months",
    feeFrom: "£115",
    difficulty: "Moderate",
    documents: ["Valid passport", "Online application confirmation", "Bank statements", "Accommodation proof", "Employment or business evidence"],
    steps: ["Apply online on the UK Visas portal", "Book a biometrics appointment at a VFS centre", "Upload supporting documents", "Attend the appointment", "Track decision online"],
    tips: ["Apply at least 3 weeks before travel", "Show clear return plans and financial stability"],
  },
  {
    slug: "canada-visitor",
    country: "Canada",
    flag: "🇨🇦",
    type: "Visitor Visa (TRV)",
    category: "Visitor",
    summary: "Temporary Resident Visa for tourism, family visits and short business trips to Canada.",
    processing: "4–12 weeks",
    validity: "Up to 10 years (multiple entry)",
    stay: "Up to 6 months",
    feeFrom: "CAD $100",
    difficulty: "Moderate",
    documents: ["Valid passport", "IRCC online application", "Financial proof", "Travel purpose / invitation letter", "Biometrics enrollment"],
    steps: ["Create an IRCC account", "Complete the application online", "Pay fees and enrol biometrics", "Submit documents and track"],
    tips: ["Apply via IRCC directly — no middleman needed", "Show ties to home country clearly"],
  },
  {
    slug: "schengen",
    country: "Schengen Area",
    flag: "🇪🇺",
    type: "Schengen Short-Stay Visa",
    category: "Visitor",
    summary: "Single visa giving access to 29 European countries for up to 90 days in any 180-day period.",
    processing: "15–45 calendar days",
    validity: "Up to 5 years (multiple entry)",
    stay: "90 days within any 180 days",
    feeFrom: "€90",
    difficulty: "Moderate",
    documents: ["Valid passport", "Application form", "Travel medical insurance (€30,000 minimum)", "Confirmed return flights", "Hotel reservations", "Bank statements"],
    steps: ["Identify your main destination country", "Book an appointment at the relevant consulate", "Prepare and submit all documents", "Attend biometrics if required", "Collect your passport"],
    tips: ["Apply at the embassy of your main destination", "Insurance must cover the entire Schengen zone"],
  },
  {
    slug: "uae-tourist",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    type: "Tourist Visa",
    category: "Visitor",
    summary: "30 or 60-day single or multiple entry tourist visa for Dubai, Abu Dhabi and the UAE.",
    processing: "2–5 business days",
    validity: "60 days from issue",
    stay: "30 or 60 days",
    feeFrom: "$90",
    difficulty: "Easy",
    documents: ["Passport copy (6+ months validity)", "Passport-size photo", "Confirmed return ticket", "Hotel booking"],
    steps: ["Apply online or through a licensed agent / airline", "Upload passport scan and photo", "Pay the visa fee", "Receive e-visa by email"],
    tips: ["Pakistani, Indian, Filipino and Bangladeshi nationals can apply online easily", "Use Emirates, Air Arabia or Flydubai sponsored visa for speed"],
  },
  {
    slug: "saudi-tourist",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    type: "Tourist eVisa",
    category: "Visitor",
    summary: "1-year multiple-entry tourist eVisa for Saudi Arabia including Umrah eligibility.",
    processing: "Minutes to 72 hours",
    validity: "1 year (multiple entry)",
    stay: "Up to 90 days total",
    feeFrom: "$80 + insurance",
    difficulty: "Easy",
    documents: ["Valid passport", "Digital photograph", "Confirmed accommodation", "Travel insurance (mandatory)"],
    steps: ["Apply on the official Saudi eVisa portal (visitsaudi.com)", "Upload passport scan and photo", "Pay visa fee and required insurance", "Download your eVisa"],
    tips: ["The eVisa is linked to your passport — keep it on your phone", "Insurance is now mandatory and can be purchased during application"],
  },
];

export interface Country {
  name: string;
  flag: string;
  region: string;
  visaTypes: number;
  difficulty: "Easy" | "Moderate" | "Complex";
}

export const visaCountries: Country[] = [
  { name: "United States", flag: "🇺🇸", region: "North America", visaTypes: 6, difficulty: "Complex" },
  { name: "United Kingdom", flag: "🇬🇧", region: "Europe", visaTypes: 5, difficulty: "Moderate" },
  { name: "Canada", flag: "🇨🇦", region: "North America", visaTypes: 5, difficulty: "Moderate" },
  { name: "Schengen Area", flag: "🇪🇺", region: "Europe", visaTypes: 4, difficulty: "Moderate" },
  { name: "United Arab Emirates", flag: "🇦🇪", region: "Middle East", visaTypes: 4, difficulty: "Easy" },
  { name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East", visaTypes: 3, difficulty: "Easy" },
  { name: "Australia", flag: "🇦🇺", region: "Oceania", visaTypes: 5, difficulty: "Moderate" },
  { name: "Pakistan", flag: "🇵🇰", region: "South Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "India", flag: "🇮🇳", region: "South Asia", visaTypes: 4, difficulty: "Easy" },
  { name: "Philippines", flag: "🇵🇭", region: "Southeast Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "Bangladesh", flag: "🇧🇩", region: "South Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "Qatar", flag: "🇶🇦", region: "Middle East", visaTypes: 3, difficulty: "Easy" },
  { name: "Turkey", flag: "🇹🇷", region: "Europe/Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "Singapore", flag: "🇸🇬", region: "Southeast Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "Germany", flag: "🇩🇪", region: "Europe", visaTypes: 4, difficulty: "Moderate" },
  { name: "Japan", flag: "🇯🇵", region: "East Asia", visaTypes: 4, difficulty: "Moderate" },
  { name: "Malaysia", flag: "🇲🇾", region: "Southeast Asia", visaTypes: 3, difficulty: "Easy" },
  { name: "Switzerland", flag: "🇨🇭", region: "Europe", visaTypes: 3, difficulty: "Moderate" },
  { name: "France", flag: "🇫🇷", region: "Europe", visaTypes: 4, difficulty: "Moderate" },
  { name: "Italy", flag: "🇮🇹", region: "Europe", visaTypes: 4, difficulty: "Moderate" },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

export interface Route {
  id: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  priceFrom: string;
  airlines: string[];
  duration: string;
  stops: string;
  tag?: string;
  trend?: "up" | "down" | "stable";
  aiTip?: string;
}

export const cheapRoutes: Route[] = [
  { id: "r1", from: "Dubai", to: "Lahore", fromCode: "DXB", toCode: "LHE", priceFrom: "$165", airlines: ["Fly Jinnah", "Air Arabia"], duration: "3h 10m", stops: "Direct", tag: "🔥 Hot deal", trend: "down", aiTip: "Prices drop mid-week. Tuesday departures average 18% cheaper." },
  { id: "r2", from: "Riyadh", to: "Karachi", fromCode: "RUH", toCode: "KHI", priceFrom: "$180", airlines: ["PIA", "Saudia"], duration: "3h 45m", stops: "Direct", trend: "stable" },
  { id: "r3", from: "Dubai", to: "Manila", fromCode: "DXB", toCode: "MNL", priceFrom: "$320", airlines: ["Emirates", "Cebu Pacific"], duration: "8h 30m", stops: "Direct", tag: "⭐ Popular", trend: "stable", aiTip: "Book 6–8 weeks ahead for best fares on this route." },
  { id: "r4", from: "Doha", to: "Dhaka", fromCode: "DOH", toCode: "DAC", priceFrom: "$240", airlines: ["Qatar Airways", "US-Bangla"], duration: "5h 10m", stops: "Direct", trend: "down" },
  { id: "r5", from: "Abu Dhabi", to: "Delhi", fromCode: "AUH", toCode: "DEL", priceFrom: "$150", airlines: ["Etihad", "IndiGo"], duration: "3h 30m", stops: "Direct", tag: "💰 Cheapest", trend: "down", aiTip: "Etihad's early-morning departures consistently offer the lowest fares." },
  { id: "r6", from: "Dubai", to: "Mumbai", fromCode: "DXB", toCode: "BOM", priceFrom: "$140", airlines: ["Emirates", "IndiGo"], duration: "3h 15m", stops: "Direct", trend: "stable" },
  { id: "r7", from: "Jeddah", to: "Islamabad", fromCode: "JED", toCode: "ISB", priceFrom: "$210", airlines: ["Saudia", "PIA"], duration: "4h 20m", stops: "Direct", trend: "up" },
  { id: "r8", from: "Kuwait", to: "Manila", fromCode: "KWI", toCode: "MNL", priceFrom: "$340", airlines: ["Kuwait Airways", "Gulf Air"], duration: "9h 40m", stops: "1 stop", trend: "stable" },
];

export const usaRoutes: Route[] = [
  { id: "u1", from: "Lahore", to: "New York", fromCode: "LHE", toCode: "JFK", priceFrom: "$760", airlines: ["Qatar Airways", "Turkish Airlines"], duration: "18h 30m", stops: "1 stop", tag: "🇵🇰 → 🇺🇸", trend: "stable", aiTip: "Qatar Airways via DOH is consistently the most reliable option from Pakistan." },
  { id: "u2", from: "Karachi", to: "Washington", fromCode: "KHI", toCode: "IAD", priceFrom: "$820", airlines: ["Qatar Airways", "Etihad"], duration: "19h 10m", stops: "1 stop", tag: "🇵🇰 → 🇺🇸", trend: "stable" },
  { id: "u3", from: "Islamabad", to: "Chicago", fromCode: "ISB", toCode: "ORD", priceFrom: "$880", airlines: ["Turkish Airlines", "Emirates"], duration: "20h 05m", stops: "1 stop", tag: "🇵🇰 → 🇺🇸", trend: "down", aiTip: "Turkish Airlines via IST often dips below $850 in Jan–Feb." },
  { id: "u4", from: "Delhi", to: "New York", fromCode: "DEL", toCode: "JFK", priceFrom: "$720", airlines: ["Air India", "Qatar Airways"], duration: "16h 30m", stops: "1 stop", tag: "🇮🇳 → 🇺🇸", trend: "stable" },
  { id: "u5", from: "Manila", to: "Los Angeles", fromCode: "MNL", toCode: "LAX", priceFrom: "$680", airlines: ["Philippine Airlines", "Korean Air"], duration: "15h 00m", stops: "Direct/1 stop", tag: "🇵🇭 → 🇺🇸", trend: "down" },
  { id: "u6", from: "Dubai", to: "New York", fromCode: "DXB", toCode: "JFK", priceFrom: "$590", airlines: ["Emirates", "Delta"], duration: "14h 45m", stops: "Direct", tag: "🇦🇪 → 🇺🇸", trend: "stable", aiTip: "Emirates' direct DXB–JFK is unbeatable in comfort for this route." },
];

// ─── Flights ──────────────────────────────────────────────────────────────────

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  price: string;
  cabin: string;
}

export const flights: Flight[] = [
  { id: "f1", airline: "Emirates", from: "DXB", to: "LHE", depart: "08:15", arrive: "12:25", duration: "3h 10m", stops: "Direct", price: "$210", cabin: "Economy" },
  { id: "f2", airline: "Qatar Airways", from: "DOH", to: "JFK", depart: "02:05", arrive: "08:40", duration: "14h 35m", stops: "Direct", price: "$690", cabin: "Economy" },
  { id: "f3", airline: "Turkish Airlines", from: "LHE", to: "JFK", depart: "06:30", arrive: "16:00", duration: "18h 30m", stops: "1 stop (IST)", price: "$760", cabin: "Economy" },
  { id: "f4", airline: "PIA", from: "KHI", to: "RUH", depart: "23:50", arrive: "02:35", duration: "3h 45m", stops: "Direct", price: "$185", cabin: "Economy" },
  { id: "f5", airline: "IndiGo", from: "AUH", to: "DEL", depart: "10:20", arrive: "14:50", duration: "3h 30m", stops: "Direct", price: "$150", cabin: "Economy" },
  { id: "f6", airline: "Cebu Pacific", from: "DXB", to: "MNL", depart: "21:10", arrive: "10:40", duration: "8h 30m", stops: "Direct", price: "$320", cabin: "Economy" },
];

// ─── Stays ────────────────────────────────────────────────────────────────────

export interface Stay {
  id: string;
  name: string;
  city: string;
  country: string;
  type: "Hotel" | "Apartment" | "Villa" | "Long Stay" | "Boutique";
  rating: number;
  reviews: number;
  pricePerNight: string;
  amenities: string[];
  emoji: string;
  stars?: number;
}

export const stays: Stay[] = [
  { id: "s1", name: "Burj Vista Residences", city: "Dubai", country: "UAE", type: "Apartment", rating: 4.9, reviews: 412, pricePerNight: "$180", amenities: ["Pool", "Gym", "Kitchen", "Burj view"], emoji: "🏙️", stars: 5 },
  { id: "s2", name: "Makkah Clock Tower Suites", city: "Makkah", country: "Saudi Arabia", type: "Hotel", rating: 4.8, reviews: 905, pricePerNight: "$140", amenities: ["Haram view", "Shuttle", "Restaurant"], emoji: "🕌", stars: 5 },
  { id: "s3", name: "Four Seasons Doha", city: "Doha", country: "Qatar", type: "Hotel", rating: 4.9, reviews: 624, pricePerNight: "$320", amenities: ["Beach", "Spa", "Pool", "Fine dining"], emoji: "🌊", stars: 5 },
  { id: "s4", name: "Makati Sky Apartments", city: "Manila", country: "Philippines", type: "Apartment", rating: 4.7, reviews: 156, pricePerNight: "$60", amenities: ["Pool", "Kitchen", "Gym"], emoji: "🌆" },
  { id: "s5", name: "Heritage Haveli Palace", city: "Jaipur", country: "India", type: "Boutique", rating: 4.9, reviews: 321, pricePerNight: "$120", amenities: ["Pool", "Breakfast", "Heritage tours"], emoji: "🏰", stars: 4 },
  { id: "s6", name: "Marina Bay Hotel Karachi", city: "Karachi", country: "Pakistan", type: "Hotel", rating: 4.6, reviews: 238, pricePerNight: "$70", amenities: ["Breakfast", "WiFi", "Parking", "Sea view"], emoji: "🏨", stars: 4 },
];

// ─── Cars ─────────────────────────────────────────────────────────────────────

export interface CarRental {
  id: string;
  model: string;
  category: string;
  city: string;
  pricePerDay: string;
  seats: number;
  transmission: "Automatic" | "Manual";
  withDriver: boolean;
  emoji: string;
}

export const cars: CarRental[] = [
  { id: "c1", model: "Toyota Corolla", category: "Economy", city: "Dubai", pricePerDay: "$32", seats: 5, transmission: "Automatic", withDriver: false, emoji: "🚗" },
  { id: "c2", model: "Nissan Patrol", category: "SUV", city: "Riyadh", pricePerDay: "$95", seats: 7, transmission: "Automatic", withDriver: true, emoji: "🚙" },
  { id: "c3", model: "Mercedes E-Class", category: "Luxury", city: "Dubai", pricePerDay: "$160", seats: 5, transmission: "Automatic", withDriver: true, emoji: "🏎️" },
  { id: "c4", model: "Suzuki Cultus", category: "Economy", city: "Lahore", pricePerDay: "$22", seats: 5, transmission: "Manual", withDriver: false, emoji: "🚗" },
  { id: "c5", model: "Honda BR-V", category: "SUV", city: "Karachi", pricePerDay: "$48", seats: 7, transmission: "Automatic", withDriver: true, emoji: "🚙" },
  { id: "c6", model: "Toyota Hiace", category: "Van", city: "Manila", pricePerDay: "$70", seats: 12, transmission: "Manual", withDriver: true, emoji: "🚐" },
];

// ─── Cruises ──────────────────────────────────────────────────────────────────

export interface Cruise {
  id: string;
  name: string;
  type: "Cruise" | "Boat" | "Ship" | "Yacht";
  region: string;
  nights: number;
  priceFrom: string;
  highlights: string[];
  emoji: string;
}

export const cruises: Cruise[] = [
  { id: "cr1", name: "Arabian Gulf Explorer", type: "Cruise", region: "Dubai · Abu Dhabi · Qatar", nights: 4, priceFrom: "$420", highlights: ["All-inclusive", "Pool deck", "Shows"], emoji: "🛳️" },
  { id: "cr2", name: "Mediterranean Jewel", type: "Cruise", region: "Italy · Greece · Spain", nights: 7, priceFrom: "$890", highlights: ["Balcony cabins", "Shore excursions"], emoji: "🚢" },
  { id: "cr3", name: "Dubai Marina Yacht", type: "Yacht", region: "Dubai Marina", nights: 0, priceFrom: "$300", highlights: ["Private charter", "Sunset cruise"], emoji: "⛵" },
  { id: "cr4", name: "Nile Heritage Voyage", type: "Boat", region: "Luxor · Aswan, Egypt", nights: 3, priceFrom: "$260", highlights: ["River cruise", "Guided temples"], emoji: "🛶" },
  { id: "cr5", name: "Karachi Coast Ferry", type: "Ship", region: "Karachi · Gwadar", nights: 1, priceFrom: "$60", highlights: ["Scenic coastline", "Cabin"], emoji: "⛴️" },
  { id: "cr6", name: "Palawan Island Hopper", type: "Boat", region: "El Nido, Philippines", nights: 0, priceFrom: "$45", highlights: ["Hidden lagoons", "Snorkelling"], emoji: "🚤" },
];

// ─── Tours ────────────────────────────────────────────────────────────────────

export interface Tour {
  id: string;
  title: string;
  city: string;
  country: string;
  guide: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  emoji: string;
}

export const tours: Tour[] = [
  { id: "t1", title: "Old Dubai & Souks Walking Tour", city: "Dubai", country: "UAE", guide: "Ahmed R.", duration: "4 hours", price: "$45", rating: 4.9, reviews: 210, emoji: "🕌" },
  { id: "t2", title: "Lahore Food & Heritage Trail", city: "Lahore", country: "Pakistan", guide: "Fatima S.", duration: "5 hours", price: "$30", rating: 4.8, reviews: 142, emoji: "🍛" },
  { id: "t3", title: "Taj Mahal Sunrise Experience", city: "Agra", country: "India", guide: "Rahul M.", duration: "Full day", price: "$65", rating: 4.9, reviews: 388, emoji: "🕌" },
  { id: "t4", title: "Manila Bay Sunset & Intramuros", city: "Manila", country: "Philippines", guide: "Joey C.", duration: "3 hours", price: "$28", rating: 4.7, reviews: 96, emoji: "🌅" },
  { id: "t5", title: "Riyadh Edge of the World Trek", city: "Riyadh", country: "Saudi Arabia", guide: "Khalid A.", duration: "6 hours", price: "$80", rating: 4.8, reviews: 134, emoji: "🏜️" },
  { id: "t6", title: "Old Dhaka Rickshaw Tour", city: "Dhaka", country: "Bangladesh", guide: "Imran H.", duration: "4 hours", price: "$25", rating: 4.6, reviews: 71, emoji: "🛺" },
];

// ─── Tickets ──────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  attraction: string;
  city: string;
  price: string;
  category: string;
  skipLine: boolean;
  emoji: string;
}

export const tickets: Ticket[] = [
  { id: "tk1", attraction: "Burj Khalifa — At the Top", city: "Dubai", price: "$42", category: "Landmark", skipLine: true, emoji: "🏙️" },
  { id: "tk2", attraction: "Museum of the Future", city: "Dubai", price: "$40", category: "Museum", skipLine: true, emoji: "🛸" },
  { id: "tk3", attraction: "Taj Mahal Entry", city: "Agra", price: "$15", category: "Heritage", skipLine: false, emoji: "🕌" },
  { id: "tk4", attraction: "Ocean Park", city: "Manila", price: "$20", category: "Family", skipLine: true, emoji: "🐬" },
  { id: "tk5", attraction: "Diriyah Historical Tour", city: "Riyadh", price: "$25", category: "Heritage", skipLine: false, emoji: "🏛️" },
  { id: "tk6", attraction: "Minar-e-Pakistan & Museum", city: "Lahore", price: "$5", category: "Landmark", skipLine: false, emoji: "🗼" },
];

// ─── Properties ───────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  listingType: "For Rent" | "For Sale" | "Travel Stay";
  price: string;
  beds: number;
  baths: number;
  area: string;
  emoji: string;
}

export const properties: Property[] = [
  { id: "p1", title: "Modern 2BR Marina Apartment", city: "Dubai", country: "UAE", listingType: "For Rent", price: "$2,400/mo", beds: 2, baths: 2, area: "1,150 sqft", emoji: "🏙️" },
  { id: "p2", title: "DHA Family Villa", city: "Lahore", country: "Pakistan", listingType: "For Sale", price: "$320,000", beds: 5, baths: 5, area: "1 Kanal", emoji: "🏡" },
  { id: "p3", title: "Furnished Studio — Monthly", city: "Karachi", country: "Pakistan", listingType: "Travel Stay", price: "$650/mo", beds: 1, baths: 1, area: "520 sqft", emoji: "🛏️" },
  { id: "p4", title: "Makati Condo Investment", city: "Manila", country: "Philippines", listingType: "For Sale", price: "$145,000", beds: 1, baths: 1, area: "480 sqft", emoji: "🌆" },
  { id: "p5", title: "Beachfront Guest House", city: "Cox's Bazar", country: "Bangladesh", listingType: "Travel Stay", price: "$55/night", beds: 3, baths: 2, area: "1,400 sqft", emoji: "🏖️" },
  { id: "p6", title: "Goa Holiday Home", city: "Goa", country: "India", listingType: "For Rent", price: "$1,200/mo", beds: 3, baths: 3, area: "1,800 sqft", emoji: "🌴" },
];

// ─── Agents ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  countries: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  cases: number;
  initials: string;
  location: string;
  responseTime: string;
}

export const agents: Agent[] = [
  { id: "a1", name: "Sana Malik", title: "Senior Visa Consultant", specialties: ["USA B1/B2", "UK Visitor", "Schengen"], countries: ["Pakistan", "UAE"], rating: 4.9, reviews: 312, verified: true, cases: 1450, initials: "SM", location: "Lahore, Pakistan", responseTime: "< 2 hours" },
  { id: "a2", name: "Omar Haddad", title: "Visa & Immigration Advisor", specialties: ["Canada", "Australia", "Schengen"], countries: ["UAE", "Saudi Arabia"], rating: 4.8, reviews: 204, verified: true, cases: 980, initials: "OH", location: "Dubai, UAE", responseTime: "< 3 hours" },
  { id: "a3", name: "Priya Nair", title: "Student Visa Specialist", specialties: ["USA F-1", "UK Student", "Canada Study"], countries: ["India", "UAE"], rating: 4.9, reviews: 189, verified: true, cases: 760, initials: "PN", location: "Delhi, India", responseTime: "< 1 hour" },
  { id: "a4", name: "Reyes Santos", title: "Documentation Expert", specialties: ["UAE", "Saudi", "Schengen"], countries: ["Philippines"], rating: 4.7, reviews: 122, verified: true, cases: 540, initials: "RS", location: "Manila, Philippines", responseTime: "< 4 hours" },
];

// ─── Agencies ─────────────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  city: string;
  country: string;
  services: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  packages: number;
  initials: string;
  founded?: string;
}

export const agencies: Agency[] = [
  { id: "ag1", name: "Voyage Pro Travels", city: "Dubai", country: "UAE", services: ["Flights", "Visa", "Packages"], rating: 4.8, reviews: 540, verified: true, packages: 32, initials: "VP", founded: "2015" },
  { id: "ag2", name: "Skyline Tours", city: "Lahore", country: "Pakistan", services: ["Umrah", "Tours", "Tickets"], rating: 4.7, reviews: 410, verified: true, packages: 24, initials: "ST", founded: "2011" },
  { id: "ag3", name: "Pearl Holidays", city: "Manila", country: "Philippines", services: ["Packages", "Cruises", "Hotels"], rating: 4.6, reviews: 288, verified: true, packages: 18, initials: "PH" },
  { id: "ag4", name: "Crescent Travel House", city: "Riyadh", country: "Saudi Arabia", services: ["Umrah", "Flights", "Visa"], rating: 4.9, reviews: 622, verified: true, packages: 40, initials: "CT", founded: "2009" },
];

// ─── Vacation Packages ────────────────────────────────────────────────────────

export interface VacationPackage {
  id: string;
  title: string;
  agency: string;
  destinations: string;
  nights: number;
  price: string;
  includes: string[];
  emoji: string;
}

export const packages: VacationPackage[] = [
  { id: "vp1", title: "Dubai Family Escape", agency: "Voyage Pro Travels", destinations: "Dubai", nights: 5, price: "$890", includes: ["Flights", "4★ Hotel", "City tour", "Visa help"], emoji: "🏙️" },
  { id: "vp2", title: "Umrah Premium Package", agency: "Crescent Travel House", destinations: "Makkah · Madinah", nights: 10, price: "$1,650", includes: ["Flights", "5★ Hotel", "Visa", "Transport"], emoji: "🕋" },
  { id: "vp3", title: "Turkey Discovery", agency: "Skyline Tours", destinations: "Istanbul · Cappadocia", nights: 7, price: "$1,150", includes: ["Flights", "Hotels", "Tours", "Visa help"], emoji: "🎈" },
  { id: "vp4", title: "Philippines Island Hop", agency: "Pearl Holidays", destinations: "Cebu · Palawan", nights: 6, price: "$980", includes: ["Domestic flights", "Resorts", "Boat tours"], emoji: "🏝️" },
];

// ─── Luxury Destinations ──────────────────────────────────────────────────────

export interface Destination {
  city: string;
  country: string;
  tagline: string;
  fromPrice: string;
  emoji: string;
  highlights: string[];
  visaRequired?: string;
  bestTime?: string;
  category: "City" | "Beach" | "Culture" | "Adventure" | "Religious";
}

export const destinations: Destination[] = [
  { city: "Dubai", country: "UAE", tagline: "Skyline, souks & desert luxury", fromPrice: "$140", emoji: "🌇", highlights: ["Burj Khalifa", "Desert Safari", "Gold Souk"], visaRequired: "eVisa (easy)", bestTime: "Oct–Apr", category: "City" },
  { city: "Maldives", country: "Maldives", tagline: "Overwater villas & turquoise lagoons", fromPrice: "$520", emoji: "🏝️", highlights: ["Overwater bungalows", "Snorkelling", "Whale sharks"], visaRequired: "Free on arrival", bestTime: "Nov–Apr", category: "Beach" },
  { city: "Istanbul", country: "Turkey", tagline: "Where civilisations meet", fromPrice: "$220", emoji: "🕌", highlights: ["Hagia Sophia", "Grand Bazaar", "Bosphorus"], visaRequired: "eVisa", bestTime: "Apr–Oct", category: "Culture" },
  { city: "Makkah", country: "Saudi Arabia", tagline: "Umrah & spiritual pilgrimage", fromPrice: "$210", emoji: "🕋", highlights: ["Masjid al-Haram", "Tawaf", "Zamzam"], visaRequired: "Saudi eVisa", bestTime: "Year-round", category: "Religious" },
  { city: "London", country: "UK", tagline: "History, culture & world-class city", fromPrice: "$480", emoji: "🎡", highlights: ["Buckingham Palace", "Tower Bridge", "West End"], visaRequired: "UK Visitor Visa", bestTime: "May–Sep", category: "City" },
  { city: "New York", country: "USA", tagline: "The city that never sleeps", fromPrice: "$690", emoji: "🗽", highlights: ["Times Square", "Central Park", "Statue of Liberty"], visaRequired: "B1/B2 Visa or ESTA", bestTime: "Sep–Nov", category: "City" },
  { city: "Manila & Palawan", country: "Philippines", tagline: "Islands, warmth & hospitality", fromPrice: "$320", emoji: "🌴", highlights: ["El Nido lagoons", "Chocolate Hills", "White beaches"], visaRequired: "Free on arrival (30 days)", bestTime: "Nov–May", category: "Beach" },
  { city: "Swiss Alps", country: "Switzerland", tagline: "Snow peaks, lakes & luxury", fromPrice: "$650", emoji: "🏔️", highlights: ["Interlaken", "Matterhorn", "Zurich"], visaRequired: "Schengen Visa", bestTime: "Dec–Mar / Jun–Sep", category: "Adventure" },
  { city: "Bali", country: "Indonesia", tagline: "Temples, rice terraces & beaches", fromPrice: "$390", emoji: "🌺", highlights: ["Ubud temples", "Kuta beach", "Rice terraces"], visaRequired: "Visa on arrival", bestTime: "Apr–Oct", category: "Beach" },
  { city: "Paris", country: "France", tagline: "Romance, art & haute cuisine", fromPrice: "$420", emoji: "🗼", highlights: ["Eiffel Tower", "Louvre", "Versailles"], visaRequired: "Schengen Visa", bestTime: "Apr–Jun", category: "Culture" },
  { city: "Tokyo", country: "Japan", tagline: "Futuristic technology meets tradition", fromPrice: "$580", emoji: "🎌", highlights: ["Mount Fuji", "Shibuya", "Temples"], visaRequired: "Japan Visa", bestTime: "Mar–May / Oct", category: "Culture" },
  { city: "Hunza Valley", country: "Pakistan", tagline: "Untouched Himalayan paradise", fromPrice: "$180", emoji: "🏔️", highlights: ["Attabad Lake", "Rakaposhi", "Baltit Fort"], visaRequired: "None for Pakistanis", bestTime: "Apr–Oct", category: "Adventure" },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  name: string;
  location: string;
  text: string;
  rating: number;
  service: string;
  avatar: string;
}

export const reviews: Review[] = [
  { name: "Bilal A.", location: "Lahore, Pakistan", text: "The AI visa assistant explained exactly what documents I needed for my US B1/B2. Connected me with Sana, a verified agent who made the whole process smooth.", rating: 5, service: "USA Visa", avatar: "BA" },
  { name: "Maria S.", location: "Dubai, UAE", text: "Found the cheapest flight from Dubai to Manila in seconds. The AI trip planner built my entire itinerary by budget — I was amazed.", rating: 5, service: "Flights", avatar: "MS" },
  { name: "Imran K.", location: "Riyadh, KSA", text: "Booked an Umrah package from a verified agency. The transparent reviews and verification badge gave me complete confidence.", rating: 5, service: "Umrah Package", avatar: "IK" },
  { name: "Anjali R.", location: "Delhi, India", text: "The tours marketplace is brilliant. Our local guide in Agra was fantastic and fully verified. Will absolutely use again.", rating: 5, service: "Tours", avatar: "AR" },
  { name: "Hassan M.", location: "Karachi, Pakistan", text: "Applied for the UK visa with complete guidance from the platform. The document checklist saved me from making costly mistakes.", rating: 5, service: "UK Visa", avatar: "HM" },
  { name: "Sarah K.", location: "Manila, Philippines", text: "Rented a beachfront villa through the properties section. Communication was seamless, the host was verified. Superb experience.", rating: 5, service: "Property", avatar: "SK" },
];

// ─── Referral Tiers ───────────────────────────────────────────────────────────

export interface ReferralTier {
  name: string;
  referrals: string;
  commission: string;
  perks: string[];
  highlight?: boolean;
  badge: string;
}

export const referralTiers: ReferralTier[] = [
  { name: "Explorer", referrals: "1–10 referrals", commission: "5% commission", badge: "🌍", perks: ["Personal referral link", "Dashboard tracking", "Monthly payouts"] },
  { name: "Voyager", referrals: "11–50 referrals", commission: "8% commission", badge: "✈️", perks: ["All Explorer benefits", "Priority support", "Bonus credits on milestones"], highlight: true },
  { name: "Ambassador", referrals: "50+ referrals", commission: "12% commission", badge: "👑", perks: ["All Voyager benefits", "Co-marketing opportunities", "Dedicated account manager"] },
];

// ─── Trust Items ──────────────────────────────────────────────────────────────

export interface TrustItem {
  icon: IconName;
  emoji: string;
  title: string;
  text: string;
}

export const trustItems: TrustItem[] = [
  { icon: "shield", emoji: "🔒", title: "Provider Verification", text: "Provider verification is reviewed by our admin team before profiles go live." },
  { icon: "check", emoji: "💳", title: "Secure Payments", text: "Secure payments powered by Stripe — we never store raw card details." },
  { icon: "star", emoji: "⭐", title: "Authentic Reviews", text: "Reviews appear after completed bookings. No pay-to-rank or fabricated ratings." },
  { icon: "globe", emoji: "🌐", title: "Visa Guides", text: "50+ detailed visa guides across 190+ countries, with clear disclaimers." },
  { icon: "sparkles", emoji: "🤖", title: "AI Guidance", text: "AI tools for trip planning and document checklists — always disclaimer-first." },
  { icon: "users", emoji: "💬", title: "Support", text: "Reach our team through the support page for account and booking questions." },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface Stat {
  value: string;
  label: string;
  icon: string;
}

export const stats: Stat[] = [
  { value: "Open", label: "Verified provider onboarding open", icon: "🚀" },
  { value: "—", label: "Reviews appear after completed bookings", icon: "⭐" },
  { value: "Live", label: "Live marketplace launching", icon: "✨" },
  { value: "50+", label: "Visa guides", icon: "🛂" },
];

// ─── Roles / Account Types ────────────────────────────────────────────────────

export interface Role {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  emoji: string;
  features: string[];
  href: string;
  cta: string;
  color: string;
}

export const roles: Role[] = [
  {
    slug: "customer",
    title: "Traveler Account",
    description: "Plan trips, track visa applications, save bookings and earn referrals.",
    icon: "users", emoji: "🧳",
    features: ["Saved trips & AI itineraries", "Visa applications tracker", "Bookings & documents checklist", "Referral earnings dashboard"],
    href: "/dashboard/customer",
    cta: "Open traveler dashboard",
    color: "from-blue/15 to-blue/5",
  },
  {
    slug: "agent",
    title: "Visa Agent Account",
    description: "Offer professional visa preparation services and manage client applications.",
    icon: "agent", emoji: "👔",
    features: ["Create a verified public profile", "Client application management", "Authorization form generator", "Receive leads & build reviews"],
    href: "/dashboard/agent",
    cta: "Become a visa expert",
    color: "from-gold/15 to-gold/5",
  },
  {
    slug: "agency",
    title: "Travel Agency Account",
    description: "List packages, tickets and tours; manage leads and bookings.",
    icon: "agency", emoji: "🏢",
    features: ["List packages & flight deals", "Manage leads & bookings", "Verification badge display", "Performance & revenue insights"],
    href: "/dashboard/agency",
    cta: "Register your agency",
    color: "from-blue/15 to-blue/5",
  },
  {
    slug: "guide",
    title: "Tour Guide Account",
    description: "List local tours, set pricing and availability, and grow your reviews.",
    icon: "guide", emoji: "🧭",
    features: ["List private & group tours", "Dynamic pricing & calendar", "Automated booking management", "Guest reviews & ratings"],
    href: "/dashboard/guide",
    cta: "Become a guide",
    color: "from-gold/15 to-gold/5",
  },
  {
    slug: "host",
    title: "Property Host Account",
    description: "List houses, apartments and travel stays; capture qualified leads.",
    icon: "property", emoji: "🏠",
    features: ["List rentals, stays & sales", "Buy/sell inquiry pages", "Lead capture & contact forms", "Listing performance analytics"],
    href: "/dashboard/host",
    cta: "List your property",
    color: "from-blue/15 to-blue/5",
  },
  {
    slug: "admin",
    title: "Admin Console",
    description: "Oversee all users, verifications, listings, payments and content.",
    icon: "shield", emoji: "⚙️",
    features: ["Users, roles & verification approvals", "Listings, bookings & payments", "Referral program management", "Content & SEO page management"],
    href: "/dashboard/admin",
    cta: "Open admin console",
    color: "from-navy/15 to-navy/5",
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Is Globe Travel Voyage a government or visa authority?",
    a: "No. We are an independent AI-powered travel marketplace. We are not a government agency, embassy, immigration lawyer, airline, cruise company, real estate broker or official visa authority. We provide guidance, tools and connections to verified service providers.",
  },
  {
    q: "Do you guarantee visa approval?",
    a: "No. No platform, agent or agency can guarantee a visa approval. Decisions are made solely by the relevant government authorities. Our AI assistant and agents help you prepare the strongest possible application, but outcomes are never guaranteed.",
  },
  {
    q: "Are the flight and ticket prices guaranteed?",
    a: "No. All prices shown are sample or estimated figures for demonstration purposes and can change at any time based on availability, season and provider. Always confirm final prices directly with the airline or service provider before booking.",
  },
  {
    q: "How does the AI travel assistant work?",
    a: "Our AI assistant asks about your trip — destination, budget, days and purpose — then suggests visa types, required documents, flight routes, stay options and a step-by-step action plan. It is informational guidance only, not legal or professional advice.",
  },
  {
    q: "How are agents and agencies verified?",
    a: "Verified partners complete identity and business document checks and earn a verification badge. We also use a transparent review system with genuine traveler ratings. Always conduct your own due diligence before paying any third party.",
  },
  {
    q: "How do referral commissions work?",
    a: "Share your personal referral link, and when someone you refer completes a qualifying action on our platform, you earn commission credits. Full terms apply and payouts are subject to verification and minimum thresholds.",
  },
  {
    q: "Is this platform free to use?",
    a: "Browsing, AI guidance, visa information and most search features are completely free. Service providers may charge fees for their professional services. Platform service fees for bookings will be disclosed clearly before any purchase.",
  },
  {
    q: "Which countries and routes are covered?",
    a: "We cover 190+ countries for visa guidance and have a specific focus on Middle East–South Asia routes (UAE, Saudi, Qatar to Pakistan, India, Philippines, Bangladesh) and Pakistan/South Asia to USA, UK, Canada and Europe.",
  },
];

// ─── Travel Guides ────────────────────────────────────────────────────────────

export interface TravelGuide {
  id: string;
  title: string;
  city: string;
  country: string;
  excerpt: string;
  emoji: string;
  readTime: string;
  category: string;
  featured?: boolean;
}

export const travelGuides: TravelGuide[] = [
  { id: "g1", title: "The Complete Dubai Traveler's Guide 2026", city: "Dubai", country: "UAE", excerpt: "Everything you need: visa, transport, hotels, souks, desert and fine dining — from first-timer to frequent visitor.", emoji: "🌇", readTime: "12 min", category: "City Guide", featured: true },
  { id: "g2", title: "USA B1/B2 Visa: The Insider Preparation Guide", city: "", country: "USA", excerpt: "How verified agents prepare winning US visitor visa applications — DS-160, financials, interview prep and common mistakes.", emoji: "🇺🇸", readTime: "15 min", category: "Visa Guide", featured: true },
  { id: "g3", title: "Pakistan to USA: Cheapest Flights & Best Times", city: "", country: "Pakistan → USA", excerpt: "Route-by-route breakdown of the best airlines, booking windows and price trends for LHE, KHI and ISB to the US.", emoji: "✈️", readTime: "8 min", category: "Flights" },
  { id: "g4", title: "Umrah Guide: From Application to Return", city: "Makkah", country: "Saudi Arabia", excerpt: "Step-by-step Umrah planning: visa, ihram, tawaf, sa'i and accommodation near Masjid al-Haram.", emoji: "🕋", readTime: "10 min", category: "Religious Travel", featured: true },
  { id: "g5", title: "Switzerland on a Budget: Schengen Visa & Travel Tips", city: "Zurich", country: "Switzerland", excerpt: "How to visit Switzerland affordably: Schengen visa process, budget stays, rail passes and alpine adventures.", emoji: "🏔️", readTime: "9 min", category: "Budget Travel" },
  { id: "g6", title: "Bali: The Perfect Island Escape", city: "Bali", country: "Indonesia", excerpt: "Visa-free for most nationalities, Bali offers temples, beaches and culture at every budget level.", emoji: "🌺", readTime: "7 min", category: "Beach" },
];

// ─── AI Quick Prompts ─────────────────────────────────────────────────────────

export const aiPrompts: string[] = [
  "I have $3,000 for 10 days in Europe",
  "USA tourist visa from Pakistan — what do I need?",
  "Cheapest flights Dubai to Pakistan this month",
  "Family vacation in Switzerland for 7 days",
  "Best cruise routes under $2,000",
  "I need a furnished apartment in Dubai for 1 month",
  "Umrah package for 2 from Lahore",
  "Student visa USA F-1 requirements",
];

// ─── Disclaimer ───────────────────────────────────────────────────────────────

export const DISCLAIMER_SHORT =
  "Globe Travel Voyage is an independent travel marketplace. We are not a government agency, embassy, immigration lawyer, airline, cruise company, real estate broker, or official visa authority. We do not guarantee visa approval, legal outcomes, or ticket prices.";

// ─── Phase 3: Visa Intelligence Hub ──────────────────────────────────────────

export interface VisaHubCard {
  slug: string;
  flag: string;
  country: string;
  type: string;
  difficultyScore: number;
  difficultyLabel: string;
  difficultyColor: string;
  timeline: string;
  fee: string;
  successRate: number;
  aiRecommendation: string;
  keyDocs: string[];
  tags: string[];
}

export const visaHubCards: VisaHubCard[] = [
  {
    slug: "usa-b1b2",
    flag: "🇺🇸",
    country: "United States",
    type: "B1/B2 Tourist & Business",
    difficultyScore: 7,
    difficultyLabel: "Hard",
    difficultyColor: "bg-orange-500",
    timeline: "3–12 weeks",
    fee: "$185",
    successRate: 68,
    aiRecommendation: "Strong bank statements, employment letter, and proof of ties are critical. Apply 3+ months early. Connect with a verified visa agent for best preparation.",
    keyDocs: ["DS-160 form", "Bank statements (6 months)", "Employment letter / NOC", "Strong ties to home country", "Passport photos (2×2 in)"],
    tags: ["Popular", "AI-guided"],
  },
  {
    slug: "usa-f1",
    flag: "🇺🇸",
    country: "United States",
    type: "F-1 Student Visa",
    difficultyScore: 6,
    difficultyLabel: "Medium-Hard",
    difficultyColor: "bg-orange-400",
    timeline: "4–10 weeks",
    fee: "$185 + $350 SEVIS",
    successRate: 74,
    aiRecommendation: "Apply immediately after receiving your I-20. Demonstrate strong academic intent and financial capacity. F-1 approval rates are improving for well-prepared applicants.",
    keyDocs: ["I-20 from university", "SEVIS payment receipt", "DS-160", "Financial proof ($25k+/yr)", "Transcripts & test scores"],
    tags: ["Student", "Common"],
  },
  {
    slug: "canada",
    flag: "🇨🇦",
    country: "Canada",
    type: "Temporary Resident Visa",
    difficultyScore: 6,
    difficultyLabel: "Medium-Hard",
    difficultyColor: "bg-orange-400",
    timeline: "4–8 weeks",
    fee: "CAD $100",
    successRate: 61,
    aiRecommendation: "Canada IRCC processes online applications faster. Provide a detailed travel itinerary, strong financial proof, and previous travel history for best results.",
    keyDocs: ["IMM 5257 form", "Bank statements", "Invitation letter (if applicable)", "Travel history", "Employment proof"],
    tags: ["Popular"],
  },
  {
    slug: "uk",
    flag: "🇬🇧",
    country: "United Kingdom",
    type: "Standard Visitor Visa",
    difficultyScore: 6,
    difficultyLabel: "Medium-Hard",
    difficultyColor: "bg-orange-400",
    timeline: "3–6 weeks",
    fee: "£115",
    successRate: 72,
    aiRecommendation: "The UK visa has improved approval rates with a clear itinerary, hotel bookings, and strong financial proof. Emphasize intent to return home.",
    keyDocs: ["Online application form", "Bank statements (6 months)", "Invitation letter (optional)", "Hotel + flight bookings", "Employment proof"],
    tags: ["Europe gateway"],
  },
  {
    slug: "schengen",
    flag: "🇪🇺",
    country: "Schengen Zone (26 countries)",
    type: "Type C Short-Stay Visa",
    difficultyScore: 7,
    difficultyLabel: "Hard",
    difficultyColor: "bg-orange-500",
    timeline: "2–4 weeks",
    fee: "€90",
    successRate: 65,
    aiRecommendation: "Apply at the consulate of your main destination. Biometrics required. Travel insurance (€30k coverage) is mandatory. Early applications get better appointment slots.",
    keyDocs: ["Application form", "Travel insurance (€30k+)", "Hotel bookings", "Round-trip tickets", "Bank statements (3 months)"],
    tags: ["26 countries", "Popular"],
  },
  {
    slug: "uae",
    flag: "🇦🇪",
    country: "United Arab Emirates",
    type: "Tourist eVisa / Visa on Arrival",
    difficultyScore: 2,
    difficultyLabel: "Easy",
    difficultyColor: "bg-emerald-500",
    timeline: "24–72 hours",
    fee: "AED 250–350",
    successRate: 96,
    aiRecommendation: "Most nationalities get UAE visa on arrival or eVisa very quickly. Apply via official GDRFA or ICA portal. Very high approval rate with a clean travel history.",
    keyDocs: ["Valid passport (6+ months)", "Photo", "Return ticket", "Hotel booking", "Travel insurance"],
    tags: ["Fast", "Easy"],
  },
  {
    slug: "saudi",
    flag: "🇸🇦",
    country: "Saudi Arabia",
    type: "Tourist eVisa",
    difficultyScore: 3,
    difficultyLabel: "Easy-Medium",
    difficultyColor: "bg-yellow-500",
    timeline: "Minutes to 24 hours",
    fee: "SAR 300",
    successRate: 91,
    aiRecommendation: "Saudi Arabia's eVisa is now available for 50+ nationalities online. Apply via the official Visa Platform. No sponsor needed for tourist visits.",
    keyDocs: ["Valid passport", "Credit card for payment", "Photo", "Travel insurance"],
    tags: ["eVisa", "Fast"],
  },
  {
    slug: "pakistan",
    flag: "🇵🇰",
    country: "Pakistan",
    type: "e-Visa / Visa on Arrival",
    difficultyScore: 3,
    difficultyLabel: "Easy-Medium",
    difficultyColor: "bg-yellow-500",
    timeline: "3–5 business days",
    fee: "Varies by nationality",
    successRate: 89,
    aiRecommendation: "Pakistan has opened e-Visa for 175+ countries. Business visa requires sponsor letter. Tourist visa is straightforward for most nationalities.",
    keyDocs: ["Valid passport", "Photo", "Hotel booking or invitation", "Return ticket"],
    tags: ["eVisa", "Open"],
  },
];

// ─── Phase 3: Smart Ticket Marketplace ───────────────────────────────────────

export interface TicketRoute {
  id: string;
  fromFlag: string;
  from: string;
  fromCode: string;
  toFlag: string;
  to: string;
  toCode: string;
  airlines: string[];
  priceFrom: string;
  priceTo: string;
  cheapestMonth: string;
  duration: string;
  tip: string;
  trending: boolean;
  region: "gulf-pk" | "gulf-india" | "gulf-ph" | "pk-west" | "other";
}

export const ticketRoutes: TicketRoute[] = [
  {
    id: "dxb-lhe",
    fromFlag: "🇦🇪",
    from: "Dubai",
    fromCode: "DXB",
    toFlag: "🇵🇰",
    to: "Lahore",
    toCode: "LHE",
    airlines: ["Emirates", "PIA", "FlyDubai"],
    priceFrom: "$145",
    priceTo: "$320",
    cheapestMonth: "September",
    duration: "2h 30m",
    tip: "Book 3 weeks ahead for the best fares. Tuesday departures are usually cheapest.",
    trending: true,
    region: "gulf-pk",
  },
  {
    id: "dxb-khi",
    fromFlag: "🇦🇪",
    from: "Dubai",
    fromCode: "DXB",
    toFlag: "🇵🇰",
    to: "Karachi",
    toCode: "KHI",
    airlines: ["Emirates", "FlyDubai", "PIA"],
    priceFrom: "$155",
    priceTo: "$340",
    cheapestMonth: "October",
    duration: "2h 10m",
    tip: "FlyDubai often has flash sales on this route. Set price alerts for best deals.",
    trending: true,
    region: "gulf-pk",
  },
  {
    id: "ruh-lhe",
    fromFlag: "🇸🇦",
    from: "Riyadh",
    fromCode: "RUH",
    toFlag: "🇵🇰",
    to: "Lahore",
    toCode: "LHE",
    airlines: ["Saudia", "PIA", "Air Arabia"],
    priceFrom: "$170",
    priceTo: "$380",
    cheapestMonth: "August",
    duration: "3h 20m",
    tip: "Saudia and PIA compete heavily on this route — compare both for savings.",
    trending: false,
    region: "gulf-pk",
  },
  {
    id: "doh-khi",
    fromFlag: "🇶🇦",
    from: "Doha",
    fromCode: "DOH",
    toFlag: "🇵🇰",
    to: "Karachi",
    toCode: "KHI",
    airlines: ["Qatar Airways", "PIA"],
    priceFrom: "$180",
    priceTo: "$360",
    cheapestMonth: "November",
    duration: "2h 50m",
    tip: "Qatar Airways Business Class upgrades available from $90 extra on this route.",
    trending: false,
    region: "gulf-pk",
  },
  {
    id: "dxb-del",
    fromFlag: "🇦🇪",
    from: "Dubai",
    fromCode: "DXB",
    toFlag: "🇮🇳",
    to: "Delhi",
    toCode: "DEL",
    airlines: ["Emirates", "IndiGo", "Air India", "FlyDubai"],
    priceFrom: "$130",
    priceTo: "$290",
    cheapestMonth: "September",
    duration: "3h 15m",
    tip: "IndiGo often offers very competitive prices on this route. Book early.",
    trending: true,
    region: "gulf-india",
  },
  {
    id: "dxb-mum",
    fromFlag: "🇦🇪",
    from: "Dubai",
    fromCode: "DXB",
    toFlag: "🇮🇳",
    to: "Mumbai",
    toCode: "BOM",
    airlines: ["Emirates", "Air India", "SpiceJet"],
    priceFrom: "$125",
    priceTo: "$280",
    cheapestMonth: "October",
    duration: "2h 55m",
    tip: "Air India direct flights from $125 one-way during off-peak. Great value route.",
    trending: false,
    region: "gulf-india",
  },
  {
    id: "dxb-mnl",
    fromFlag: "🇦🇪",
    from: "Dubai",
    fromCode: "DXB",
    toFlag: "🇵🇭",
    to: "Manila",
    toCode: "MNL",
    airlines: ["Emirates", "Philippine Airlines", "Cebu Pacific"],
    priceFrom: "$220",
    priceTo: "$490",
    cheapestMonth: "February",
    duration: "8h 30m",
    tip: "Cebu Pacific sometimes runs $199 sales. Check for promo codes in advance.",
    trending: true,
    region: "gulf-ph",
  },
  {
    id: "khi-jfk",
    fromFlag: "🇵🇰",
    from: "Karachi",
    fromCode: "KHI",
    toFlag: "🇺🇸",
    to: "New York (JFK)",
    toCode: "JFK",
    airlines: ["Turkish Airlines", "Emirates", "Qatar Airways"],
    priceFrom: "$720",
    priceTo: "$1,400",
    cheapestMonth: "January",
    duration: "16–20h (1 stop)",
    tip: "Turkish Airlines via Istanbul is usually the cheapest. Book 2–3 months ahead for under $800.",
    trending: true,
    region: "pk-west",
  },
  {
    id: "lhe-lhr",
    fromFlag: "🇵🇰",
    from: "Lahore",
    fromCode: "LHE",
    toFlag: "🇬🇧",
    to: "London (LHR)",
    toCode: "LHR",
    airlines: ["PIA", "Qatar Airways", "Turkish Airlines"],
    priceFrom: "$580",
    priceTo: "$1,200",
    cheapestMonth: "January",
    duration: "10–14h (1 stop)",
    tip: "PIA offers direct Lahore–London flights. Qatar Airways via Doha often has better prices.",
    trending: false,
    region: "pk-west",
  },
  {
    id: "dac-dxb",
    fromFlag: "🇧🇩",
    from: "Dhaka",
    fromCode: "DAC",
    toFlag: "🇸🇦",
    to: "Riyadh",
    toCode: "RUH",
    airlines: ["Biman", "Saudia", "Air Arabia"],
    priceFrom: "$190",
    priceTo: "$420",
    cheapestMonth: "March",
    duration: "5h 30m",
    tip: "Biman Bangladesh Airlines is often cheapest but check alliance partners for better service.",
    trending: false,
    region: "other",
  },
];

// ─── Phase 3: Property Marketplace ───────────────────────────────────────────

export interface PropertyListing {
  id: string;
  name: string;
  type: "stay" | "rent" | "sale";
  city: string;
  country: string;
  flag: string;
  price: string;
  per: string;
  beds: number;
  sqft: number;
  rating: number;
  reviews: number;
  host: string;
  verified: boolean;
  amenities: string[];
  emoji: string;
  tag?: string;
  gradient: string;
}

export const propertyListings: PropertyListing[] = [
  {
    id: "p1",
    name: "Marina View 2BR Apartment",
    type: "stay",
    city: "Dubai Marina",
    country: "UAE",
    flag: "🇦🇪",
    price: "$180",
    per: "night",
    beds: 2,
    sqft: 1100,
    rating: 4.9,
    reviews: 84,
    host: "Omar F.",
    verified: true,
    amenities: ["Pool", "Gym", "Parking", "WiFi", "Sea view"],
    emoji: "🏙️",
    tag: "Superhost",
    gradient: "from-blue/20 to-blue/5",
  },
  {
    id: "p2",
    name: "Furnished Studio — JLT",
    type: "rent",
    city: "JLT, Dubai",
    country: "UAE",
    flag: "🇦🇪",
    price: "$650",
    per: "month",
    beds: 0,
    sqft: 480,
    rating: 4.7,
    reviews: 31,
    host: "Fatima A.",
    verified: true,
    amenities: ["WiFi", "AC", "Gym", "Metro nearby"],
    emoji: "🏢",
    tag: "Great value",
    gradient: "from-gold/20 to-gold/5",
  },
  {
    id: "p3",
    name: "3BR Villa — Jumeirah",
    type: "sale",
    city: "Jumeirah, Dubai",
    country: "UAE",
    flag: "🇦🇪",
    price: "$1.2M",
    per: "sale",
    beds: 3,
    sqft: 2800,
    rating: 0,
    reviews: 0,
    host: "Omar F.",
    verified: true,
    amenities: ["Private pool", "Maid's room", "2 parking", "Near beach"],
    emoji: "🏡",
    tag: "Investment",
    gradient: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    id: "p4",
    name: "Sea-view 1BR — Seaview Towers",
    type: "stay",
    city: "Karachi, Pakistan",
    country: "Pakistan",
    flag: "🇵🇰",
    price: "$55",
    per: "night",
    beds: 1,
    sqft: 750,
    rating: 4.6,
    reviews: 22,
    host: "Zara K.",
    verified: true,
    amenities: ["Sea view", "WiFi", "Generator", "Security"],
    emoji: "🌊",
    gradient: "from-blue/15 to-blue/5",
  },
  {
    id: "p5",
    name: "Modern 2BR — BGC",
    type: "rent",
    city: "BGC, Manila",
    country: "Philippines",
    flag: "🇵🇭",
    price: "$900",
    per: "month",
    beds: 2,
    sqft: 920,
    rating: 4.8,
    reviews: 45,
    host: "Maria L.",
    verified: true,
    amenities: ["Pool", "Gym", "24h security", "Mall access"],
    emoji: "🏙️",
    tag: "Popular area",
    gradient: "from-purple-500/15 to-purple-500/5",
  },
  {
    id: "p6",
    name: "Penthouse — Downtown Dubai",
    type: "stay",
    city: "Downtown Dubai",
    country: "UAE",
    flag: "🇦🇪",
    price: "$450",
    per: "night",
    beds: 3,
    sqft: 3200,
    rating: 5.0,
    reviews: 17,
    host: "Khalid R.",
    verified: true,
    amenities: ["Burj Khalifa view", "Private terrace", "Butler", "Chef"],
    emoji: "👑",
    tag: "Luxury",
    gradient: "from-gold/25 to-gold/8",
  },
];

// ─── Phase 3: Verified Marketplace Providers ─────────────────────────────────

export interface MarketplaceProvider {
  id: string;
  name: string;
  role: "visa-agent" | "agency" | "guide" | "host";
  roleLabel: string;
  flag: string;
  country: string;
  city: string;
  avatar: string;
  rating: number;
  reviews: number;
  responseTime: string;
  languages: string[];
  specialization: string;
  services: string[];
  verified: boolean;
  featured: boolean;
  priceFrom: string;
}

export const marketplaceProviders: MarketplaceProvider[] = [
  {
    id: "mp1",
    name: "Sana Malik",
    role: "visa-agent",
    roleLabel: "Visa Expert",
    flag: "🇦🇪",
    country: "UAE",
    city: "Dubai",
    avatar: "SM",
    rating: 4.9,
    reviews: 312,
    responseTime: "< 1 hour",
    languages: ["English", "Urdu", "Arabic"],
    specialization: "USA, UK, Schengen",
    services: ["Document review", "Full application prep", "Interview coaching"],
    verified: true,
    featured: true,
    priceFrom: "$40",
  },
  {
    id: "mp2",
    name: "Voyage Pro Travels",
    role: "agency",
    roleLabel: "Travel Agency",
    flag: "🇦🇪",
    country: "UAE",
    city: "Dubai",
    avatar: "VP",
    rating: 4.8,
    reviews: 198,
    responseTime: "< 2 hours",
    languages: ["English", "Arabic", "Urdu"],
    specialization: "Gulf, Umrah, Europe, USA",
    services: ["Holiday packages", "Umrah groups", "Visa support"],
    verified: true,
    featured: true,
    priceFrom: "$299",
  },
  {
    id: "mp3",
    name: "Khalid Al-Rashidi",
    role: "guide",
    roleLabel: "Tour Guide",
    flag: "🇦🇪",
    country: "UAE",
    city: "Dubai",
    avatar: "KR",
    rating: 4.96,
    reviews: 68,
    responseTime: "< 3 hours",
    languages: ["English", "Arabic"],
    specialization: "Old Dubai, Food tours, Desert",
    services: ["Walking tours", "Food safari", "Photography tours"],
    verified: true,
    featured: false,
    priceFrom: "$35",
  },
  {
    id: "mp4",
    name: "Hassan Al-Qadi",
    role: "visa-agent",
    roleLabel: "Visa Expert",
    flag: "🇸🇦",
    country: "Saudi Arabia",
    city: "Riyadh",
    avatar: "HA",
    rating: 4.8,
    reviews: 148,
    responseTime: "< 2 hours",
    languages: ["English", "Arabic"],
    specialization: "Canada, Australia, UK",
    services: ["Application preparation", "Document checklist", "Follow-up support"],
    verified: true,
    featured: false,
    priceFrom: "$50",
  },
  {
    id: "mp5",
    name: "Orient Express Travel",
    role: "agency",
    roleLabel: "Travel Agency",
    flag: "🇵🇰",
    country: "Pakistan",
    city: "Karachi",
    avatar: "OE",
    rating: 4.7,
    reviews: 124,
    responseTime: "< 4 hours",
    languages: ["English", "Urdu"],
    specialization: "UK, Canada, USA packages",
    services: ["Visa + Ticket packages", "Family tours", "Student travel"],
    verified: true,
    featured: false,
    priceFrom: "$180",
  },
  {
    id: "mp6",
    name: "Omar Al-Farsi",
    role: "host",
    roleLabel: "Property Host",
    flag: "🇦🇪",
    country: "UAE",
    city: "Dubai",
    avatar: "OF",
    rating: 4.8,
    reviews: 84,
    responseTime: "< 2 hours",
    languages: ["English", "Arabic"],
    specialization: "Luxury stays, Monthly rentals",
    services: ["Short stays", "Monthly rentals", "Investment properties"],
    verified: true,
    featured: false,
    priceFrom: "$55/night",
  },
];
