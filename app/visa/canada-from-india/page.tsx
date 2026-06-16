import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoVisaPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Canada Visa from India — Guide & Services",
  description: "Canada visa guidance for Indian applicants. Free checklist and paid preparation support. No approval guarantee.",
};

export default async function CanadaFromIndiaPage() {
  const config = await getSeoVisaPage("canada-from-india");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
