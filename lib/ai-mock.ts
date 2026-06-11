// =============================================================================
// Globe Travel Voyage — Mock AI Engine
// =============================================================================
// STATUS: Mock only. All responses are pre-written heuristic rules.
//
// To enable real AI:
//   1. Add OPENAI_API_KEY to .env.local
//   2. Install: npm install openai
//   3. Create app/api/ai/route.ts with:
//      import OpenAI from "openai";
//      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//      export async function POST(req: Request) {
//        const { messages } = await req.json();
//        const res = await openai.chat.completions.create({ model: "gpt-4o", messages });
//        return Response.json(res.choices[0].message);
//      }
//   4. Replace mock functions below with fetch("/api/ai", ...) calls
//
// Disclaimer: Mock responses are illustrative only. Not legal/immigration advice.
// =============================================================================

export interface AiMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  cards?: AiCard[];
  timestamp: Date;
}

export interface AiCard {
  type: "info" | "checklist" | "warning" | "itinerary" | "flight" | "tip" | "risk";
  title: string;
  items?: string[];
  value?: string;
  subtext?: string;
  score?: number;
  color?: "blue" | "gold" | "red" | "green" | "navy";
}

// ── Typing delay helper ───────────────────────────────────────────────────────

export function mockDelay(min = 1000, max = 2200): Promise<void> {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ═════════════════════════════════════════════════════════════════════════════
// GENERAL TRAVEL ASSISTANT
// ═════════════════════════════════════════════════════════════════════════════

export interface TravelQuery {
  message: string;
  context?: string;
}

export function mockTravelReply(input: string): { text: string; cards?: AiCard[] } {
  const q = input.toLowerCase();

  if (q.includes("visa") && (q.includes("usa") || q.includes("america") || q.includes("united states"))) {
    return {
      text: "For the **USA**, most travelers need a B1/B2 Visitor Visa (tourism & business) or, if studying, the F-1 Student Visa. Here's a quick overview:",
      cards: [
        { type: "info",      title: "B1/B2 Visitor Visa",   value: "$185 MRV fee",   subtext: "Valid 10 years, multiple entry for most nationalities" },
        { type: "checklist", title: "Core documents needed", items: ["Valid passport (6+ months)", "DS-160 confirmation", "Proof of financial support", "Strong ties to home country", "Travel itinerary"] },
        { type: "warning",   title: "Disclaimer",            value: "No approval guaranteed. This is AI guidance, not legal or immigration advice.", color: "gold" },
      ],
    };
  }
  if (q.includes("visa") && q.includes("uk")) {
    return {
      text: "For the **UK Standard Visitor Visa**, here's what you need to know:",
      cards: [
        { type: "info",      title: "UK Standard Visitor",  value: "£115 fee",        subtext: "Up to 6 months stay, valid 2–10 years" },
        { type: "checklist", title: "Key documents",        items: ["Valid passport", "Bank statements (3–6 months)", "Proof of employment/business", "Return ticket", "Accommodation proof", "Travel history (helps approval)"] },
        { type: "risk",      title: "Approval factors",     score: 72, subtext: "Good financial ties + travel history = stronger application", color: "green" },
      ],
    };
  }
  if (q.includes("visa") && q.includes("canada")) {
    return {
      text: "For a **Canada Visitor Visa (TRV)**, here's what you'll need:",
      cards: [
        { type: "info",      title: "Temporary Resident Visa", value: "CAD $100 fee", subtext: "Single or multiple entry, typically 6 months" },
        { type: "checklist", title: "Required documents",       items: ["Valid passport", "IMM 5257 form", "Proof of funds (min. $2,000+)", "Family ties / employment letter", "No criminal record", "Previous travel history helps"] },
        { type: "tip",       title: "AI tip",                   value: "Biometrics required for most applicants — book early", color: "blue" },
      ],
    };
  }
  if (q.includes("visa") && (q.includes("schengen") || q.includes("europe"))) {
    return {
      text: "The **Schengen Visa** gives you access to 27 European countries. Here's the essentials:",
      cards: [
        { type: "info",      title: "Schengen Short-Stay Visa", value: "€80 fee",       subtext: "Up to 90 days in 180-day period" },
        { type: "checklist", title: "Documents required",        items: ["Schengen visa application form", "2 recent photos", "Valid travel insurance (min. €30,000)", "Proof of accommodation", "Return flight proof", "3 months bank statements"] },
        { type: "warning",   title: "Important note",            value: "Apply at the embassy of your main destination country.", color: "gold" },
      ],
    };
  }
  if (q.includes("dubai") || q.includes("uae")) {
    return {
      text: "Dubai (UAE) is visa-on-arrival or visa-free for many nationalities. For others, here's the process:",
      cards: [
        { type: "info",      title: "UAE Tourist Visa",         value: "From AED 350",  subtext: "30-day or 60-day options available" },
        { type: "checklist", title: "Requirements",             items: ["Valid passport (6+ months)", "Return ticket", "Hotel booking", "Passport-size photo", "Travel insurance recommended"] },
        { type: "tip",       title: "Easy tip",                  value: "Many nationalities get visa-on-arrival. Check your nationality first at icp.gov.ae", color: "blue" },
      ],
    };
  }
  if (q.includes("flight") || q.includes("cheapest") || q.includes("ticket")) {
    return {
      text: "Here are some popular routes with estimated fares. Prices fluctuate — always check live booking sites:",
      cards: [
        { type: "flight", title: "Dubai → Karachi",   value: "~$180–$280", subtext: "Fly Dubai, Air Arabia · 3h direct" },
        { type: "flight", title: "Karachi → New York", value: "~$800–$1,400", subtext: "PIA, Emirates (via Dubai) · 16h+" },
        { type: "flight", title: "Dubai → Manila",    value: "~$300–$450", subtext: "Cebu Pacific, Emirates · 9h direct" },
        { type: "tip",    title: "Cheapest tip",       value: "Book 6–8 weeks ahead. Tuesday/Wednesday departures are usually cheaper.", color: "gold" },
      ],
    };
  }
  if (q.includes("hotel") || q.includes("stay") || q.includes("accommodation")) {
    return {
      text: "Here are some top-rated stays for popular destinations. Prices are estimates:",
      cards: [
        { type: "info", title: "Dubai — Burj Vista",      value: "From $180/night", subtext: "Luxury serviced apartment, Burj Khalifa views" },
        { type: "info", title: "Istanbul — Bosphorus View", value: "From $95/night", subtext: "4-star hotel, city center, breakfast included" },
        { type: "info", title: "Bangkok — Riverside",     value: "From $65/night",  subtext: "Boutique hotel, Chao Phraya river access" },
        { type: "tip",  title: "AI tip",                   value: "Book directly with hotels for best rates. Avoid non-refundable options when possible.", color: "blue" },
      ],
    };
  }
  if (q.includes("plan") || q.includes("trip") || q.includes("itinerary")) {
    return {
      text: "Head to the **AI Trip Planner** for a full personalised itinerary. Here's a quick 5-day Dubai overview to get you started:",
      cards: [
        { type: "itinerary", title: "Day 1 — Arrival & Old Dubai",   items: ["Land at DXB, hotel check-in", "Al Fahidi Historic District tour", "Abra boat ride across Dubai Creek", "Spice & Gold Souk visit"] },
        { type: "itinerary", title: "Day 2 — Modern Dubai",           items: ["Burj Khalifa observation deck", "Dubai Mall & Dubai Fountain", "Downtown Dubai walk"] },
        { type: "itinerary", title: "Day 3–5",                        items: ["Desert safari (Day 3)", "Palm Jumeirah & beach (Day 4)", "Abu Dhabi day trip (Day 5)"] },
        { type: "tip",       title: "Budget tip",                      value: "5 days Dubai from ~$1,200 per person incl. flights from GCC. More from South Asia.", color: "gold" },
      ],
    };
  }
  if (q.includes("document") || q.includes("checklist") || q.includes("paperwork")) {
    return {
      text: "Use the **AI Document Checker** to get a personalised checklist. Here are the documents most often required across visa types:",
      cards: [
        { type: "checklist", title: "Universal document set", items: ["Valid passport (6+ months validity)", "Completed visa application form", "Recent passport photos", "Travel insurance", "Bank statements (3–6 months)", "Proof of accommodation", "Return flight booking"] },
        { type: "warning",   title: "Common mistakes",         items: ["Photos not matching spec", "Bank statement not translated", "Missing employer letter", "Insufficient funds shown"], color: "red" },
      ],
    };
  }

  return {
    text: "I can help with visas, flights, hotels, trip planning, tours, car rentals and document checklists. What would you like to explore?",
    cards: [
      { type: "tip", title: "Try asking...", items: ["Which visa do I need for the USA from Pakistan?", "Cheapest flights Dubai to London in July", "Plan 7 days in Turkey for $2,000", "Documents for a Schengen visa"], color: "blue" },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// VISA ASSISTANT
// ═════════════════════════════════════════════════════════════════════════════

export interface VisaInput {
  nationality: string;
  currentCountry: string;
  destination: string;
  purpose: string;
  previousVisaRefusals: boolean;
  travelHistory: string;
  employmentStatus: string;
  financialSituation: string;
}

export interface VisaResult {
  visaType: string;
  fee: string;
  processingTime: string;
  validity: string;
  approvalScore: number;
  approvalNote: string;
  requiredDocs: string[];
  optionalDocs: string[];
  commonMistakes: string[];
  risks: string[];
  tips: string[];
  disclaimer: string;
  nextSteps: string[];
}

export async function mockVisaAnalysis(input: VisaInput): Promise<VisaResult> {
  await mockDelay(1800, 3000);

  const dest = input.destination.toLowerCase();
  const purpose = input.purpose.toLowerCase();

  // USA
  if (dest.includes("usa") || dest.includes("united states") || dest.includes("america")) {
    const isStudent = purpose.includes("study");
    const hasRefusal = input.previousVisaRefusals;
    const score = hasRefusal ? 42 : isStudent ? 65 : 71;

    return {
      visaType: isStudent ? "F-1 Student Visa" : "B1/B2 Visitor Visa",
      fee: isStudent ? "$185 SEVIS + $185 MRV" : "$185 MRV fee",
      processingTime: "6–12 weeks (interview required)",
      validity: isStudent ? "Duration of Status (D/S)" : "10 years (60–90 day stays)",
      approvalScore: score,
      approvalNote: hasRefusal
        ? "Prior refusal detected — address refusal reason with strong documentation."
        : isStudent
        ? "Good if you have I-20 from accredited US school and financial proof."
        : "Approval depends heavily on strong home-country ties and finances.",
      requiredDocs: [
        "Valid passport (6+ months beyond intended stay)",
        "DS-160 Online Nonimmigrant Visa Application",
        "MRV fee receipt (bank receipt of $185)",
        "Photo (5×5 cm, white background, recent 6 months)",
        "Interview appointment confirmation",
        "Financial documents (bank statements 3–6 months)",
        isStudent ? "I-20 form from school" : "Proof of employment / business",
        "Evidence of strong home ties (property, family, job)",
      ],
      optionalDocs: [
        "Previous US visas (strengthens application)",
        "International travel stamps (10+ countries = stronger)",
        "Property ownership documents",
        "Sponsorship letter (if visiting US resident)",
        "Cover letter explaining trip purpose",
      ],
      commonMistakes: [
        "Inconsistent answers in DS-160 vs interview",
        "Inability to explain purpose clearly in interview",
        "Weak financial documentation",
        "No previous travel history outside home country",
        "Applying too close to travel date",
        hasRefusal ? "Not addressing previous refusal reason" : "Overly vague travel plans",
      ],
      risks: hasRefusal
        ? ["Prior refusal significantly increases scrutiny", "Must explain refusal convincingly in interview"]
        : ["Section 214(b) presumption — must prove intent to return", "Interview officer has full discretion"],
      tips: [
        "Apply 3–4 months before intended travel",
        "Be confident and concise in the interview",
        "Show bank statements showing regular salary + savings",
        "Bring all documents even if not explicitly required",
        "Do NOT book non-refundable flights before visa is issued",
      ],
      disclaimer: "Globe Travel Voyage is not a US immigration authority, embassy or licensed attorney. This analysis is informational only. No visa outcome is guaranteed. Consult a licensed immigration attorney for your specific case.",
      nextSteps: [
        "Connect with a verified visa expert on our marketplace",
        "Download your AI-generated document checklist",
        "Start DS-160 at ceac.state.gov",
        "Schedule interview at the US Embassy in your country",
      ],
    };
  }

  // UK
  if (dest.includes("uk") || dest.includes("united kingdom") || dest.includes("britain") || dest.includes("london")) {
    return {
      visaType: "UK Standard Visitor Visa",
      fee: "£115 (standard), £824 (priority)",
      processingTime: "3 weeks standard, 5 business days priority",
      validity: "Up to 10 years (6 months per visit)",
      approvalScore: input.previousVisaRefusals ? 48 : 68,
      approvalNote: "Strong financial standing and previous travel history significantly improve chances.",
      requiredDocs: [
        "Valid passport + all old passports",
        "Completed online application (UK Visas & Immigration)",
        "UK visa fee payment receipt",
        "Bank statements (last 6 months)",
        "Employer letter with salary and leave approval",
        "Proof of accommodation in the UK",
        "Return flight bookings",
        "Travel insurance (not mandatory but recommended)",
      ],
      optionalDocs: [
        "Property ownership / tenancy agreement",
        "Proof of previous UK or US/Schengen visas",
        "Invitation letter from UK resident",
        "Itinerary of planned activities",
      ],
      commonMistakes: [
        "Insufficient bank balance (aim for £2,500+ per person)",
        "Not uploading all previous passports",
        "Missing employer letter",
        "Incomplete application form (spelling errors)",
        "Photos not meeting UK specification",
      ],
      risks: [
        "Applications without previous travel history to Western countries face higher refusal rates",
        "Insufficient funds is the #1 reason for refusal",
      ],
      tips: [
        "Apply online via gov.uk/apply-uk-visa",
        "Include a personal cover letter explaining your trip",
        "Show 3–6 months of savings, not just current balance",
        "Previous US/Schengen visa = major approval boost",
      ],
      disclaimer: "Globe Travel Voyage is not the UK Home Office, UKVI, or a licensed solicitor. This is informational guidance only. No visa outcome is guaranteed.",
      nextSteps: [
        "Apply at gov.uk/apply-uk-visa",
        "Book a biometric appointment at a Visa Application Centre",
        "Connect with a UK visa expert on our marketplace",
        "Download your complete document checklist",
      ],
    };
  }

  // Canada
  if (dest.includes("canada")) {
    return {
      visaType: "Temporary Resident Visa (TRV)",
      fee: "CAD $100 application + CAD $85 biometrics",
      processingTime: "2–8 weeks (online application)",
      validity: "Up to 10 years or passport expiry",
      approvalScore: input.previousVisaRefusals ? 44 : 63,
      approvalNote: "Canada assesses intent to leave, financial stability and purpose carefully.",
      requiredDocs: [
        "Valid passport",
        "IMM 5257 Visitor Visa application form",
        "Digital photo (35×45 mm, recent 6 months)",
        "Proof of financial support (min. CAD $2,500+)",
        "Family ties / employment letter",
        "Invitation letter (if visiting Canadian resident)",
        "Travel history documentation",
      ],
      optionalDocs: [
        "Property deeds or mortgage documents",
        "Business registration (if self-employed)",
        "Children's birth certificates (if travelling with family)",
      ],
      commonMistakes: [
        "Incomplete IMM 5257 form",
        "Insufficient financial proof",
        "Not declaring previous visa refusals",
        "No clear itinerary provided",
      ],
      risks: [
        "IRCC assesses all applications with high scrutiny for new applicants",
        "Previous refusals must be declared and explained",
      ],
      tips: [
        "Apply online via ircc.canada.ca for faster processing",
        "Biometrics are required for most countries — book appointment early",
        "Include a detailed day-by-day Canada itinerary",
      ],
      disclaimer: "Globe Travel Voyage is not Immigration, Refugees and Citizenship Canada (IRCC) or a licensed immigration consultant. No visa outcome is guaranteed.",
      nextSteps: [
        "Create account at ircc.canada.ca",
        "Complete biometrics at a local VAC",
        "Connect with a Canada visa expert on our marketplace",
      ],
    };
  }

  // Schengen / Europe
  if (dest.includes("schengen") || dest.includes("europe") || dest.includes("germany") || dest.includes("france") || dest.includes("italy") || dest.includes("spain")) {
    return {
      visaType: "Schengen Short-Stay Visa (Type C)",
      fee: "€80 adults, €40 children 6–12 years",
      processingTime: "15 calendar days (up to 45 for complex)",
      validity: "Up to 90 days in any 180-day period",
      approvalScore: input.previousVisaRefusals ? 45 : 66,
      approvalNote: "Schengen visa is processed by the main destination country's embassy.",
      requiredDocs: [
        "Schengen visa application form (legibly filled)",
        "Valid passport (must be valid 3 months after departure)",
        "2 passport photos (35×45 mm, neutral background)",
        "Travel insurance (min. €30,000 coverage, covering all Schengen states)",
        "Proof of accommodation (hotel bookings, or host invitation)",
        "Return flight bookings (or proof of onward journey)",
        "Bank statements (3 months, min. €500–€700 recommended)",
        "Employment letter or business registration",
      ],
      optionalDocs: [
        "Proof of property ownership",
        "Previous Schengen visas (multi-entry history helps)",
        "Itinerary of planned activities",
        "Invitation letter from Schengen resident",
      ],
      commonMistakes: [
        "Applying at the wrong embassy (must apply to main destination)",
        "Travel insurance with insufficient coverage amount",
        "No proof of accommodation for entire stay",
        "Photos not meeting biometric standard",
        "Insufficient funds demonstrated",
      ],
      risks: [
        "First-time applicants without travel history face higher scrutiny",
        "Overstay risk assessment is a key factor in refusals",
      ],
      tips: [
        "Apply 15–30 days before travel (not too early, not too late)",
        "Include a detailed daily itinerary for all Schengen countries",
        "Travel insurance must explicitly state 'Schengen area'",
      ],
      disclaimer: "Globe Travel Voyage is not affiliated with any European embassy or EU authority. This is informational guidance only. No visa outcome is guaranteed.",
      nextSteps: [
        "Identify which Schengen country embassy to apply at",
        "Purchase travel insurance mentioning Schengen",
        "Connect with a Europe visa expert on our marketplace",
      ],
    };
  }

  // Default
  return {
    visaType: "Visitor / Tourist Visa",
    fee: "Varies by destination",
    processingTime: "1–8 weeks",
    validity: "Varies by destination",
    approvalScore: 60,
    approvalNote: "Provide a specific destination for a detailed analysis.",
    requiredDocs: [
      "Valid passport (6+ months validity)",
      "Completed visa application form",
      "Recent passport photos",
      "Financial proof (bank statements)",
      "Travel insurance",
      "Return flight booking",
      "Proof of accommodation",
    ],
    optionalDocs: [
      "Employment / business proof",
      "Previous travel history documentation",
      "Sponsorship letter",
    ],
    commonMistakes: [
      "Insufficient financial documentation",
      "Photos not meeting specification",
      "Missing required forms",
    ],
    risks: ["Every visa application is assessed individually"],
    tips: ["Apply well in advance", "Include a detailed cover letter"],
    disclaimer: "Globe Travel Voyage is not an immigration authority or attorney. This is informational guidance only. No visa outcome is guaranteed.",
    nextSteps: [
      "Connect with a verified visa expert",
      "Download your document checklist",
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TRIP PLANNER
// ═════════════════════════════════════════════════════════════════════════════

export interface TripInput {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travelers: number;
  travelStyle: string;
  accommodation: string;
  interests: string[];
  includeFlights: boolean;
  includeVisa: boolean;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  tip: string;
}

export interface TripResult {
  destination: string;
  totalDays: number;
  summary: string;
  budgetBreakdown: { label: string; amount: number; percent: number; emoji: string }[];
  itinerary: DayPlan[];
  hotels: { name: string; price: string; stars: number; area: string }[];
  tours: { name: string; price: string; duration: string }[];
  flightTip: string;
  visaNote: string;
  bestSeason: string;
  packingTips: string[];
  safetyTips: string[];
  hiddenGems: string[];
}

export async function mockTripPlan(input: TripInput): Promise<TripResult> {
  await mockDelay(2200, 3500);

  const dest = input.destination.toLowerCase();
  const budget = input.budget;
  const days = input.days;
  const isLuxury = input.travelStyle === "luxury";
  const isBudget = input.travelStyle === "budget";

  // Dubai
  if (dest.includes("dubai") || dest.includes("uae")) {
    const flightBudget = input.includeFlights ? Math.round(budget * 0.28) : 0;
    const hotelBudget  = Math.round(budget * (input.includeFlights ? 0.32 : 0.42));
    const actBudget    = Math.round(budget * 0.20);
    const foodBudget   = Math.round(budget * 0.15);
    const miscBudget   = budget - flightBudget - hotelBudget - actBudget - foodBudget;

    return {
      destination: "Dubai, UAE",
      totalDays: days,
      summary: `${days}-day ${input.travelStyle} Dubai experience for ${input.travelers} traveler${input.travelers > 1 ? "s" : ""}, budget $${budget.toLocaleString()} ${input.currency}.`,
      budgetBreakdown: [
        { label: "Flights",       amount: flightBudget, percent: Math.round((flightBudget / budget) * 100), emoji: "✈️" },
        { label: "Hotels",        amount: hotelBudget,  percent: Math.round((hotelBudget  / budget) * 100), emoji: "🏨" },
        { label: "Activities",    amount: actBudget,    percent: Math.round((actBudget    / budget) * 100), emoji: "🎡" },
        { label: "Food & Dining", amount: foodBudget,   percent: Math.round((foodBudget   / budget) * 100), emoji: "🍽️" },
        { label: "Shopping/Misc", amount: miscBudget,   percent: Math.round((miscBudget   / budget) * 100), emoji: "🛍️" },
      ].filter((b) => b.amount > 0),
      itinerary: Array.from({ length: Math.min(days, 7) }, (_, i) => {
        const plans: DayPlan[] = [
          { day: 1, title: "Arrival & Old Dubai",     activities: ["Dubai International Airport arrival", "Check-in & freshen up", "Al Fahidi Historic District walk", "Dubai Creek abra boat ride", "Spice Souk & Gold Souk exploration"],              meals: ["Lunch: Al Ustad Special Restaurant (Deira)", "Dinner: Arabian Tea House Café"],   tip: "Use the Dubai Metro red line from the airport — much cheaper than taxis." },
          { day: 2, title: "Modern Dubai Highlights", activities: ["Burj Khalifa (At The Top — book online)", "Dubai Mall exploration", "Dubai Fountain show (evening)", "Downtown Dubai walk"],                                                          meals: ["Lunch: Food court at Dubai Mall", "Dinner: Zuma Dubai"],                             tip: "Burj Khalifa tickets sell out — book online 2+ days ahead to save $10." },
          { day: 3, title: "Desert Safari Adventure", activities: ["Morning: Dubai Frame or Museum of the Future", "Afternoon: Desert safari pickup (~3pm)", "Dune bashing, sandboarding, camel ride", "Bedouin camp — dinner & entertainment"],         meals: ["Breakfast: Hotel", "Dinner: Desert camp BBQ included"],                              tip: "Desert safari companies vary widely in quality. Book a 4×4 with an AC vehicle." },
          { day: 4, title: "Palm & Beach Day",        activities: ["Palm Jumeirah monorail trip", "Atlantis Aquaventure (optional, from $80)", "JBR Beach or Kite Beach", "Dubai Marina evening walk & dinner"],                                         meals: ["Lunch: Reem Al Bawadi, JBR", "Dinner: Marina waterfront restaurant"],               tip: "JBR beach is free. The Atlantis water park is worth it for families." },
          { day: 5, title: "Culture & Shopping",      activities: ["Dubai Museum", "Global Village (seasonal)", "Mall of the Emirates (Ski Dubai optional)", "Souk Madinat Jumeirah"],                                                                   meals: ["Lunch: Shakespeare and Co.", "Dinner: Al Fanar Restaurant (traditional Emirati)"],  tip: "Haggling is expected at traditional souks — start at 50% of asking price." },
          { day: 6, title: "Abu Dhabi Day Trip",      activities: ["Sheikh Zayed Grand Mosque (free entry)", "Yas Island (Ferrari World or Warner Bros)", "Abu Dhabi Corniche walk", "Return to Dubai"],                                                  meals: ["Breakfast: Early hotel", "Lunch: Wok to Walk near mosque", "Dinner: Dubai hotel"], tip: "Grand Mosque requires modest dress — abayas available free at entrance." },
          { day: 7, title: "Departure Day",           activities: ["Last-minute shopping", "Check-out and airport transfer", "Duty-free at DXB"],                                                                                                        meals: ["Breakfast: Hotel", "Airport dining"],                                                tip: "Dubai airport is huge — arrive 3 hours before international flights." },
        ];
        return plans[i] ?? { day: i + 1, title: `Day ${i + 1}`, activities: ["Explore at your pace"], meals: ["Local restaurant"], tip: "Ask your hotel concierge for local recommendations." };
      }),
      hotels: isLuxury
        ? [
            { name: "Atlantis The Palm",         price: "$350–$600/night", stars: 5, area: "Palm Jumeirah"  },
            { name: "Burj Al Arab",              price: "$1,200+/night",  stars: 5, area: "Jumeirah"        },
            { name: "Address Downtown Dubai",    price: "$280–$450/night", stars: 5, area: "Downtown Dubai" },
          ]
        : isBudget
        ? [
            { name: "Ibis Dubai Al Barsha",      price: "$55–$80/night",  stars: 3, area: "Al Barsha"       },
            { name: "Premier Inn Dubai Airport", price: "$65–$95/night",  stars: 3, area: "Airport / Deira" },
            { name: "Rove Downtown",             price: "$70–$110/night", stars: 3, area: "Downtown Dubai"  },
          ]
        : [
            { name: "Marriott Downtown Dubai",   price: "$160–$240/night", stars: 4, area: "Downtown Dubai" },
            { name: "Radisson Blu Marina",       price: "$130–$200/night", stars: 4, area: "Dubai Marina"   },
            { name: "Hyatt Place Baniyas Sq",    price: "$95–$140/night",  stars: 4, area: "Deira"          },
          ],
      tours: [
        { name: "Desert Safari + BBQ Dinner",     price: "$60–$90/person",  duration: "6 hours"  },
        { name: "Dubai City Tour (half day)",      price: "$35–$50/person",  duration: "4 hours"  },
        { name: "Abu Dhabi & Mosque Tour",         price: "$55–$80/person",  duration: "8 hours"  },
        { name: "Dubai Creek & Heritage Tour",     price: "$40–$60/person",  duration: "3 hours"  },
        { name: "Dhow Cruise Dinner (Marina)",     price: "$70–$100/person", duration: "2.5 hours"},
      ],
      flightTip: "Fly into Dubai International (DXB) or Al Maktoum (DWC). Emirates, Fly Dubai and Air Arabia serve most routes. Book 6–8 weeks ahead for best fares.",
      visaNote: "UAE offers visa-on-arrival to many nationalities. GCC residents, EU, US, UK passport holders can usually enter visa-free. Verify at icp.gov.ae before booking.",
      bestSeason: "October–April (cooler weather, 24–32°C). Avoid June–August (38°C+ and humid).",
      packingTips: [
        "Light, breathable clothes (cotton/linen)",
        "Modest clothing for mosques and malls",
        "Sunscreen SPF 50+",
        "Comfortable walking shoes",
        "Power adapter (Type G — UK standard)",
      ],
      safetyTips: [
        "Dubai is extremely safe — very low crime rate",
        "Respect local customs (dress code in public areas)",
        "No alcohol in public or outside licensed venues",
        "Stay hydrated — heat dehydration is common for tourists",
      ],
      hiddenGems: [
        "Al Quoz — Dubai's art district with indie galleries",
        "Jumeirah Beach Park — locals' favourite beach (entry ~AED 5)",
        "Global Village — cultural pavilions from 90+ countries",
        "Alserkal Avenue — warehouse art scene",
      ],
    };
  }

  // Turkey / Istanbul
  if (dest.includes("turkey") || dest.includes("istanbul") || dest.includes("ankara")) {
    return {
      destination: "Istanbul, Turkey",
      totalDays: days,
      summary: `${days}-day ${input.travelStyle} Istanbul experience for ${input.travelers} traveler${input.travelers > 1 ? "s" : ""}, budget $${budget.toLocaleString()} ${input.currency}.`,
      budgetBreakdown: [
        { label: "Flights",       amount: Math.round(budget * 0.30), percent: 30, emoji: "✈️" },
        { label: "Hotels",        amount: Math.round(budget * 0.30), percent: 30, emoji: "🏨" },
        { label: "Activities",    amount: Math.round(budget * 0.18), percent: 18, emoji: "🎡" },
        { label: "Food & Dining", amount: Math.round(budget * 0.16), percent: 16, emoji: "🍽️" },
        { label: "Shopping/Misc", amount: Math.round(budget * 0.06), percent: 6,  emoji: "🛍️" },
      ],
      itinerary: [
        { day: 1, title: "Old City — Sultanahmet",  activities: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace", "Istanbul Archaeology Museum"],                  meals: ["Lunch: Hafız Mustafa café", "Dinner: Balikçi Sabahattin (fish)"],  tip: "Hagia Sophia is free. Topkapi Palace ~₺500 ($15)." },
        { day: 2, title: "Bosphorus & Markets",     activities: ["Spice Bazaar (Egyptian Bazaar)", "Bosphorus cruise (1.5h)", "Grand Bazaar", "Beyoğlu walk"],      meals: ["Breakfast: Simitçi (street simit)", "Dinner: Mikla rooftop"],       tip: "Haggling is part of the culture at the Grand Bazaar." },
        { day: 3, title: "Asian Side & Relaxation", activities: ["Ferry to Kadıköy (Asian side)", "Moda neighbourhood walk", "Princes' Islands day trip (ferry)"], meals: ["Lunch: Kadıköy fish sandwich", "Dinner: Karaköy Lokantası"],        tip: "The ferry is cheap (~₺50) and the best way to see the Bosphorus." },
      ].slice(0, Math.min(days, 7)),
      hotels: [
        { name: "Çırağan Palace Kempinski",  price: "$350–$700/night", stars: 5, area: "Beşiktaş"   },
        { name: "Four Seasons Sultanahmet",  price: "$400–$900/night", stars: 5, area: "Old City"   },
        { name: "CVK Park Bosphorus Hotel",  price: "$150–$280/night", stars: 5, area: "Bosphorus"  },
        { name: "The Marmara Istanbul",      price: "$110–$180/night", stars: 4, area: "Taksim Sq." },
      ],
      tours: [
        { name: "Istanbul Full-Day City Tour",     price: "$40–$65/person",  duration: "8 hours"  },
        { name: "Bosphorus Dinner Cruise",         price: "$60–$100/person", duration: "3 hours"  },
        { name: "Cappadocia Hot Air Balloon",      price: "$200–$280/person",duration: "1 hour"   },
        { name: "Turkish Bath (Hamam) Experience", price: "$30–$70/person",  duration: "1.5 hours"},
      ],
      flightTip: "Fly into Istanbul Airport (IST) — the main hub. Turkish Airlines has excellent connections from Middle East and Asia.",
      visaNote: "Most nationalities can obtain an e-Visa for Turkey from evisa.gov.tr. GCC residents may get visa-on-arrival. Cost ~$50–$60 USD.",
      bestSeason: "April–May (tulips, 15–22°C) or September–October (warm, fewer crowds).",
      packingTips: ["Layers for spring/autumn", "Modest clothes for mosques (women: headscarf)", "Comfortable walking shoes (cobblestones everywhere)"],
      safetyTips: ["Generally safe in tourist areas", "Be aware of pickpockets in Grand Bazaar", "Use licensed yellow taxis (or Bitaksi app)"],
      hiddenGems: ["Balat — colourful Jewish/Greek quarter", "Bebek — Bosphorus village with cafés", "Çengelköy on the Asian shore"],
    };
  }

  // Generic / default
  return {
    destination: input.destination || "Your Destination",
    totalDays: days,
    summary: `${days}-day trip for ${input.travelers} traveler${input.travelers > 1 ? "s" : ""} with a $${budget.toLocaleString()} budget.`,
    budgetBreakdown: [
      { label: "Flights",       amount: Math.round(budget * 0.30), percent: 30, emoji: "✈️" },
      { label: "Hotels",        amount: Math.round(budget * 0.32), percent: 32, emoji: "🏨" },
      { label: "Activities",    amount: Math.round(budget * 0.18), percent: 18, emoji: "🎡" },
      { label: "Food & Dining", amount: Math.round(budget * 0.14), percent: 14, emoji: "🍽️" },
      { label: "Miscellaneous", amount: Math.round(budget * 0.06), percent: 6,  emoji: "🛍️" },
    ],
    itinerary: Array.from({ length: Math.min(days, 5) }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      activities: ["Explore the local area", "Visit key attractions", "Try local cuisine"],
      meals: ["Local restaurant for lunch", "Hotel restaurant or local spot for dinner"],
      tip: "Ask your hotel for local recommendations — they know the best hidden spots.",
    })),
    hotels: [
      { name: "Local 4-Star Hotel",   price: `$${Math.round(budget * 0.032)}/night`, stars: 4, area: "City center" },
      { name: "Budget-Friendly Stay", price: `$${Math.round(budget * 0.016)}/night`, stars: 3, area: "Near transit" },
    ],
    tours: [
      { name: "City highlights tour",   price: "$30–$60/person",  duration: "4 hours" },
      { name: "Local food & culture",   price: "$25–$50/person",  duration: "3 hours" },
    ],
    flightTip: "Search flights 6–8 weeks ahead. Mid-week departures are generally cheaper.",
    visaNote: "Check visa requirements for your nationality at the destination embassy website.",
    bestSeason: "Research the best season for your specific destination.",
    packingTips: ["Check weather forecasts", "Pack light with versatile clothing", "Bring a universal power adapter"],
    safetyTips: ["Register with your home country's embassy", "Keep copies of all documents", "Ensure comprehensive travel insurance"],
    hiddenGems: ["Ask locals for their favourite spots", "Explore neighbourhoods beyond the tourist trail"],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// FLIGHT FINDER
// ═════════════════════════════════════════════════════════════════════════════

export interface FlightInput {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  flexibleDates: boolean;
  travelers: number;
  cabin: string;
  budget: number;
}

export interface FlightOption {
  airline: string;
  flightNumber: string;
  duration: string;
  stops: number;
  stopCity?: string;
  price: number;
  priceReturn?: number;
  badge?: string;
  departure: string;
  arrival: string;
  baggageIncluded: boolean;
}

export interface FlightResult {
  route: string;
  cheapestMonth: string;
  priceTrend: string;
  tip: string;
  options: FlightOption[];
  cheapestDay: string;
  flexDates?: { date: string; price: number }[];
}

export async function mockFlightSearch(input: FlightInput): Promise<FlightResult> {
  await mockDelay(1400, 2400);

  const from = input.from.toLowerCase();
  const to   = input.to.toLowerCase();

  // Dubai → Pakistan routes
  if ((from.includes("dubai") || from.includes("dxb")) && (to.includes("pakistan") || to.includes("karachi") || to.includes("lahore") || to.includes("islamabad"))) {
    const dest = to.includes("lahore") ? "Lahore (LHE)" : to.includes("islamabad") ? "Islamabad (ISB)" : "Karachi (KHI)";
    return {
      route: `Dubai (DXB) → ${dest}`,
      cheapestMonth: "March & September",
      priceTrend: "Prices are higher in June–August (summer holidays). Book 4–6 weeks ahead.",
      tip: "Fly Dubai and Air Arabia operate budget routes. Emirates is premium but often comparable if you need checked baggage.",
      cheapestDay: "Tuesday and Wednesday",
      options: [
        { airline: "Fly Dubai",  flightNumber: "FZ-307", duration: "2h 55m", stops: 0, price: 180, priceReturn: 340, departure: "07:30",  arrival: "11:25",  baggageIncluded: false, badge: "Cheapest" },
        { airline: "Air Arabia", flightNumber: "G9-512", duration: "3h 05m", stops: 0, price: 195, priceReturn: 370, departure: "13:45",  arrival: "17:50",  baggageIncluded: false },
        { airline: "Emirates",   flightNumber: "EK-602", duration: "3h 15m", stops: 0, price: 320, priceReturn: 580, departure: "22:15",  arrival: "02:30+1",baggageIncluded: true,  badge: "Premium" },
        { airline: "PIA",        flightNumber: "PK-212", duration: "3h 20m", stops: 0, price: 260, priceReturn: 490, departure: "09:00",  arrival: "13:20",  baggageIncluded: true },
      ],
      flexDates: [
        { date: "Mon",  price: 195 },
        { date: "Tue",  price: 175 },
        { date: "Wed",  price: 172 },
        { date: "Thu",  price: 188 },
        { date: "Fri",  price: 215 },
        { date: "Sat",  price: 230 },
        { date: "Sun",  price: 200 },
      ],
    };
  }

  // Pakistan → USA
  if ((from.includes("pakistan") || from.includes("karachi") || from.includes("lahore")) && (to.includes("usa") || to.includes("new york") || to.includes("jfk") || to.includes("america"))) {
    return {
      route: "Karachi (KHI) → New York (JFK)",
      cheapestMonth: "February & November",
      priceTrend: "Summer fares spike in June–August. Book 8–12 weeks ahead for best prices.",
      tip: "PIA flies direct KHI–JFK but availability is limited. Emirates via Dubai and Qatar via Doha are most reliable.",
      cheapestDay: "Tuesday and Wednesday",
      options: [
        { airline: "Qatar Airways", flightNumber: "QR-701+576", duration: "18h 35m", stops: 1, stopCity: "Doha (DOH)", price: 780,  priceReturn: 1400, departure: "02:25", arrival: "16:00",  baggageIncluded: true, badge: "Most popular" },
        { airline: "Emirates",      flightNumber: "EK-606+201", duration: "19h 10m", stops: 1, stopCity: "Dubai (DXB)", price: 820,  priceReturn: 1480, departure: "06:30", arrival: "18:40",  baggageIncluded: true },
        { airline: "PIA",           flightNumber: "PK-702",     duration: "16h 20m", stops: 0,                           price: 950,  priceReturn: 1700, departure: "21:00", arrival: "06:20+1",baggageIncluded: true, badge: "Only direct" },
        { airline: "Turkish Airlines",flightNumber:"TK-710+1+2", duration: "22h 05m", stops: 1, stopCity: "Istanbul (IST)", price: 720, priceReturn: 1300, departure: "04:15", arrival: "14:20",  baggageIncluded: true, badge: "Cheapest" },
      ],
      flexDates: [
        { date: "Mon",  price: 850 },
        { date: "Tue",  price: 780 },
        { date: "Wed",  price: 760 },
        { date: "Thu",  price: 800 },
        { date: "Fri",  price: 920 },
        { date: "Sat",  price: 960 },
        { date: "Sun",  price: 880 },
      ],
    };
  }

  // Generic
  const basePrice = Math.max(150, Math.min(input.budget * 0.4, 800));
  return {
    route: `${input.from || "Origin"} → ${input.to || "Destination"}`,
    cheapestMonth: "February, March and October",
    priceTrend: "Book 6–8 weeks in advance for the best prices.",
    tip: "Enable flexible dates to see if flying ±3 days saves money.",
    cheapestDay: "Tuesday and Wednesday",
    options: [
      { airline: "Estimated Option 1", flightNumber: "XX-001", duration: "Varies",       stops: 0, price: Math.round(basePrice),        priceReturn: Math.round(basePrice * 1.8),  departure: "Morning",   arrival: "Afternoon",  baggageIncluded: false, badge: "Best value" },
      { airline: "Estimated Option 2", flightNumber: "XX-002", duration: "Varies",       stops: 1, price: Math.round(basePrice * 0.85), priceReturn: Math.round(basePrice * 1.6),  departure: "Midday",    arrival: "Evening",    baggageIncluded: false, badge: "Cheapest"   },
      { airline: "Premium Option",     flightNumber: "XX-003", duration: "Varies",       stops: 0, price: Math.round(basePrice * 1.5),  priceReturn: Math.round(basePrice * 2.8),  departure: "Evening",   arrival: "Next day",   baggageIncluded: true,  badge: "Premium"    },
    ],
    flexDates: [
      { date: "Mon", price: Math.round(basePrice * 1.05) },
      { date: "Tue", price: Math.round(basePrice * 0.95) },
      { date: "Wed", price: Math.round(basePrice * 0.92) },
      { date: "Thu", price: Math.round(basePrice * 1.00) },
      { date: "Fri", price: Math.round(basePrice * 1.18) },
      { date: "Sat", price: Math.round(basePrice * 1.22) },
      { date: "Sun", price: Math.round(basePrice * 1.08) },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENT CHECKER
// ═════════════════════════════════════════════════════════════════════════════

export interface DocumentCheckInput {
  visaType: string;
  nationality: string;
  destination: string;
  checkedDocs: string[];
}

export interface DocumentCheckResult {
  overallScore: number;
  status: "strong" | "needs_work" | "incomplete";
  summary: string;
  missingCritical: string[];
  missingOptional: string[];
  warnings: string[];
  passedDocs: string[];
  improvements: string[];
  disclaimer: string;
}

const VISA_DOCUMENTS: Record<string, { critical: string[]; optional: string[] }> = {
  "usa-b1b2": {
    critical: ["Valid passport (6+ months)", "DS-160 confirmation page", "$185 MRV fee receipt", "CEAC interview appointment", "Passport photo (5×5 cm)", "Bank statements (3–6 months)", "Employment letter", "Proof of home ties"],
    optional:  ["Property documents", "Previous US visas", "International travel history", "Sponsor/invitation letter", "Cover letter"],
  },
  "usa-student": {
    critical: ["Valid passport", "I-20 from accredited school", "SEVIS I-901 payment receipt", "DS-160 form", "$185 MRV fee receipt", "CEAC appointment", "Financial proof (tuition + living)"],
    optional:  ["Admission letter", "Scholarship documents", "SAT/TOEFL scores", "Academic transcripts"],
  },
  "uk-visitor": {
    critical: ["Valid passport + old passports", "Online UK visa application", "Biometric enrolment", "Bank statements (6 months)", "Employment/payslip letter", "Accommodation proof", "Return flights"],
    optional:  ["Travel insurance", "Previous UK visas", "Cover letter", "Property documents"],
  },
  "canada-visitor": {
    critical: ["Valid passport", "IMM 5257 form", "Digital photo", "Financial proof (CAD $2,500+)", "Biometrics", "Employment letter"],
    optional:  ["Invitation letter", "Travel history", "Property documents", "Bank reference letter"],
  },
  "schengen": {
    critical: ["Valid passport (3 months post-departure)", "Application form", "2 biometric photos", "Travel insurance (€30,000 min)", "Accommodation proof", "Return flight booking", "Bank statements (3 months)"],
    optional:  ["Employer letter", "Previous Schengen visas", "Invitation letter", "Detailed itinerary"],
  },
  "uae-tourist": {
    critical: ["Valid passport (6+ months)", "Passport photo", "Return ticket", "Hotel booking"],
    optional:  ["Travel insurance", "Bank statement", "Employment letter"],
  },
};

export async function mockDocumentCheck(input: DocumentCheckInput): Promise<DocumentCheckResult> {
  await mockDelay(1200, 2000);

  const key = input.visaType.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const docSet = VISA_DOCUMENTS[key] ?? VISA_DOCUMENTS["schengen"];

  const checkedSet   = new Set(input.checkedDocs);
  const passedDocs   = docSet.critical.filter((d) => checkedSet.has(d));
  const missingCrit  = docSet.critical.filter((d) => !checkedSet.has(d));
  const missingOpt   = docSet.optional.filter((d) => !checkedSet.has(d));

  const critScore    = (passedDocs.length / docSet.critical.length) * 80;
  const optScore     = ((docSet.optional.length - missingOpt.length) / Math.max(docSet.optional.length, 1)) * 20;
  const overallScore = Math.min(100, Math.round(critScore + optScore));

  const status: DocumentCheckResult["status"] =
    overallScore >= 75 ? "strong" : overallScore >= 45 ? "needs_work" : "incomplete";

  const warnings: string[] = [];
  if (missingCrit.some((d) => d.includes("bank")))       warnings.push("⚠ Financial documentation is the #1 refusal reason. Ensure 3–6 months of statements.");
  if (missingCrit.some((d) => d.includes("passport")))   warnings.push("⚠ Passport must be valid for at least 6 months beyond your intended stay.");
  if (missingCrit.some((d) => d.includes("photo")))      warnings.push("⚠ Photos must meet exact biometric specifications. Check embassy guidelines.");
  if (missingCrit.some((d) => d.includes("insurance")))  warnings.push("⚠ Travel insurance is mandatory for Schengen — it must explicitly cover the Schengen area.");

  return {
    overallScore,
    status,
    summary:
      status === "strong"
        ? `Your document set looks strong (${overallScore}% score). You have ${passedDocs.length}/${docSet.critical.length} critical documents ready. Proceed with your application.`
        : status === "needs_work"
        ? `Your document set needs some work (${overallScore}% score). ${missingCrit.length} critical document${missingCrit.length !== 1 ? "s" : ""} missing. Address these before applying.`
        : `Your document set is incomplete (${overallScore}% score). ${missingCrit.length} critical documents are missing. Do not submit yet.`,
    missingCritical: missingCrit,
    missingOptional: missingOpt,
    warnings,
    passedDocs,
    improvements: [
      ...missingCrit.map((d) => `Obtain: ${d}`),
      ...warnings,
      missingOpt.length > 0 ? `Optional but helpful: ${missingOpt.slice(0, 3).join(", ")}` : "",
    ].filter(Boolean),
    disclaimer: "Globe Travel Voyage is not a government authority, embassy or immigration attorney. Document requirements vary by nationality, visa type and individual circumstances. Always verify requirements with the official embassy or consulate. No visa outcome is guaranteed.",
  };
}

export const VISA_TYPES = [
  { key: "usa-b1b2",     label: "USA B1/B2 Visitor Visa",        flag: "🇺🇸" },
  { key: "usa-student",  label: "USA F-1 Student Visa",           flag: "🇺🇸" },
  { key: "uk-visitor",   label: "UK Standard Visitor Visa",       flag: "🇬🇧" },
  { key: "canada-visitor",label: "Canada Visitor Visa (TRV)",     flag: "🇨🇦" },
  { key: "schengen",     label: "Schengen Short-Stay Visa",       flag: "🇪🇺" },
  { key: "uae-tourist",  label: "UAE Tourist Visa",               flag: "🇦🇪" },
];
