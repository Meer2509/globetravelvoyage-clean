import { NextResponse } from "next/server";
import { searchDuffelFlights } from "@/lib/flights/duffel";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available in production." }, { status: 404 });
  }

  const result = await searchDuffelFlights({
    origin: "JFK",
    destination: "LHR",
    departureDate: "2026-10-15",
    returnDate: "2026-10-22",
    passengers: 1,
    cabinClass: "economy",
  });

  return NextResponse.json({
    ok: result.ok,
    source: result.ok ? result.source : undefined,
    count: result.ok ? result.flights.length : 0,
    firstOffer: result.ok && result.flights[0] ? {
      airline: result.flights[0].airline,
      origin: result.flights[0].origin,
      destination: result.flights[0].destination,
      price: result.flights[0].price,
      currency: result.flights[0].currency,
      travelDate: result.flights[0].travelDate,
    } : null,
    message: result.ok ? undefined : result.message,
  });
}
