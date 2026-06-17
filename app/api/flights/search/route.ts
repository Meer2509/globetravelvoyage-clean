import { NextResponse } from "next/server";
import { searchDuffelFlights } from "@/lib/flights/duffel";
import { defaultDepartureDate, parseIataCode, parsePassengerCount } from "@/lib/flights/airport";
import { FLIGHT_QUOTE_FALLBACK, type FlightCabinClass } from "@/lib/flights/types";
import {
  checkRateLimit,
  getClientIpFromRequest,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { getSessionUserId } from "@/lib/auth-server";

const CABIN_CLASSES = new Set<FlightCabinClass>([
  "economy",
  "premium_economy",
  "business",
  "first",
]);

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const ip = getClientIpFromRequest(request);
  const rateKey = userId ? `user:${userId}` : `ip:${ip}`;
  const limited = await checkRateLimit("form", rateKey);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, flights: [], message: FLIGHT_QUOTE_FALLBACK },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) }
    );
  }

  let body: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number | string;
    cabinClass?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, flights: [], message: FLIGHT_QUOTE_FALLBACK },
      { status: 400 }
    );
  }

  const origin = body.origin?.trim() ?? "";
  const destination = body.destination?.trim() ?? "";

  if (!origin || !destination) {
    return NextResponse.json(
      { ok: false, flights: [], message: FLIGHT_QUOTE_FALLBACK },
      { status: 400 }
    );
  }

  if (!parseIataCode(origin) || !parseIataCode(destination)) {
    return NextResponse.json(
      { ok: false, flights: [], message: FLIGHT_QUOTE_FALLBACK },
      { status: 400 }
    );
  }

  const cabinClass = CABIN_CLASSES.has(body.cabinClass as FlightCabinClass)
    ? (body.cabinClass as FlightCabinClass)
    : "economy";

  const result = await searchDuffelFlights({
    origin,
    destination,
    departureDate: body.departureDate?.trim() || defaultDepartureDate(),
    returnDate: body.returnDate?.trim(),
    passengers: parsePassengerCount(body.passengers),
    cabinClass,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
