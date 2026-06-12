import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_TRAVEL_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Travel to Dubai — Plan Your Trip",
  description: "Plan Dubai travel with free AI tools and optional concierge services. Independent marketplace.",
};

export default function DubaiTravelPage() {
  return <SeoLandingPage config={SEO_TRAVEL_PAGES.dubai} />;
}
