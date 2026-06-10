// Central mock data for Globe Travel Voyage.
// All static so the frontend builds and deploys without external services.

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
  | "doc";

export interface Service {
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  accent: string;
}

export const services: Service[] = [
  {
    slug: "visa",
    title: "Visa Marketplace",
    description: "AI visa guidance for every country plus verified visa agents.",
    href: "/visa",
    icon: "visa",
    accent: "from-blue/15 to-blue/5",
  },
  {
    slug: "flights",
    title: "Flights",
    description: "Compare cheap routes across the Middle East, Asia & the West.",
    href: "/flights",
    icon: "flight",
    accent: "from-navy/15 to-navy/5",
  },
  {
    slug: "hotels",
    title: "Hotels & Stays",
    description: "Hotels, apartments and long-stay rentals worldwide.",
    href: "/hotels",
    icon: "hotel",
    accent: "from-gold/20 to-gold/5",
  },
  {
    slug: "car-rentals",
    title: "Car Rentals",
    description: "Self-drive and chauffeur cars in 90+ countries.",
    href: "/car-rentals",
    icon: "car",
    accent: "from-blue/15 to-blue/5",
  },
  {
    slug: "cruises",
    title: "Cruises, Boats & Ships",
    description: "Ocean cruises, river boats and private charters.",
    href: "/cruises",
    icon: "cruise",
    accent: "from-navy/15 to-navy/5",
  },
  {
    slug: "tours",
    title: "Local Tours",
    description: "Guided experiences led by verified local tour guides.",
    href: "/tours",
    icon: "tour",
    accent: "from-gold/20 to-gold/5",
  },
  {
    slug: "tickets",
    title: "Attraction Tickets",
    description: "Skip-the-line tickets to top global attractions.",
    href: "/tickets",
    icon: "ticket",
    accent: "from-blue/15 to-blue/5",
  },
  {
    slug: "trip-planner",
    title: "AI Trip Planner",
    description: "Build a full itinerary from your budget and travel days.",
    href: "/trip-planner",
    icon: "planner",
    accent: "from-navy/15 to-navy/5",
  },
  {
    slug: "properties",
    title: "Properties",
    description: "Rent or buy/sell travel-related homes and apartments.",
    href: "/properties",
    icon: "property",
    accent: "from-gold/20 to-gold/5",
  },
];

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
}

