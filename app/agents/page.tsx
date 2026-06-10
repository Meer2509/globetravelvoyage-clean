import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { TrustBadge } from "@/components/TrustBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { agents, trustItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Verified Visa Agents & Travel Experts",
  description:
    "Connect with identity-verified visa agents and travel experts. Transparent reviews. We don't guarantee outcomes — always do your own due diligence.",
};

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Verified experts"
        title="Verified visa agents & travel experts"
        subtitle="Identity-checked agents who prepare documents, review applications and guide you through interviews. Transparent reviews, no pay-to-rank."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Agents" }]}
      />

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Top agents" title="Browse verified visa agents" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((a) => (
              <MarketplaceCard
                key={a.id}
                initials={a.initials}
                name={a.name}
                subtitle={a.title}
                rating={a.rating}
                reviews={a.reviews}
                verified={a.verified}
                tags={a.specialties}
                meta={`${a.cases.toLocaleString()} cases · ${a.countries.join(", ")}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader eyebrow="Why verified" title="How verification protects you" center />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((t) => (
              <TrustBadge key={t.title} icon={t.icon} title={t.title} text={t.text} />
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <Disclaimer>
              Verification confirms identity and business details — it is not an
              endorsement or a guarantee of results. Agents are independent service
              providers. We do not guarantee visa approval. Always agree terms in
              writing and do your own due diligence before paying anyone.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="Are you a visa agent?"
        subtitle="Create a verified profile, receive leads, manage client applications and grow your reviews."
        primary={{ label: "Become an agent", href: "/register" }}
        secondary={{ label: "Open agent dashboard", href: "/dashboard/agent" }}
      />
    </>
  );
}
