import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_VISA_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Canada Visa from India — Guide & Services",
  description: "Canada visa guidance for Indian applicants. Free checklist and paid preparation support. No approval guarantee.",
};

export default function CanadaFromIndiaPage() {
  return <SeoLandingPage config={SEO_VISA_PAGES["canada-from-india"]} />;
}
