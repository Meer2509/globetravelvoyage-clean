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

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

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

export const VISA_TYPES = [
  { key: "usa-b1b2", label: "USA B1/B2 Visitor Visa", flag: "🇺🇸" },
  { key: "usa-student", label: "USA F-1 Student Visa", flag: "🇺🇸" },
  { key: "uk-visitor", label: "UK Standard Visitor Visa", flag: "🇬🇧" },
  { key: "canada-visitor", label: "Canada Visitor Visa (TRV)", flag: "🇨🇦" },
  { key: "schengen", label: "Schengen Short-Stay Visa", flag: "🇪🇺" },
  { key: "uae-tourist", label: "UAE Tourist Visa", flag: "🇦🇪" },
] as const;

export const VISA_DOCUMENT_SETS: Record<string, { critical: string[]; optional: string[] }> = {
  "usa-b1b2": {
    critical: [
      "Valid passport (6+ months)",
      "DS-160 confirmation page",
      "$185 MRV fee receipt",
      "CEAC interview appointment",
      "Passport photo (5×5 cm)",
      "Bank statements (3–6 months)",
      "Employment letter",
      "Proof of home ties",
    ],
    optional: [
      "Property documents",
      "Previous US visas",
      "International travel history",
      "Sponsor/invitation letter",
      "Cover letter",
    ],
  },
  "usa-student": {
    critical: [
      "Valid passport",
      "I-20 from accredited school",
      "SEVIS I-901 payment receipt",
      "DS-160 form",
      "$185 MRV fee receipt",
      "CEAC appointment",
      "Financial proof (tuition + living)",
    ],
    optional: ["Admission letter", "Scholarship documents", "SAT/TOEFL scores", "Academic transcripts"],
  },
  "uk-visitor": {
    critical: [
      "Valid passport + old passports",
      "Online UK visa application",
      "Biometric enrolment",
      "Bank statements (6 months)",
      "Employment/payslip letter",
      "Accommodation proof",
      "Return flights",
    ],
    optional: ["Travel insurance", "Previous UK visas", "Cover letter", "Property documents"],
  },
  "canada-visitor": {
    critical: [
      "Valid passport",
      "IMM 5257 form",
      "Digital photo",
      "Financial proof (CAD $2,500+)",
      "Biometrics",
      "Employment letter",
    ],
    optional: ["Invitation letter", "Travel history", "Property documents", "Bank reference letter"],
  },
  schengen: {
    critical: [
      "Valid passport (3 months post-departure)",
      "Application form",
      "2 biometric photos",
      "Travel insurance (€30,000 min)",
      "Accommodation proof",
      "Return flight booking",
      "Bank statements (3 months)",
    ],
    optional: ["Employer letter", "Previous Schengen visas", "Invitation letter", "Detailed itinerary"],
  },
  "uae-tourist": {
    critical: ["Valid passport (6+ months)", "Passport photo", "Return ticket", "Hotel booking"],
    optional: ["Travel insurance", "Bank statement", "Employment letter"],
  },
};

export const VISA_AI_DISCLAIMER =
  "Globe Travel Voyage is not a government agency, embassy, or immigration attorney. This analysis is informational only. No visa outcome is guaranteed. Always verify requirements with official sources.";

export const DOCUMENT_CHECK_DISCLAIMER =
  "Globe Travel Voyage is not a government authority, embassy, or immigration attorney. Document requirements vary by nationality, visa type, and individual circumstances. Always verify requirements with the official embassy or consulate. No visa outcome is guaranteed.";
