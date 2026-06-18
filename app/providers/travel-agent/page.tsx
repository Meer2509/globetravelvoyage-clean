import { ProviderLandingPage } from "@/components/provider-acquisition/ProviderLandingPage";
import { PROVIDER_LANDING_PAGES } from "@/lib/provider-acquisition/landing-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Travel Agent — Globe Travel Voyage",
  description: "Join as a verified travel agent. List visa services, flights, itineraries, and group tours.",
};

export default function TravelAgentProviderPage() {
  return <ProviderLandingPage config={PROVIDER_LANDING_PAGES["travel-agent"]} />;
}
