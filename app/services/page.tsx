import type { Metadata } from "next";
import Link from "next/link";
import {
  ServicesCatalog,
  ServicesPageHeader,
  StripeTrustBanner,
} from "@/components/ServicesCatalog";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Paid Services — Globe Travel Voyage",
  description:
    "Book visa consultations, AI travel plans, provider listings, and travel requests with secure Stripe checkout.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-soft/30">
      <ServicesPageHeader />

      {!isStripeConfigured && (
        <div className="border-b border-gold/20 bg-gold/5 px-5 py-3 text-center">
          <p className="text-sm text-muted">
            Stripe keys are not configured yet.{" "}
            <Link href="/admin/setup" className="font-semibold text-blue hover:underline">
              View setup guide →
            </Link>
          </p>
        </div>
      )}

      <div className="container-px py-10 max-w-5xl">
        <StripeTrustBanner className="mb-10" />
        <ServicesCatalog />
        <StripeTrustBanner className="mt-10" />
      </div>
    </div>
  );
}
