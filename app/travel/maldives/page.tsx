import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoTravelPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel to the Maldives — Plan Your Trip",
  description: "Plan Maldives travel with free AI tools and verified agencies.",
};

export default async function MaldivesTravelPage() {
  const config = await getSeoTravelPage("maldives");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
