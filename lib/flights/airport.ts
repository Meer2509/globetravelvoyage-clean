/** Extract a 3-letter IATA code from inputs like "Dubai (DXB)", "DXB", or city names. */
const CITY_IATA: Record<string, string> = {
  dubai: "DXB",
  "abu dhabi": "AUH",
  sharjah: "SHJ",
  riyadh: "RUH",
  jeddah: "JED",
  dammam: "DMM",
  doha: "DOH",
  kuwait: "KWI",
  "kuwait city": "KWI",
  bahrain: "BAH",
  muscat: "MCT",
  lahore: "LHE",
  karachi: "KHI",
  islamabad: "ISB",
  peshawar: "PEW",
  delhi: "DEL",
  mumbai: "BOM",
  chennai: "MAA",
  hyderabad: "HYD",
  dhaka: "DAC",
  chittagong: "CGP",
  manila: "MNL",
  cebu: "CEB",
  "new york": "JFK",
  "washington dc": "IAD",
  london: "LHR",
  toronto: "YYZ",
  istanbul: "IST",
  "kuala lumpur": "KUL",
  singapore: "SIN",
  bangkok: "BKK",
  manchester: "MAN",
};

export function parseIataCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parenMatch = trimmed.match(/\(([A-Za-z]{3})\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  const beforeParen = trimmed.split("(")[0]?.trim().toLowerCase();
  if (beforeParen && CITY_IATA[beforeParen]) return CITY_IATA[beforeParen];

  const lower = trimmed.toLowerCase();
  if (CITY_IATA[lower]) return CITY_IATA[lower];

  return null;
}

export function parsePassengerCount(input: string | number | undefined): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    return Math.min(9, Math.max(1, Math.floor(input)));
  }
  if (!input) return 1;
  const match = String(input).match(/\d+/);
  return match ? Math.min(9, Math.max(1, parseInt(match[0], 10))) : 1;
}

export function defaultDepartureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}
