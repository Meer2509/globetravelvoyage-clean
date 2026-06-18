/** Premium empty-state copy when a marketplace has no approved listings yet. */
export { EMPTY_MARKETPLACE_LABEL } from "@/lib/launch-trust";

export interface FutureServiceItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  href: string;
}

export const FUTURE_SERVICES: FutureServiceItem[] = [
  {
    id: "hotels",
    title: "Hotels & Resorts",
    description: "Luxury hotels, boutique stays, and serviced apartments — verified quotes through our concierge.",
    emoji: "🏨",
    href: "/concierge?topic=hotels",
  },
  {
    id: "cruises",
    title: "Cruises & Yacht Charters",
    description: "Ocean cruises, river voyages, and private yacht charters with specialist booking support.",
    emoji: "🛳️",
    href: "/concierge?topic=cruise",
  },
  {
    id: "car-rentals",
    title: "Car Rentals",
    description: "Economy to luxury vehicles with transparent provider quotes.",
    emoji: "🚗",
    href: "/booking/request?service=car_rental",
  },
  {
    id: "tours",
    title: "Local Guided Tours",
    description: "Private and small-group experiences with verified local guides.",
    emoji: "🗺️",
    href: "/register?role=guide",
  },
  {
    id: "tickets",
    title: "Attraction Tickets",
    description: "Skip-the-line and event tickets sourced through verified partners.",
    emoji: "🎟️",
    href: "/concierge?topic=trip",
  },
  {
    id: "insurance",
    title: "Travel Insurance",
    description: "Single-trip and multi-trip coverage arranged through licensed partners.",
    emoji: "🛡️",
    href: "/lead/contact",
  },
];

/** Paths that redirect to the future-services hub. */
export const DEFERRED_SERVICE_PATHS = [
  "/hotels",
  "/cruises",
  "/car-rentals",
  "/tickets",
  "/tours",
] as const;
