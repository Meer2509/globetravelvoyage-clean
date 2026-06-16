import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoVisaPage } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Schengen Visa from Pakistan — Guide & Services",
  description: "Schengen visa guidance for Pakistani applicants.",
};

export default async function SchengenFromPakistanPage() {
  const config = await getSeoVisaPage("schengen-from-pakistan");
  if (!config) notFound();
  return <SeoLandingPage config={config} />;
}
