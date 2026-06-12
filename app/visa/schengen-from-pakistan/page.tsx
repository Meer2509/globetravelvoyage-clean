import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_VISA_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Schengen Visa from Pakistan — Guide & Services",
  description: "Schengen short-stay visa guidance for Pakistani applicants. Free checklist and paid case tracking.",
};

export default function SchengenFromPakistanPage() {
  return <SeoLandingPage config={SEO_VISA_PAGES["schengen-from-pakistan"]} />;
}
