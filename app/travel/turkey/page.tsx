import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoTravelPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel to Turkey — Plan Your Trip",
  description: "Plan Turkey travel with free AI tools and verified providers.",
};

export default async function TurkeyTravelPage() {
  const config = await getSeoTravelPage("turkey");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
