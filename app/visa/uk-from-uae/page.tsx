import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoVisaPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "UK Visa from UAE — Guide & Services",
  description: "UK visa guidance for UAE residents. Free checklist and paid preparation support.",
};

export default async function UkFromUaePage() {
  const config = await getSeoVisaPage("uk-from-uae");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
