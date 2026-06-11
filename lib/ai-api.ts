import { mockTripPlan, type TripInput } from "@/lib/ai-mock";

export async function callAiPrompt(prompt: string): Promise<{ text: string; source: "openai" | "mock" }> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      const data = (await res.json()) as { text: string; source?: string };
      return { text: data.text, source: "openai" };
    }
  } catch {
    // fall through to mock
  }
  return { text: "", source: "mock" };
}

export async function generateTripPlanWithAi(form: TripInput) {
  const prompt = `Create a ${form.days}-day ${form.travelStyle} trip plan for ${form.destination}.
Travelers: ${form.travelers}. Budget: ${form.currency} ${form.budget}.
Accommodation: ${form.accommodation}. Interests: ${form.interests.join(", ") || "general sightseeing"}.
Include: day-by-day itinerary, hotel suggestions, estimated daily budget breakdown, and visa tips if relevant.
${form.includeFlights ? "Include flight booking tips." : ""}
${form.includeVisa ? "Include visa preparation notes." : ""}`;

  const ai = await callAiPrompt(prompt);
  if (ai.source === "openai" && ai.text) {
    const mock = await mockTripPlan(form);
    return {
      ...mock,
      summary: ai.text,
      aiPowered: true,
    };
  }
  const mock = await mockTripPlan(form);
  return { ...mock, aiPowered: false };
}
