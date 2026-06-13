export const CUSTOMER_TAB_KEYS = [
  "overview",
  "visa-cases",
  "documents",
  "payments",
  "bookings",
  "support",
  "settings",
] as const;

export type CustomerTabKey = (typeof CUSTOMER_TAB_KEYS)[number];

const TAB_ALIASES: Record<string, CustomerTabKey> = {
  overview: "overview",
  "visa-case": "visa-cases",
  "visa-cases": "visa-cases",
  documents: "documents",
  billing: "payments",
  payments: "payments",
  bookings: "bookings",
  support: "support",
  settings: "settings",
  profile: "settings",
  messages: "support",
  ai: "overview",
  timeline: "overview",
  visas: "overview",
  saved: "overview",
  referrals: "overview",
};

const HASH_ALIASES: Record<string, CustomerTabKey> = {
  documents: "documents",
  payments: "payments",
  billing: "payments",
  "visa-cases": "visa-cases",
  "visa-case": "visa-cases",
  support: "support",
  bookings: "bookings",
  settings: "settings",
  profile: "settings",
};

export function normalizeCustomerTab(tab: string | null | undefined): CustomerTabKey {
  if (!tab) return "overview";
  const key = TAB_ALIASES[tab.toLowerCase()];
  return key ?? "overview";
}

export function hashToCustomerTab(hash: string): CustomerTabKey | null {
  const cleaned = hash.replace(/^#/, "").trim().toLowerCase();
  if (!cleaned) return null;
  return HASH_ALIASES[cleaned] ?? null;
}

export function customerDashboardPath(tab?: CustomerTabKey | string): string {
  const normalized = tab ? normalizeCustomerTab(tab) : "overview";
  if (normalized === "overview") return "/dashboard/customer";
  return `/dashboard/customer?tab=${normalized}`;
}
