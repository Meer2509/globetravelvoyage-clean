import {
  DOCUMENT_CHECK_DISCLAIMER,
  VISA_AI_DISCLAIMER,
  VISA_DOCUMENT_SETS,
  type DocumentCheckInput,
  type DocumentCheckResult,
  type FlightInput,
  type FlightResult,
  type TripInput,
  type TripResult,
  type VisaInput,
  type VisaResult,
} from "@/lib/ai-types";

export const AI_UNAVAILABLE_MESSAGE =
  "AI assistance is temporarily unavailable because OpenAI is not configured on this server. Add OPENAI_API_KEY to enable live responses, or contact a verified expert on our marketplace.";

export class AiUnavailableError extends Error {
  constructor(message = AI_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

async function callAi(prompt: string, json = false): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, json }),
  });

  const data = (await res.json()) as { text?: string; error?: string; message?: string };

  if (res.status === 503) {
    throw new AiUnavailableError(data.message ?? AI_UNAVAILABLE_MESSAGE);
  }
  if (!res.ok) {
    throw new Error(data.error ?? "AI request failed.");
  }
  if (!data.text?.trim()) {
    throw new Error("Empty response from AI.");
  }
  return data.text;
}

function parseJsonBlock<T>(text: string): T | null {
  try {
    const trimmed = text.trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export function mapTravelStyleLabel(style: string): TripInput["travelStyle"] {
  const s = style.toLowerCase();
  if (s.includes("budget")) return "budget";
  if (s.includes("luxury")) return "luxury";
  return "moderate";
}

export async function getTravelAssistantReply(userMessage: string): Promise<{ text: string }> {
  const text = await callAi(
    `The traveler asks: "${userMessage}"

Provide concise, practical travel guidance (visas, flights, hotels, itineraries, or documents as relevant).
Use short paragraphs and bullet lists where helpful. Include a brief reminder that visa approval is never guaranteed.`
  );
  return { text };
}

export async function analyzeVisaWithAi(input: VisaInput): Promise<VisaResult> {
  const prompt = `Analyze this visa case and respond with JSON only (no markdown fences).

Traveler profile:
- Nationality: ${input.nationality}
- Country of residence: ${input.currentCountry}
- Destination: ${input.destination}
- Purpose: ${input.purpose}
- Previous visa refusals: ${input.previousVisaRefusals ? "yes" : "no"}
- Travel history: ${input.travelHistory}
- Employment: ${input.employmentStatus}
- Financial situation: ${input.financialSituation}

Return JSON matching this schema:
{
  "visaType": string,
  "fee": string,
  "processingTime": string,
  "validity": string,
  "approvalScore": number (0-100, informational readiness estimate only),
  "approvalNote": string,
  "requiredDocs": string[],
  "optionalDocs": string[],
  "commonMistakes": string[],
  "risks": string[],
  "tips": string[],
  "disclaimer": string,
  "nextSteps": string[]
}

Use disclaimer: "${VISA_AI_DISCLAIMER}"`;

  const raw = await callAi(prompt, true);
  const parsed = parseJsonBlock<Partial<VisaResult>>(raw);
  if (!parsed) throw new Error("Could not parse visa analysis from AI.");

  return {
    visaType: asString(parsed.visaType, "Visitor visa"),
    fee: asString(parsed.fee, "Varies by destination"),
    processingTime: asString(parsed.processingTime, "Varies"),
    validity: asString(parsed.validity, "Varies"),
    approvalScore: Math.min(100, Math.max(0, asNumber(parsed.approvalScore, 60))),
    approvalNote: asString(parsed.approvalNote, "Review official embassy guidance for your nationality."),
    requiredDocs: asStringArray(parsed.requiredDocs),
    optionalDocs: asStringArray(parsed.optionalDocs),
    commonMistakes: asStringArray(parsed.commonMistakes),
    risks: asStringArray(parsed.risks),
    tips: asStringArray(parsed.tips),
    disclaimer: asString(parsed.disclaimer, VISA_AI_DISCLAIMER),
    nextSteps: asStringArray(parsed.nextSteps),
  };
}

export async function generateTripPlanWithAi(form: TripInput): Promise<TripResult> {
  const prompt = `Create a ${form.days}-day ${form.travelStyle} trip plan for ${form.destination}.
Travelers: ${form.travelers}. Budget: ${form.currency} ${form.budget}. Accommodation: ${form.accommodation}.
Interests: ${form.interests.join(", ") || "general sightseeing"}.
${form.includeFlights ? "Include flight booking tips." : ""}
${form.includeVisa ? "Include visa preparation notes if relevant." : ""}

Respond with JSON only (no markdown fences) matching:
{
  "destination": string,
  "totalDays": number,
  "summary": string,
  "budgetBreakdown": [{ "label": string, "amount": number, "percent": number, "emoji": string }],
  "itinerary": [{ "day": number, "title": string, "activities": string[], "meals": string[], "tip": string }],
  "hotels": [{ "name": string, "price": string, "stars": number, "area": string }],
  "tours": [{ "name": string, "price": string, "duration": string }],
  "flightTip": string,
  "visaNote": string,
  "bestSeason": string,
  "packingTips": string[],
  "safetyTips": string[],
  "hiddenGems": string[]
}`;

  const raw = await callAi(prompt, true);
  const parsed = parseJsonBlock<Partial<TripResult>>(raw);
  if (!parsed) throw new Error("Could not parse trip plan from AI.");

  const budgetBreakdown = Array.isArray(parsed.budgetBreakdown)
    ? parsed.budgetBreakdown.map((b) => ({
        label: asString((b as { label?: string }).label, "Other"),
        amount: asNumber((b as { amount?: number }).amount),
        percent: asNumber((b as { percent?: number }).percent),
        emoji: asString((b as { emoji?: string }).emoji, "✈️"),
      }))
    : [];

  const itinerary = Array.isArray(parsed.itinerary)
    ? parsed.itinerary.map((d, i) => ({
        day: asNumber((d as { day?: number }).day, i + 1),
        title: asString((d as { title?: string }).title, `Day ${i + 1}`),
        activities: asStringArray((d as { activities?: unknown }).activities),
        meals: asStringArray((d as { meals?: unknown }).meals),
        tip: asString((d as { tip?: string }).tip),
      }))
    : [];

  return {
    destination: asString(parsed.destination, form.destination),
    totalDays: asNumber(parsed.totalDays, form.days),
    summary: asString(parsed.summary, `A ${form.days}-day plan for ${form.destination}.`),
    budgetBreakdown,
    itinerary,
    hotels: Array.isArray(parsed.hotels)
      ? parsed.hotels.map((h) => ({
          name: asString((h as { name?: string }).name, "Hotel option"),
          price: asString((h as { price?: string }).price, "Contact for price"),
          stars: asNumber((h as { stars?: number }).stars, 4),
          area: asString((h as { area?: string }).area, "City center"),
        }))
      : [],
    tours: Array.isArray(parsed.tours)
      ? parsed.tours.map((t) => ({
          name: asString((t as { name?: string }).name, "Local tour"),
          price: asString((t as { price?: string }).price, "Varies"),
          duration: asString((t as { duration?: string }).duration, "Half day"),
        }))
      : [],
    flightTip: asString(parsed.flightTip, "Compare fares 6–8 weeks before departure."),
    visaNote: asString(parsed.visaNote, "Check embassy requirements for your nationality."),
    bestSeason: asString(parsed.bestSeason, "Research seasonal weather for your destination."),
    packingTips: asStringArray(parsed.packingTips),
    safetyTips: asStringArray(parsed.safetyTips),
    hiddenGems: asStringArray(parsed.hiddenGems),
  };
}

export async function searchFlightsWithAi(form: FlightInput): Promise<FlightResult> {
  const prompt = `Suggest realistic flight options for:
- From: ${form.from}
- To: ${form.to}
- Depart: ${form.departDate || "flexible"}
- Return: ${form.returnDate || "one-way or flexible"}
- Flexible dates: ${form.flexibleDates ? "yes" : "no"}
- Travelers: ${form.travelers}
- Cabin: ${form.cabin}
- Max budget per person: USD ${form.budget}

Respond with JSON only (no markdown fences):
{
  "route": string,
  "cheapestMonth": string,
  "priceTrend": string,
  "tip": string,
  "cheapestDay": string,
  "options": [{
    "airline": string, "flightNumber": string, "duration": string, "stops": number,
    "stopCity": string, "price": number, "priceReturn": number, "badge": string,
    "departure": string, "arrival": string, "baggageIncluded": boolean
  }],
  "flexDates": [{ "date": string, "price": number }]
}

Prices are estimates for planning — note that live fares must be verified with airlines.`;

  const raw = await callAi(prompt, true);
  const parsed = parseJsonBlock<Partial<FlightResult>>(raw);
  if (!parsed) throw new Error("Could not parse flight results from AI.");

  return {
    route: asString(parsed.route, `${form.from} → ${form.to}`),
    cheapestMonth: asString(parsed.cheapestMonth, "Varies by season"),
    priceTrend: asString(parsed.priceTrend, "Fares fluctuate — book early when possible."),
    tip: asString(parsed.tip, "Compare airline sites and reputable agents before booking."),
    cheapestDay: asString(parsed.cheapestDay, "Tuesday or Wednesday often cheaper"),
    options: Array.isArray(parsed.options)
      ? parsed.options.map((o) => ({
          airline: asString((o as { airline?: string }).airline, "Airline"),
          flightNumber: asString((o as { flightNumber?: string }).flightNumber, "—"),
          duration: asString((o as { duration?: string }).duration, "Varies"),
          stops: asNumber((o as { stops?: number }).stops),
          stopCity: asString((o as { stopCity?: string }).stopCity) || undefined,
          price: asNumber((o as { price?: number }).price, form.budget),
          priceReturn: asNumber((o as { priceReturn?: number }).priceReturn) || undefined,
          badge: asString((o as { badge?: string }).badge) || undefined,
          departure: asString((o as { departure?: string }).departure, "—"),
          arrival: asString((o as { arrival?: string }).arrival, "—"),
          baggageIncluded: Boolean((o as { baggageIncluded?: boolean }).baggageIncluded),
        }))
      : [],
    flexDates: Array.isArray(parsed.flexDates)
      ? parsed.flexDates.map((d) => ({
          date: asString((d as { date?: string }).date, "—"),
          price: asNumber((d as { price?: number }).price),
        }))
      : undefined,
  };
}

export async function checkDocumentsWithAi(input: DocumentCheckInput): Promise<DocumentCheckResult> {
  const docSet = VISA_DOCUMENT_SETS[input.visaType] ?? VISA_DOCUMENT_SETS.schengen;
  const visaLabel = input.visaType.replace(/-/g, " ");

  const prompt = `Review this visa document checklist and respond with JSON only (no markdown fences).

Visa type: ${visaLabel}
Nationality: ${input.nationality || "not specified"}
Destination: ${input.destination || "not specified"}
Required critical documents: ${docSet.critical.join("; ")}
Optional documents: ${docSet.optional.join("; ")}
Documents the applicant marked as ready: ${input.checkedDocs.join("; ") || "none"}

Return JSON matching:
{
  "overallScore": number (0-100 readiness estimate),
  "status": "strong" | "needs_work" | "incomplete",
  "summary": string (2-3 sentences, personalized),
  "missingCritical": string[],
  "missingOptional": string[],
  "warnings": string[],
  "passedDocs": string[],
  "improvements": string[],
  "disclaimer": string
}

Use disclaimer: "${DOCUMENT_CHECK_DISCLAIMER}"`;

  const raw = await callAi(prompt, true);
  const parsed = parseJsonBlock<Partial<DocumentCheckResult>>(raw);
  if (!parsed) throw new Error("Could not parse document check from AI.");

  const status = parsed.status;
  const validStatus =
    status === "strong" || status === "needs_work" || status === "incomplete"
      ? status
      : "needs_work";

  return {
    overallScore: Math.min(100, Math.max(0, asNumber(parsed.overallScore, 0))),
    status: validStatus,
    summary: asString(parsed.summary, "Review your checklist against embassy requirements."),
    missingCritical: asStringArray(parsed.missingCritical),
    missingOptional: asStringArray(parsed.missingOptional),
    warnings: asStringArray(parsed.warnings),
    passedDocs: asStringArray(parsed.passedDocs),
    improvements: asStringArray(parsed.improvements),
    disclaimer: asString(parsed.disclaimer, DOCUMENT_CHECK_DISCLAIMER),
  };
}
