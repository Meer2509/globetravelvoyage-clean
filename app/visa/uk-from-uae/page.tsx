import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_VISA_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "UK Visa from UAE — Guide & Services",
  description: "UK Standard Visitor visa guidance for UAE residents. Free tools and optional paid support.",
};

export default function UkFromUaePage() {
  return <SeoLandingPage config={SEO_VISA_PAGES["uk-from-uae"]} />;
}
