import { ProviderLandingPage } from "@/components/provider-acquisition/ProviderLandingPage";
import { PROVIDER_LANDING_PAGES } from "@/lib/provider-acquisition/landing-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Visa Expert — Globe Travel Voyage",
  description: "Help travelers with visa applications. Get matched with qualified leads.",
};

export default function VisaExpertProviderPage() {
  return <ProviderLandingPage config={PROVIDER_LANDING_PAGES["visa-expert"]} />;
}
