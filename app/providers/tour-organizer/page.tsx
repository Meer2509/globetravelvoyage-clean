import { ProviderLandingPage } from "@/components/provider-acquisition/ProviderLandingPage";
import { PROVIDER_LANDING_PAGES } from "@/lib/provider-acquisition/landing-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Tour Organizer — Globe Travel Voyage",
  description: "Create group tour departures and receive join requests from travelers.",
};

export default function TourOrganizerProviderPage() {
  return <ProviderLandingPage config={PROVIDER_LANDING_PAGES["tour-organizer"]} />;
}
