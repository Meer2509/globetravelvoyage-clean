import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_TRAVEL_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Travel to Turkey — Plan Your Journey",
  description: "Turkey travel planning with free AI tools and human trip planners from $99.",
};

export default function TurkeyTravelPage() {
  return <SeoLandingPage config={SEO_TRAVEL_PAGES.turkey} />;
}
