export interface FlightBookingParams {
  service?: string;
  subject?: string;
  from?: string;
  to?: string;
  details?: string;
  airline?: string;
  price?: string;
  currency?: string;
  offerId?: string;
  depart?: string;
  arrive?: string;
  duration?: string;
  travelDate?: string;
  returnDate?: string;
  cabin?: string;
  passengers?: string;
  stops?: string;
}

export function parseFlightBookingParams(
  searchParams: URLSearchParams
): FlightBookingParams {
  return {
    service: searchParams.get("service") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    details: searchParams.get("details") ?? undefined,
    airline: searchParams.get("airline") ?? undefined,
    price: searchParams.get("price") ?? undefined,
    currency: searchParams.get("currency") ?? undefined,
    offerId: searchParams.get("offerId") ?? undefined,
    depart: searchParams.get("depart") ?? undefined,
    arrive: searchParams.get("arrive") ?? undefined,
    duration: searchParams.get("duration") ?? undefined,
    travelDate: searchParams.get("travelDate") ?? undefined,
    returnDate: searchParams.get("returnDate") ?? undefined,
    cabin: searchParams.get("cabin") ?? undefined,
    passengers: searchParams.get("passengers") ?? undefined,
    stops: searchParams.get("stops") ?? undefined,
  };
}

export function extractOfferId(details?: string, offerId?: string): string | undefined {
  if (offerId?.trim()) return offerId.trim();
  if (!details) return undefined;
  const match = details.match(/Duffel offer\s+([^\s·]+)/i);
  return match?.[1];
}

export function formatFlightPrice(price?: string, currency?: string): string | null {
  if (!price) return null;
  const amount = Number(price);
  if (!Number.isFinite(amount)) return price;
  const code = currency?.trim() || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}
