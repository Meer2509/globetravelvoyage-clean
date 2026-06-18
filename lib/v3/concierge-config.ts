export const CONCIERGE_PATH = "/concierge";

export type ConciergeTopic = "visa" | "trip" | "flights" | "documents" | "general";

export const CONCIERGE_TOPICS: Record<
  ConciergeTopic,
  { label: string; welcome: string; prompts: string[] }
> = {
  general: {
    label: "Travel Concierge",
    welcome:
      "I'm your AI Travel Concierge — visas, itineraries, flights, stays, documents and verified experts in one conversation. Where would you like to go?",
    prompts: [
      "Plan a 7-day luxury trip to Dubai for two",
      "Which visa do I need for the USA from Pakistan?",
      "Best time to visit Turkey with a $3,000 budget",
      "Documents needed for a UK visitor visa",
    ],
  },
  visa: {
    label: "Visa guidance",
    welcome:
      "Let's work through your visa requirements — nationality, destination, purpose and documents. I'll give you a checklist and timeline (informational only, not legal advice).",
    prompts: [
      "USA B1/B2 visa from Pakistan — what documents?",
      "Schengen visa processing time from UAE",
      "UK visitor visa refusal risk factors",
      "Canada study permit checklist",
    ],
  },
  trip: {
    label: "Trip planning",
    welcome:
      "Tell me your destination, dates, budget and travel style. I'll build a day-by-day itinerary with budget breakdown and practical tips.",
    prompts: [
      "Plan 5 days in Istanbul for $2,500",
      "Family trip to Bangkok — 10 days under $4,000",
      "Luxury honeymoon in Maldives — 7 nights",
      "Business trip to London — 4 days itinerary",
    ],
  },
  flights: {
    label: "Flights & routes",
    welcome:
      "I can help compare routes, timing and fare strategies. For live fares, I'll point you to our flight search — then we can refine your plan.",
    prompts: [
      "Cheapest routes Dubai to London in July",
      "Best airlines Gulf to Pakistan with baggage",
      "When to book flights to New York for December",
      "Multi-city: Dubai → Istanbul → Paris",
    ],
  },
  documents: {
    label: "Document readiness",
    welcome:
      "Share your visa type and nationality — I'll run through document readiness and common gaps before you apply.",
    prompts: [
      "Document checklist for US tourist visa",
      "Bank statement requirements for Schengen",
      "Employment letter format for UK visa",
      "Passport validity rules for international travel",
    ],
  },
};

export function parseConciergeTopic(value: string | null | undefined): ConciergeTopic {
  if (value === "visa" || value === "trip" || value === "flights" || value === "documents") {
    return value;
  }
  return "general";
}
