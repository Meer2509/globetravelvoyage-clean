import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_TRAVEL_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Travel to the UAE — Dubai & Abu Dhabi",
  description: "UAE travel planning with free AI tools, verified providers, and optional concierge services.",
};

export default function UaeTravelPage() {
  return <SeoLandingPage config={SEO_TRAVEL_PAGES.uae} />;
}