export const visas: Visa[] = [
  {
    slug: "usa-b1-b2",
    country: "United States",
    flag: "🇺🇸",
    type: "B1/B2 Visitor Visa",
    category: "Visitor",
    summary:
      "Tourism, business meetings and family visits to the USA on a non-immigrant visitor visa.",
    processing: "3–12 weeks (varies by embassy)",
    validity: "Up to 10 years (multiple entry)",
    stay: "Up to 6 months per entry",
    feeFrom: "$185 (consular fee)",
    difficulty: "Complex",
    featured: true,
    documents: [
      "Valid passport (6+ months validity)",
      "DS-160 confirmation page",
      "Visa fee payment receipt",
      "Interview appointment letter",
      "Recent photograph (per spec)",
      "Proof of funds / bank statements",
      "Employment or business proof",
      "Travel itinerary & ties to home country",
    ],
    steps: [
      "Complete the DS-160 online form",
      "Pay the consular visa fee",
      "Schedule biometrics & interview",
      "Prepare supporting documents",
      "Attend the visa interview",
      "Track passport return",
    ],
  },
  {
    slug: "usa-f1-student",
    country: "United States",
    flag: "🇺🇸",
    type: "F-1 Student Visa",
    category: "Student",
    summary:
      "Study at an accredited US college or university with an approved I-20.",
    processing: "4–10 weeks",
    validity: "Duration of study program",
    stay: "Program length + grace period",
    feeFrom: "$185 + SEVIS $350",
    difficulty: "Complex",
    featured: true,
    documents: [
      "Form I-20 from your school",
      "SEVIS fee payment receipt",
      "DS-160 confirmation",
      "Proof of academic admission",
      "Financial support evidence",
      "Academic transcripts & test scores",
    ],
    steps: [
      "Get admission & Form I-20",
      "Pay the SEVIS I-901 fee",
      "Complete DS-160 & pay visa fee",
      "Book the visa interview",
      "Attend interview with documents",
    ],
  },
  {
    slug: "uk-standard-visitor",
    country: "United Kingdom",
    flag: "🇬🇧",
    type: "Standard Visitor Visa",
    category: "Visitor",
    summary: "Tourism, family visits and short business trips to the UK.",
    processing: "3 weeks (standard)",
    validity: "6 months (or 2/5/10 year options)",
    stay: "Up to 6 months",
    feeFrom: "£115",
    difficulty: "Moderate",
    documents: [
      "Valid passport",
      "Online application form",
      "Proof of funds",
      "Accommodation & travel details",
      "Employment / study proof",
    ],
    steps: [
      "Apply online & pay the fee",
      "Book a biometrics appointment",
      "Upload supporting documents",
      "Attend the visa centre",
      "Receive decision",
    ],
  },
  {
    slug: "canada-visitor",
    country: "Canada",
    flag: "🇨🇦",
    type: "Visitor Visa (TRV)",
    category: "Visitor",
    summary: "Temporary Resident Visa for tourism and family visits to Canada.",
    processing: "4–12 weeks",
    validity: "Up to 10 years (multiple entry)",
    stay: "Up to 6 months",
    feeFrom: "CAD $100",
    difficulty: "Moderate",
    documents: [
      "Valid passport",
      "Online application (IRCC)",
      "Proof of funds",
      "Purpose of travel / invitation",
      "Biometrics",
    ],
    steps: [
      "Create an IRCC account",
      "Complete the application",
      "Pay fees & give biometrics",
      "Submit & track the application",
    ],
  },
  {
    slug: "schengen",
    country: "Schengen Area",
    flag: "🇪🇺",
    type: "Schengen Short-Stay Visa",
    category: "Visitor",
    summary: "Travel across 29 European countries on a single short-stay visa.",
    processing: "15–45 days",
    validity: "Up to 5 years (multiple entry)",
    stay: "90 days within any 180 days",
    feeFrom: "€90",
    difficulty: "Moderate",
    documents: [
      "Valid passport",
      "Completed application form",
      "Travel medical insurance (€30,000+)",
      "Flight & hotel reservations",
      "Proof of funds",
    ],
    steps: [
      "Identify the main destination country",
      "Book an appointment at the consulate",
      "Prepare documents & insurance",
      "Attend the appointment",
      "Collect your passport",
    ],
  },
  {
    slug: "uae-tourist",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    type: "Tourist Visa",
    category: "Visitor",
    summary: "30 or 60-day tourist visa for Dubai, Abu Dhabi and the UAE.",
    processing: "2–5 business days",
    validity: "60 days from issue",
    stay: "30 or 60 days",
    feeFrom: "$90",
    difficulty: "Easy",
    documents: [
      "Passport copy (6+ months)",
      "Passport-size photo",
      "Confirmed return ticket",
      "Hotel booking",
    ],
    steps: [
      "Apply online or via an agent",
      "Upload passport & photo",
      "Pay the visa fee",
      "Receive e-visa by email",
    ],
  },
  {
    slug: "saudi-tourist",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    type: "Tourist eVisa",
    category: "Visitor",
    summary: "1-year multiple-entry tourist eVisa including Umrah eligibility.",
    processing: "Minutes to 72 hours",
    validity: "1 year (multiple entry)",
    stay: "Up to 90 days",
    feeFrom: "$80 + insurance",
    difficulty: "Easy",
    documents: [
      "Valid passport",
      "Photograph",
      "Confirmed accommodation",
      "Travel insurance",
    ],
    steps: [
      "Apply on the official eVisa portal",
      "Upload photo & passport",
      "Pay visa & insurance fee",
      "Download the eVisa",
    ],
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
];

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
}

