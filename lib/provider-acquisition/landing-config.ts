import type { ProviderLandingConfig } from "./types";

const SHARED_BENEFITS = [
  { icon: "✓", title: "Verified marketplace badge", description: "Stand out with admin-reviewed profiles and trust signals." },
  { icon: "💬", title: "Qualified leads", description: "Receive inquiries from travelers actively searching for your services." },
  { icon: "💳", title: "Stripe Connect payouts", description: "Get paid securely when bookings and services are fulfilled." },
  { icon: "📊", title: "Provider analytics", description: "Track profile views, inquiries, bookings, and reviews in your dashboard." },
];

export const PROVIDER_LANDING_PAGES: Record<string, ProviderLandingConfig> = {
  "travel-agent": {
    slug: "travel-agent",
    role: "visa_agent",
    registerParam: "agent",
    eyebrow: "Travel agents",
    title: "Become a Travel Agent on Globe Travel Voyage",
    subtitle: "List visa services, flights, custom itineraries, and group tours. Receive verified traveler inquiries and grow your agency globally.",
    emoji: "✈️",
    benefits: SHARED_BENEFITS,
    steps: [
      { title: "Create your account", description: "Sign up as a travel agent in under 2 minutes." },
      { title: "Complete onboarding", description: "Add your profile, services, and verification documents." },
      { title: "Get reviewed", description: "Our team verifies your credentials within 24–48 hours." },
      { title: "Go live", description: "Receive inquiries, manage group tours, and connect payouts." },
    ],
    requirements: ["Valid business or professional identity", "Service description and pricing", "Government ID or business registration (for verification)"],
    faq: [
      { q: "Can I list group tours?", a: "Yes. Verified travel agents can create group tour departures from the agent dashboard." },
      { q: "How do I get paid?", a: "Connect Stripe from your dashboard to receive payouts for confirmed services." },
      { q: "Is there a listing fee?", a: "Provider accounts are free during launch. Standard marketplace fees apply on completed transactions." },
    ],
  },
  "property-host": {
    slug: "property-host",
    role: "property_host",
    registerParam: "host",
    eyebrow: "Property hosts",
    title: "Become a Property Host",
    subtitle: "List rentals, stays, and properties for sale. Reach international travelers searching for verified accommodations.",
    emoji: "🏠",
    benefits: SHARED_BENEFITS,
    steps: [
      { title: "Create your account", description: "Register as a property host." },
      { title: "Add your listing", description: "Describe your property, amenities, and policies." },
      { title: "Pass verification", description: "Admin review ensures marketplace quality." },
      { title: "Receive inquiries", description: "Travelers contact you directly through the platform." },
    ],
    requirements: ["Property ownership or management authorization", "Accurate listing photos and description", "Clear cancellation and house rules"],
    faq: [
      { q: "What can I list?", a: "Short-term rentals, long-term stays, vacation homes, and select sale listings." },
      { q: "Do you handle bookings?", a: "Travelers submit inquiries; you coordinate directly or through our messaging system." },
    ],
  },
  "visa-expert": {
    slug: "visa-expert",
    role: "visa_agent",
    registerParam: "agent",
    eyebrow: "Visa experts",
    title: "Become a Visa Expert",
    subtitle: "Help travelers navigate complex visa applications. Get matched with clients seeking your country and visa-type expertise.",
    emoji: "👔",
    benefits: SHARED_BENEFITS,
    steps: [
      { title: "Create your expert account", description: "Register with your specializations and experience." },
      { title: "Build your profile", description: "Showcase languages, success rates, and service packages." },
      { title: "Submit for verification", description: "We review credentials before publishing your profile." },
      { title: "Receive visa leads", description: "Clients submit requests matched to your expertise." },
    ],
    requirements: ["Demonstrated visa consulting experience", "Clear service scope and pricing", "Compliance with local regulations"],
    faq: [
      { q: "Am I guaranteed clients?", a: "No. We connect you with inbound inquiries; outcomes depend on your profile and response time." },
      { q: "Can I also offer flights and tours?", a: "Yes — visa experts use the same travel agent profile for additional services." },
    ],
  },
  "tour-organizer": {
    slug: "tour-organizer",
    role: "visa_agent",
    registerParam: "agent",
    eyebrow: "Tour organizers",
    title: "Become a Tour Organizer",
    subtitle: "Create and manage group tour departures. Set itineraries, seat limits, and receive join requests from travelers worldwide.",
    emoji: "🗺️",
    benefits: SHARED_BENEFITS,
    steps: [
      { title: "Register as a travel agent", description: "Tour organizers use verified travel agent profiles." },
      { title: "Complete verification", description: "Submit your business details and tour credentials." },
      { title: "Create group tours", description: "Add departures, pricing, and seat limits from your dashboard." },
      { title: "Manage bookings", description: "Review join requests and confirm seats with travelers." },
    ],
    requirements: ["Tour operator or travel agency credentials", "Clear departure schedules and pricing", "Customer support contact"],
    faq: [
      { q: "What's the difference from a tour guide?", a: "Tour organizers manage multi-traveler group departures. Tour guides list local experiences — you can do both." },
      { q: "How are seats managed?", a: "Set seat limits per departure; join requests reserve spots pending your confirmation." },
    ],
  },
};

export const PROVIDER_LANDING_SLUGS = Object.keys(PROVIDER_LANDING_PAGES);
