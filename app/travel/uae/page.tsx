import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoTravelPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel to the UAE — Plan Your Trip",
  description: "Plan UAE travel with free AI tools and verified providers.",
};

export default async function UaeTravelPage() {
  const config = await getSeoTravelPage("uae");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
