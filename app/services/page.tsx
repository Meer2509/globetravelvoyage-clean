import type { Metadata } from "next";
import Link from "next/link";
import {
  ServicesCatalog,
  ServicesPageHeader,
  StripeTrustBanner,
} from "@/components/ServicesCatalog";
import { TrustSection } from "@/components/TrustSection";
export const metadata: Metadata = {
  title: "Services & Pricing — Globe Travel Voyage",
  description:
    "Free travel tools and provider accounts at launch. Optional premium upgrades for visa consultations, AI itineraries, and featured listings.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-soft/30">
      <ServicesPageHeader />


      <div className="container-px max-w-5xl py-10">
        <ServicesCatalog />
        <StripeTrustBanner className="mt-10" />
      </div>
      <TrustSection compact />
    </div>
  );
}
