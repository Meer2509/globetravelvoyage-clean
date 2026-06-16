import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoTravelPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel to Saudi Arabia — Plan Your Trip",
  description: "Plan Saudi travel with free visa tools and verified agencies.",
};

export default async function SaudiTravelPage() {
  const config = await getSeoTravelPage("saudi");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
