export type FlightCabinClass = "economy" | "premium_economy" | "business" | "first";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: number;
  returnDate?: string;
  cabinClass?: FlightCabinClass;
}

export interface FlightOffer {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  bookingLink: string;
}

export interface FlightSearchSuccess {
  ok: true;
  flights: FlightOffer[];
  source: "duffel";
}

export interface FlightSearchFailure {
  ok: false;
  flights: [];
  message: string;
}

export type FlightSearchResponse = FlightSearchSuccess | FlightSearchFailure;

export const FLIGHT_QUOTE_FALLBACK = "Flight quote available upon request.";
