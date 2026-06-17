export interface AirportRecord {
  iata: string;
  airportName: string;
  city: string;
  country: string;
}

export const AIRPORTS: AirportRecord[] = [
  { iata: "JFK", airportName: "John F. Kennedy International", city: "New York", country: "United States" },
  { iata: "EWR", airportName: "Newark Liberty International", city: "New York", country: "United States" },
  { iata: "LGA", airportName: "LaGuardia", city: "New York", country: "United States" },
  { iata: "LHR", airportName: "Heathrow", city: "London", country: "United Kingdom" },
  { iata: "DXB", airportName: "Dubai International", city: "Dubai", country: "United Arab Emirates" },
  { iata: "AUH", airportName: "Zayed International", city: "Abu Dhabi", country: "United Arab Emirates" },
  { iata: "DOH", airportName: "Hamad International", city: "Doha", country: "Qatar" },
  { iata: "IST", airportName: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { iata: "LHE", airportName: "Allama Iqbal International", city: "Lahore", country: "Pakistan" },
  { iata: "ISB", airportName: "Islamabad International", city: "Islamabad", country: "Pakistan" },
  { iata: "KHI", airportName: "Jinnah International", city: "Karachi", country: "Pakistan" },
  { iata: "DEL", airportName: "Indira Gandhi International", city: "Delhi", country: "India" },
  { iata: "BOM", airportName: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India" },
  { iata: "MNL", airportName: "Ninoy Aquino International", city: "Manila", country: "Philippines" },
  { iata: "DAC", airportName: "Hazrat Shahjalal International", city: "Dhaka", country: "Bangladesh" },
  { iata: "JED", airportName: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia" },
  { iata: "RUH", airportName: "King Khalid International", city: "Riyadh", country: "Saudi Arabia" },
  { iata: "CDG", airportName: "Charles de Gaulle", city: "Paris", country: "France" },
  { iata: "YYZ", airportName: "Pearson International", city: "Toronto", country: "Canada" },
  { iata: "ORD", airportName: "O'Hare International", city: "Chicago", country: "United States" },
  { iata: "LAX", airportName: "Los Angeles International", city: "Los Angeles", country: "United States" },
  { iata: "SIN", airportName: "Changi", city: "Singapore", country: "Singapore" },
  { iata: "BKK", airportName: "Suvarnabhumi", city: "Bangkok", country: "Thailand" },
  { iata: "KUL", airportName: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { iata: "MAN", airportName: "Manchester", city: "Manchester", country: "United Kingdom" },
  { iata: "IAD", airportName: "Dulles International", city: "Washington DC", country: "United States" },
  { iata: "SHJ", airportName: "Sharjah International", city: "Sharjah", country: "United Arab Emirates" },
  { iata: "DMM", airportName: "King Fahd International", city: "Dammam", country: "Saudi Arabia" },
  { iata: "MCT", airportName: "Muscat International", city: "Muscat", country: "Oman" },
  { iata: "BAH", airportName: "Bahrain International", city: "Bahrain", country: "Bahrain" },
  { iata: "KWI", airportName: "Kuwait International", city: "Kuwait City", country: "Kuwait" },
  { iata: "HYD", airportName: "Rajiv Gandhi International", city: "Hyderabad", country: "India" },
  { iata: "MAA", airportName: "Chennai International", city: "Chennai", country: "India" },
  { iata: "CGP", airportName: "Shah Amanat International", city: "Chittagong", country: "Bangladesh" },
  { iata: "CEB", airportName: "Mactan–Cebu International", city: "Cebu", country: "Philippines" },
  { iata: "PEW", airportName: "Bacha Khan International", city: "Peshawar", country: "Pakistan" },
  { iata: "FRA", airportName: "Frankfurt", city: "Frankfurt", country: "Germany" },
  { iata: "AMS", airportName: "Schiphol", city: "Amsterdam", country: "Netherlands" },
  { iata: "SYD", airportName: "Kingsford Smith", city: "Sydney", country: "Australia" },
];

export interface PopularFlightSearch {
  label: string;
  originIata: string;
  destinationIata: string;
}

export const POPULAR_FLIGHT_SEARCHES: PopularFlightSearch[] = [
  { label: "Dubai → Karachi", originIata: "DXB", destinationIata: "KHI" },
  { label: "Dubai → Lahore", originIata: "DXB", destinationIata: "LHE" },
  { label: "Doha → Islamabad", originIata: "DOH", destinationIata: "ISB" },
  { label: "London → Delhi", originIata: "LHR", destinationIata: "DEL" },
  { label: "New York → Karachi", originIata: "JFK", destinationIata: "KHI" },
  { label: "Riyadh → Manila", originIata: "RUH", destinationIata: "MNL" },
  { label: "Istanbul → Dhaka", originIata: "IST", destinationIata: "DAC" },
  { label: "Toronto → Lahore", originIata: "YYZ", destinationIata: "LHE" },
];

export function getAirportByIata(iata: string): AirportRecord | undefined {
  const code = iata.trim().toUpperCase();
  return AIRPORTS.find((a) => a.iata === code);
}

export function formatAirportShort(airport: AirportRecord): string {
  return `${airport.city} (${airport.iata})`;
}

export function formatAirportLong(airport: AirportRecord): string {
  return `${airport.city} (${airport.iata}) — ${airport.airportName}`;
}

function scoreAirport(airport: AirportRecord, query: string): number {
  const q = query.toLowerCase();
  const iata = airport.iata.toLowerCase();
  const city = airport.city.toLowerCase();
  const country = airport.country.toLowerCase();
  const name = airport.airportName.toLowerCase();

  if (iata === q) return 100;
  if (iata.startsWith(q)) return 90;
  if (city === q) return 85;
  if (city.startsWith(q)) return 80;
  if (name.includes(q)) return 70;
  if (country.startsWith(q)) return 60;
  if (`${city} ${country}`.includes(q)) return 55;
  if (`${name} ${city} ${country} ${iata}`.includes(q)) return 50;
  return 0;
}

export function searchAirports(query: string, limit = 8): AirportRecord[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return AIRPORTS.map((airport) => ({ airport, score: scoreAirport(airport, trimmed) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map((item) => item.airport);
}
