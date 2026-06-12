import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { ServicesCatalog, StripeTrustBanner } from "@/components/ServicesCatalog";
import { FEATURED_HOME_SERVICE_KEYS } from "@/lib/stripe/products";

export function HomeServicesSection() {
  return (
    <section className="section">
      <div className="container-px">
        <SectionHeader
          eyebrow="Paid services"
          title="Start with a real service"
          subtitle="Book visa consultations, AI travel plans, and travel requests — secure Stripe checkout with instant confirmation."
          linkHref="/services"
          linkLabel="View all services"
          center
        />
        <ServicesCatalog keys={FEATURED_HOME_SERVICE_KEYS} />
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/services" className="btn-primary px-8 py-3">
            Browse all paid services
          </Link>
          <Link href="/agents" className="btn-outline px-8 py-3">
            Find visa experts
          </Link>
        </div>
        <StripeTrustBanner className="mt-8" />
      </div>
    </section>
  );
}
