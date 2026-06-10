import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { VisaWizard } from "@/components/VisaWizard";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { Icon } from "@/components/Icon";
import { visas, visaCountries, agents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Visa Marketplace — AI Visa Assistant for Every Country",
  description:
    "AI visa guidance for every country. Find the right visa type, document checklist and step-by-step process, then connect with verified visa agents.",
};

export default function VisaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Visa marketplace"
        title="AI Visa Assistant for every country"
        subtitle="Understand the right visa type, required documents and the exact steps — then connect with verified visa agents who prepare your application. Guidance only; we never guarantee approval."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Visa" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/visa/usa" className="btn-gold px-5 py-2.5">
            USA visas
          </Link>
          <Link href="/visa/usa-from-pakistan" className="btn border border-white/20 px-5 py-2.5 text-white hover:bg-white/10">
            USA from Pakistan
          </Link>
          <Link href="/visa/countries" className="btn border border-white/20 px-5 py-2.5 text-white hover:bg-white/10">
            All countries
          </Link>
        </div>
      </PageHeader>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="AI visa wizard"
            title="Not sure which visa you need?"
            subtitle="Answer three quick questions and our AI will recommend a visa type, document checklist and step-by-step plan."
          />
          <VisaWizard />
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Popular visa guides"
            title="Featured visa guides"
            linkHref="/visa/countries"
            linkLabel="Browse all countries"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visas.map((v) => (
              <Link
                key={v.slug}
                href={`/visa/${v.slug}`}
                className="card card-hover flex flex-col p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{v.flag}</span>
                  <span className="chip">{v.category}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{v.type}</h3>
                <p className="text-sm text-navy/55">{v.country}</p>
                <p className="mt-2 flex-1 text-sm text-navy/60">{v.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-3 text-sm">
                  <span className="text-navy/55">From {v.feeFrom}</span>
                  <span className="font-semibold text-blue">View guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Verified visa agents"
            title="Get expert help with your application"
            subtitle="Identity-checked visa agents who prepare documents, review applications and guide you through interviews."
            linkHref="/agents"
            linkLabel="View all agents"
          />
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
                meta={`${a.cases.toLocaleString()} cases handled`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visaCountries.slice(0, 8).map((c) => (
              <Link
                key={c.name}
                href="/visa/countries"
                className="card card-hover flex items-center gap-3 p-4"
              >
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <p className="text-sm font-bold text-navy">{c.name}</p>
                  <p className="text-xs text-navy/50">{c.visaTypes} visa types</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Disclaimer />
          </div>
        </div>
      </section>

      <CTASection
        title="Need help choosing the right visa?"
        subtitle="Use the AI wizard or connect with a verified agent. Remember: no platform or agent can guarantee a visa approval."
        primary={{ label: "Find a visa agent", href: "/agents" }}
        secondary={{ label: "Ask the AI assistant", href: "/trip-planner" }}
      />
    </>
  );
}
