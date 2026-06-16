import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoTravelPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel to Dubai — Plan Your Trip",
  description: "Plan Dubai travel with free AI tools and optional concierge services. Independent marketplace.",
};

export default async function DubaiTravelPage() {
  const config = await getSeoTravelPage("dubai");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
