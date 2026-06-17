import { bookingRequestPath } from "@/lib/marketplace-routes";
import { parseIataCode } from "@/lib/flights/airport";
import {
  FLIGHT_QUOTE_FALLBACK,
  type FlightCabinClass,
  type FlightOffer,
  type FlightSearchParams,
  type FlightSearchResponse,
} from "@/lib/flights/types";

const DUFFEL_API = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";
const MAX_OFFERS = 20;
const SUPPLIER_TIMEOUT_MS = 20_000;

interface DuffelSegment {
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  origin?: { iata_code?: string };
  destination?: { iata_code?: string };
  marketing_carrier?: { name?: string; iata_code?: string };
  operating_carrier?: { name?: string };
}

interface DuffelSlice {
  duration?: string;
  segments?: DuffelSegment[];
  origin?: { iata_code?: string };
  destination?: { iata_code?: string };
}

interface DuffelOffer {
  id: string;
  total_amount?: string;
  total_currency?: string;
  owner?: { name?: string };
  slices?: DuffelSlice[];
}

interface DuffelOfferRequestResponse {
  data?: {
    id?: string;
    offers?: DuffelOffer[];
  };
  errors?: Array<{ title?: string; message?: string }>;
}

function getDuffelToken(): string | null {
  return process.env.DUFFEL_ACCESS_TOKEN?.trim() || null;
}

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16) || "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDuration(iso: string | undefined): string {
  if (!iso) return "—";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] ? `${match[1]}h` : "";
  const mins = match[2] ? ` ${match[2]}m` : "";
  return `${hours}${mins}`.trim() || "—";
}

function mapCabinClass(cabin?: FlightCabinClass): string {
  switch (cabin) {
    case "premium_economy":
      return "premium_economy";
    case "business":
      return "business";
    case "first":
      return "first";
    default:
      return "economy";
  }
}

function buildBookingLink(offer: FlightOffer): string {
  return bookingRequestPath({
    service: "flight",
    subject: `${offer.airline} ${offer.origin} → ${offer.destination}`,
    from: offer.origin,
    to: offer.destination,
    details: `Duffel offer ${offer.id} · ${offer.price} ${offer.currency}`,
  });
}

function mapDuffelOffer(offer: DuffelOffer): FlightOffer | null {
  const slice = offer.slices?.[0];
  const segments = slice?.segments ?? [];
  if (segments.length === 0) return null;

  const first = segments[0];
  const last = segments[segments.length - 1];
  const airline =
    offer.owner?.name ||
    first.marketing_carrier?.name ||
    first.operating_carrier?.name ||
    "Airline";

  const origin = slice?.origin?.iata_code || first.origin?.iata_code || "—";
  const destination = slice?.destination?.iata_code || last.destination?.iata_code || "—";
  const price = parseFloat(offer.total_amount ?? "0");
  if (!Number.isFinite(price) || price <= 0) return null;

  const mapped: FlightOffer = {
    id: offer.id,
    airline,
    origin,
    destination,
    departureTime: formatTime(first.departing_at ?? ""),
    arrivalTime: formatTime(last.arriving_at ?? ""),
    duration: formatDuration(slice?.duration || first.duration),
    stops: Math.max(0, segments.length - 1),
    price,
    currency: offer.total_currency ?? "USD",
    bookingLink: "",
  };
  mapped.bookingLink = buildBookingLink(mapped);
  return mapped;
}

function failureResponse(message = FLIGHT_QUOTE_FALLBACK): FlightSearchResponse {
  return { ok: false, flights: [], message };
}

export async function searchDuffelFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  const token = getDuffelToken();
  const origin = parseIataCode(params.origin);
  const destination = parseIataCode(params.destination);

  console.log("[duffel] search request", {
    originInput: params.origin,
    destinationInput: params.destination,
    origin,
    destination,
    departureDate: params.departureDate,
    passengers: params.passengers,
  });

  if (!token) {
    console.warn("[duffel] DUFFEL_ACCESS_TOKEN is not configured");
    return failureResponse();
  }

  if (!origin || !destination) {
    console.warn("[duffel] invalid airport codes", { origin, destination });
    return failureResponse();
  }

  if (!params.departureDate || !/^\d{4}-\d{2}-\d{2}$/.test(params.departureDate)) {
    console.warn("[duffel] invalid departure date", params.departureDate);
    return failureResponse();
  }

  const passengers = Math.min(9, Math.max(1, params.passengers || 1));
  const slices: Array<{ origin: string; destination: string; departure_date: string }> = [
    { origin, destination, departure_date: params.departureDate },
  ];

  if (params.returnDate && /^\d{4}-\d{2}-\d{2}$/.test(params.returnDate)) {
    slices.push({
      origin: destination,
      destination: origin,
      departure_date: params.returnDate,
    });
  }

  const body = {
    data: {
      slices,
      passengers: Array.from({ length: passengers }, () => ({ type: "adult" as const })),
      cabin_class: mapCabinClass(params.cabinClass),
    },
  };

  const url = `${DUFFEL_API}/air/offer_requests?return_offers=true&supplier_timeout=${SUPPLIER_TIMEOUT_MS}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Duffel-Version": DUFFEL_VERSION,
      },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    let payload: DuffelOfferRequestResponse;
    try {
      payload = JSON.parse(rawText) as DuffelOfferRequestResponse;
    } catch {
      console.error("[duffel] non-JSON response", res.status, rawText.slice(0, 400));
      return failureResponse();
    }

    if (!res.ok) {
      console.error("[duffel] API error", {
        status: res.status,
        errors: payload.errors,
        body: rawText.slice(0, 500),
      });
      return failureResponse();
    }

    const offers = payload.data?.offers ?? [];
    console.log("[duffel] API success", {
      status: res.status,
      offerRequestId: payload.data?.id,
      offerCount: offers.length,
    });

    const flights = offers
      .map(mapDuffelOffer)
      .filter((o): o is FlightOffer => o !== null)
      .sort((a, b) => a.price - b.price)
      .slice(0, MAX_OFFERS);

    if (flights.length === 0) {
      console.warn("[duffel] no mappable offers returned");
      return failureResponse();
    }

    return { ok: true, flights, source: "duffel" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Duffel request failed";
    console.error("[duffel] request failed", message);
    return failureResponse();
  }
}
