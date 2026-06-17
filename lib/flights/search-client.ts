import type { FlightSearchParams, FlightSearchResponse } from "@/lib/flights/types";
import { FLIGHT_QUOTE_FALLBACK } from "@/lib/flights/types";

export async function searchFlightsClient(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  try {
    const res = await fetch("/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = (await res.json()) as FlightSearchResponse;
    if (!data.ok || data.source !== "duffel") {
      return {
        ok: false,
        flights: [],
        message: data.ok === false ? (data.message ?? FLIGHT_QUOTE_FALLBACK) : FLIGHT_QUOTE_FALLBACK,
      };
    }
    return data;
  } catch {
    return { ok: false, flights: [], message: FLIGHT_QUOTE_FALLBACK };
  }
}
