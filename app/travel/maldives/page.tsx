import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { SEO_TRAVEL_PAGES } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Travel to the Maldives — Honeymoon & Luxury",
  description: "Maldives trip and honeymoon planning. Free tools and Honeymoon Planning from $499.",
};

export default function MaldivesTravelPage() {
  return <SeoLandingPage config={SEO_TRAVEL_PAGES.maldives} />;
}
