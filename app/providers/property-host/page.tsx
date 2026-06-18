import { ProviderLandingPage } from "@/components/provider-acquisition/ProviderLandingPage";
import { PROVIDER_LANDING_PAGES } from "@/lib/provider-acquisition/landing-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Property Host — Globe Travel Voyage",
  description: "List rentals, stays, and properties for international travelers.",
};

export default function PropertyHostProviderPage() {
  return <ProviderLandingPage config={PROVIDER_LANDING_PAGES["property-host"]} />;
}