export const cheapRoutes: Route[] = [
  { id: "r1", from: "Dubai", to: "Lahore", fromCode: "DXB", toCode: "LHE", priceFrom: "$165", airlines: ["Fly Jinnah", "Air Arabia"], duration: "3h 10m", stops: "Direct", tag: "Hot deal" },
  { id: "r2", from: "Riyadh", to: "Karachi", fromCode: "RUH", toCode: "KHI", priceFrom: "$180", airlines: ["PIA", "Saudia"], duration: "3h 45m", stops: "Direct" },
  { id: "r3", from: "Dubai", to: "Manila", fromCode: "DXB", toCode: "MNL", priceFrom: "$320", airlines: ["Emirates", "Cebu Pacific"], duration: "8h 30m", stops: "Direct", tag: "Popular" },
  { id: "r4", from: "Doha", to: "Dhaka", fromCode: "DOH", toCode: "DAC", priceFrom: "$240", airlines: ["Qatar Airways", "US-Bangla"], duration: "5h 10m", stops: "Direct" },
  { id: "r5", from: "Abu Dhabi", to: "Delhi", fromCode: "AUH", toCode: "DEL", priceFrom: "$150", airlines: ["Etihad", "IndiGo"], duration: "3h 30m", stops: "Direct", tag: "Cheapest" },
  { id: "r6", from: "Dubai", to: "Mumbai", fromCode: "DXB", toCode: "BOM", priceFrom: "$140", airlines: ["Emirates", "IndiGo"], duration: "3h 15m", stops: "Direct" },
  { id: "r7", from: "Jeddah", to: "Islamabad", fromCode: "JED", toCode: "ISB", priceFrom: "$210", airlines: ["Saudia", "PIA"], duration: "4h 20m", stops: "Direct" },
  { id: "r8", from: "Kuwait", to: "Manila", fromCode: "KWI", toCode: "MNL", priceFrom: "$340", airlines: ["Kuwait Airways", "Gulf Air"], duration: "9h 40m", stops: "1 stop" },
];

export const usaRoutes: Route[] = [
  { id: "u1", from: "Lahore", to: "New York", fromCode: "LHE", toCode: "JFK", priceFrom: "$760", airlines: ["Qatar Airways", "Turkish"], duration: "18h 30m", stops: "1 stop", tag: "PK → USA" },
  { id: "u2", from: "Karachi", to: "Washington", fromCode: "KHI", toCode: "IAD", priceFrom: "$820", airlines: ["Qatar Airways", "Etihad"], duration: "19h 10m", stops: "1 stop", tag: "PK → USA" },
  { id: "u3", from: "Islamabad", to: "Chicago", fromCode: "ISB", toCode: "ORD", priceFrom: "$880", airlines: ["Turkish", "Emirates"], duration: "20h 05m", stops: "1 stop", tag: "PK → USA" },
];

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

export interface Stay {
  id: string;
  name: string;
  city: string;
  country: string;
  type: "Hotel" | "Apartment" | "Villa" | "Long Stay";
  rating: number;
  reviews: number;
  pricePerNight: string;
  amenities: string[];
  emoji: string;
}

