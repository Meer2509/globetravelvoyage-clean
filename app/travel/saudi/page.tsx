import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_TRAVEL_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Travel to Saudi Arabia — Visa & Planning",
  description: "Saudi Arabia travel and visa planning. Free checklist and verified agency marketplace.",
};

export default function SaudiTravelPage() {
  return <SeoLandingPage config={SEO_TRAVEL_PAGES.saudi} />;
}
