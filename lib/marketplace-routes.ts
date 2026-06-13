const VISA_HUB_SLUG_MAP: Record<string, string> = {
  "usa-b1b2": "usa-b1-b2",
  "usa-f1": "usa-f1-student",
  canada: "canada-visitor",
  uk: "uk-standard-visitor",
  schengen: "schengen",
  uae: "uae-tourist",
  saudi: "saudi-tourist",
};

const DESTINATION_PAGES: Record<string, string> = {
  Dubai: "/travel/dubai",
  Istanbul: "/travel/turkey",
  Maldives: "/travel/maldives",
  "Saudi Arabia": "/travel/saudi",
};

export function visaHubHref(slug: string): string {
  const mapped = VISA_HUB_SLUG_MAP[slug];
  return mapped ? `/visa/${mapped}` : `/visa/countries`;
}

export function destinationHref(name: string): string {
  return DESTINATION_PAGES[name] ?? "/destinations";
}

export function guideHref(guide: {
  id: string;
  category: string;
  city?: string;
  country?: string;
}): string {
  if (guide.id === "g1") return "/travel/dubai";
  if (guide.id === "g2") return "/visa/usa-from-pakistan";
  if (guide.id === "g3") return "/flights";
  if (guide.category === "Visa Guide") return "/visa";
  if (guide.category === "Flights") return "/flights";
  if (guide.city === "Dubai") return "/travel/dubai";
  return "/guides";
}

export function bookingRequestPath(params?: {
  service?: string;
  subject?: string;
  from?: string;
  to?: string;
  destination?: string;
  details?: string;
}): string {
  if (!params) return "/booking/request";
  const sp = new URLSearchParams();
  if (params.service) sp.set("service", params.service);
  if (params.subject) sp.set("subject", params.subject);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.destination) sp.set("destination", params.destination);
  if (params.details) sp.set("details", params.details);
  const q = sp.toString();
  return q ? `/booking/request?${q}` : "/booking/request";
}

export function rentalsBrowseHref(rentalType?: string): string {
  if (!rentalType) return "/properties";
  const lower = rentalType.toLowerCase();
  if (lower.includes("car")) return "/car-rentals";
  return "/properties";
}