export const stays: Stay[] = [
  { id: "s1", name: "Burj Vista Residences", city: "Dubai", country: "UAE", type: "Apartment", rating: 4.9, reviews: 412, pricePerNight: "$180", amenities: ["Pool", "Gym", "Kitchen"], emoji: "🏙️" },
  { id: "s2", name: "Marina Bay Hotel", city: "Karachi", country: "Pakistan", type: "Hotel", rating: 4.6, reviews: 238, pricePerNight: "$70", amenities: ["Breakfast", "WiFi", "Parking"], emoji: "🏨" },
  { id: "s3", name: "Makkah Clock Suites", city: "Makkah", country: "Saudi Arabia", type: "Hotel", rating: 4.8, reviews: 905, pricePerNight: "$140", amenities: ["Haram view", "Shuttle"], emoji: "🕌" },
  { id: "s4", name: "Makati Sky Apartments", city: "Manila", country: "Philippines", type: "Apartment", rating: 4.7, reviews: 156, pricePerNight: "$60", amenities: ["Pool", "Kitchen", "Gym"], emoji: "🌆" },
  { id: "s5", name: "Heritage Haveli", city: "Jaipur", country: "India", type: "Villa", rating: 4.9, reviews: 321, pricePerNight: "$120", amenities: ["Pool", "Breakfast"], emoji: "🏰" },
  { id: "s6", name: "Riverside Long Stay", city: "Dhaka", country: "Bangladesh", type: "Long Stay", rating: 4.5, reviews: 88, pricePerNight: "$45", amenities: ["Monthly rate", "Kitchen"], emoji: "🏘️" },
];

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
  { id: "cr2", name: "Mediterranean Jewel", type: "Cruise", region: "Italy · Greece · Spain", nights: 7, priceFrom: "$890", highlights: ["Balcony cabins", "Excursions"], emoji: "🚢" },
  { id: "cr3", name: "Dubai Marina Yacht", type: "Yacht", region: "Dubai Marina", nights: 0, priceFrom: "$300", highlights: ["Private charter", "Sunset"], emoji: "⛵" },
  { id: "cr4", name: "Nile Heritage Boat", type: "Boat", region: "Luxor · Aswan, Egypt", nights: 3, priceFrom: "$260", highlights: ["River cruise", "Guided"], emoji: "🛶" },
  { id: "cr5", name: "Karachi Coast Ferry", type: "Ship", region: "Karachi · Gwadar", nights: 1, priceFrom: "$60", highlights: ["Scenic coast", "Cabins"], emoji: "⛴️" },
  { id: "cr6", name: "Palawan Island Hopper", type: "Boat", region: "El Nido, Philippines", nights: 0, priceFrom: "$45", highlights: ["Lagoons", "Snorkel"], emoji: "🚤" },
];

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
  { id: "t5", title: "Riyadh Edge of the World", city: "Riyadh", country: "Saudi Arabia", guide: "Khalid A.", duration: "6 hours", price: "$80", rating: 4.8, reviews: 134, emoji: "🏜️" },
  { id: "t6", title: "Old Dhaka Rickshaw Tour", city: "Dhaka", country: "Bangladesh", guide: "Imran H.", duration: "4 hours", price: "$25", rating: 4.6, reviews: 71, emoji: "🛺" },
];

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
}

export const agents: Agent[] = [
  { id: "a1", name: "Sana Malik", title: "Senior Visa Consultant", specialties: ["USA B1/B2", "UK Visitor", "Schengen"], countries: ["Pakistan", "UAE"], rating: 4.9, reviews: 312, verified: true, cases: 1450, initials: "SM" },
  { id: "a2", name: "Omar Haddad", title: "Visa & Immigration Advisor", specialties: ["Canada", "Australia", "Schengen"], countries: ["UAE", "Saudi Arabia"], rating: 4.8, reviews: 204, verified: true, cases: 980, initials: "OH" },
  { id: "a3", name: "Priya Nair", title: "Student Visa Specialist", specialties: ["USA F-1", "UK Student", "Canada Study"], countries: ["India", "UAE"], rating: 4.9, reviews: 189, verified: true, cases: 760, initials: "PN" },
  { id: "a4", name: "Reyes Santos", title: "Documentation Expert", specialties: ["UAE", "Saudi", "Schengen"], countries: ["Philippines"], rating: 4.7, reviews: 122, verified: true, cases: 540, initials: "RS" },
];

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
}

