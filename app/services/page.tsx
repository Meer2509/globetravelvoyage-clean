import type { Metadata } from "next";
import Link from "next/link";
import {
  ServicesCatalog,
  ServicesPageHeader,
  StripeTrustBanner,
} from "@/components/ServicesCatalog";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Services & Pricing — Globe Travel Voyage",
  description:
    "Free travel tools and provider accounts at launch. Optional premium upgrades for visa consultations, AI itineraries, and featured listings.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-soft/30">
      <ServicesPageHeader />

      {!isStripeConfigured && (
        <div className="border-b border-gold/20 bg-gold/5 px-5 py-3 text-center">
          <p className="text-sm text-muted">
            Premium checkout unavailable until Stripe is configured.{" "}
            <Link href="/admin/setup" className="font-semibold text-blue hover:underline">
              View setup guide →
            </Link>
          </p>
        </div>
      )}

      <div className="container-px max-w-5xl py-10">
        <ServicesCatalog />
        <StripeTrustBanner className="mt-10" />
      </div>
    </div>
  );
}