export const agencies: Agency[] = [
  { id: "ag1", name: "Voyage Pro Travels", city: "Dubai", country: "UAE", services: ["Flights", "Visa", "Packages"], rating: 4.8, reviews: 540, verified: true, packages: 32, initials: "VP" },
  { id: "ag2", name: "Skyline Tours", city: "Lahore", country: "Pakistan", services: ["Umrah", "Tours", "Tickets"], rating: 4.7, reviews: 410, verified: true, packages: 24, initials: "ST" },
  { id: "ag3", name: "Pearl Holidays", city: "Manila", country: "Philippines", services: ["Packages", "Cruises", "Hotels"], rating: 4.6, reviews: 288, verified: true, packages: 18, initials: "PH" },
  { id: "ag4", name: "Crescent Travel House", city: "Riyadh", country: "Saudi Arabia", services: ["Umrah", "Flights", "Visa"], rating: 4.9, reviews: 622, verified: true, packages: 40, initials: "CT" },
];

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

export interface Destination {
  city: string;
  country: string;
  tagline: string;
  fromPrice: string;
  emoji: string;
}

export const destinations: Destination[] = [
  { city: "Dubai", country: "UAE", tagline: "Skyline, souks & desert", fromPrice: "$140", emoji: "🌇" },
  { city: "Istanbul", country: "Turkey", tagline: "Where East meets West", fromPrice: "$220", emoji: "🕌" },
  { city: "Makkah", country: "Saudi Arabia", tagline: "Umrah & pilgrimage", fromPrice: "$210", emoji: "🕋" },
  { city: "London", country: "UK", tagline: "History & culture", fromPrice: "$480", emoji: "🎡" },
  { city: "New York", country: "USA", tagline: "The city that never sleeps", fromPrice: "$690", emoji: "🗽" },
  { city: "Manila", country: "Philippines", tagline: "Islands & warmth", fromPrice: "$320", emoji: "🏝️" },
  { city: "Delhi", country: "India", tagline: "Color & heritage", fromPrice: "$150", emoji: "🕌" },
  { city: "Bali", country: "Indonesia", tagline: "Beaches & temples", fromPrice: "$390", emoji: "🌴" },
];

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
    a: "No. No platform, agent or agency can guarantee a visa approval. Decisions are made solely by the relevant authorities. Our AI assistant and agents help you prepare, but outcomes are never guaranteed.",
  },
  {
    q: "Are the flight and ticket prices guaranteed?",
    a: "No. Prices shown are sample/estimated figures for demonstration and can change at any time based on availability, season and provider. Always confirm final prices before booking.",
  },
  {
    q: "How does the AI assistant work?",
    a: "Our AI assistant asks about your trip — destination, budget, days, and purpose — then suggests visa types, documents, routes, stays and a step-by-step plan. It is informational guidance, not legal or professional advice.",
  },
  {
    q: "How are agents and agencies verified?",
    a: "Verified partners complete identity and business checks and earn a verification badge. We also use a transparent review system. Always do your own due diligence before paying anyone.",
  },
  {
    q: "How do referral commissions work?",
    a: "Share your referral link, and when someone you refer completes a qualifying action, you earn commission credits. Full terms apply and payouts are subject to verification.",
  },
];

export interface Review {
  name: string;
  location: string;
  text: string;
  rating: number;
  service: string;
}

export const reviews: Review[] = [
  { name: "Bilal A.", location: "Lahore, Pakistan", text: "The AI visa assistant explained exactly what documents I needed for my US B1/B2. Connected me with a verified agent who made it smooth.", rating: 5, service: "Visa" },
  { name: "Maria S.", location: "Dubai, UAE", text: "Found the cheapest flight from Dubai to Manila in seconds and the trip planner built my whole itinerary by budget.", rating: 5, service: "Flights" },
  { name: "Imran K.", location: "Riyadh, KSA", text: "Booked an Umrah package from a verified agency. Transparent reviews gave me real confidence.", rating: 5, service: "Packages" },
  { name: "Anjali R.", location: "Delhi, India", text: "Loved the tours marketplace. Our local guide in Agra was fantastic and verified.", rating: 5, service: "Tours" },
];

export interface ReferralTier {
  name: string;
  referrals: string;
  commission: string;
  perks: string[];
  highlight?: boolean;
}

export const referralTiers: ReferralTier[] = [
  { name: "Explorer", referrals: "1–10 referrals", commission: "5% commission", perks: ["Personal referral link", "Dashboard tracking", "Monthly payouts"] },
  { name: "Voyager", referrals: "11–50 referrals", commission: "8% commission", perks: ["Everything in Explorer", "Priority support", "Bonus credits"], highlight: true },
  { name: "Ambassador", referrals: "50+ referrals", commission: "12% commission", perks: ["Everything in Voyager", "Co-marketing", "Dedicated manager"] },
];

export interface TrustItem {
  icon: IconName;
  title: string;
  text: string;
}

export const trustItems: TrustItem[] = [
  { icon: "shield", title: "Verified Partners", text: "Identity & business checks for agents, agencies, guides and hosts." },
  { icon: "star", title: "Transparent Reviews", text: "Real ratings from real travelers — no pay-to-rank." },
  { icon: "doc", title: "Clear Disclaimers", text: "We never guarantee visas, prices or approvals. You stay informed." },
  { icon: "users", title: "Human + AI", text: "AI guidance plus access to verified human experts when you need them." },
];

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "190+", label: "Countries covered" },
  { value: "12k+", label: "Verified providers" },
  { value: "50+", label: "Visa guides" },
  { value: "4.9★", label: "Average rating" },
];

export interface Role {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  features: string[];
  href: string;
  cta: string;
}

export const roles: Role[] = [
  {
    slug: "customer",
    title: "Traveler Account",
    description: "Plan trips, track visa applications, save bookings and earn referrals.",
    icon: "users",
    features: ["Saved trips & itineraries", "Visa applications tracker", "Bookings & documents checklist", "Referrals & support messages"],
    href: "/dashboard/customer",
    cta: "Open traveler dashboard",
  },
  {
    slug: "agent",
    title: "Visa Agent Account",
    description: "Offer visa preparation services and manage client applications.",
    icon: "agent",
    features: ["Create a public profile", "Manage client applications", "Authorization form template", "Receive leads & reviews"],
    href: "/dashboard/agent",
    cta: "Open agent dashboard",
  },
  {
    slug: "agency",
    title: "Travel Agency Account",
    description: "List packages, tickets and tours, and manage leads & bookings.",
    icon: "agency",
    features: ["List packages & tickets", "Manage leads & bookings", "Verification badge", "Performance insights"],
    href: "/dashboard/agency",
    cta: "Open agency dashboard",
  },
  {
    slug: "guide",
    title: "Tour Guide Account",
    description: "List local tours, set pricing and availability, and grow reviews.",
    icon: "guide",
    features: ["List local tours", "Pricing & availability", "Booking calendar", "Reviews & ratings"],
    href: "/dashboard/agency",
    cta: "Become a guide",
  },
  {
    slug: "host",
    title: "Property Host Account",
    description: "List houses & apartments for rent or sale and capture leads.",
    icon: "property",
    features: ["List rentals & stays", "Buy/sell inquiry pages", "Contact lead forms", "Listing performance"],
    href: "/dashboard/agency",
    cta: "List your property",
  },
  {
    slug: "admin",
    title: "Admin Console",
    description: "Oversee users, verifications, listings, payments and content.",
    icon: "shield",
    features: ["Users, roles & approvals", "Listings & bookings", "Payments & referrals", "Content & SEO pages"],
    href: "/dashboard/admin",
    cta: "Open admin console",
  },
];

export const DISCLAIMER_SHORT =
  "Globe Travel Voyage is an independent travel marketplace. We are not a government agency, embassy, immigration lawyer, airline, cruise company, real estate broker, or official visa authority. We do not guarantee visa approval, legal outcomes, or ticket prices.";
