"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { VisaWizard } from "@/components/VisaWizard";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ContactModal } from "@/components/ContactModal";
import { PageHeader } from "@/components/PageHeader";
import { VisaAgentsSection } from "@/components/VisaAgentsSection";
import { useCatalog } from "@/lib/catalog/context";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:     "bg-emerald-50 text-emerald-700 border-emerald-100",
  Moderate: "bg-gold/10 text-gold border-gold/20",
  Complex:  "bg-red-50 text-red-600 border-red-100",
};

export default function VisaPageClient() {
  const { visas, visaCountries } = useCatalog();
  const [visaLeadOpen, setVisaLeadOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<string>("");

  return (
    <>
      <PageHeader
        eyebrow="Visa marketplace"
        title="AI Visa Assistant for every country"
        subtitle="Understand the right visa type, required documents and the exact steps — then connect with verified visa agents who prepare your application. Guidance only; we never guarantee approval."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Visa" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/visa/usa" className="btn-gold px-5 py-2.5">USA visas</Link>
          <Link href="/visa/usa-from-pakistan" className="btn border border-white/20 px-5 py-2.5 text-white hover:bg-white/10">USA from Pakistan</Link>
          <Link href="/visa/countries" className="btn border border-white/20 px-5 py-2.5 text-white hover:bg-white/10">All countries</Link>
        </div>
      </PageHeader>

      {/* AI Wizard */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="AI visa wizard"
            title="Not sure which visa you need?"
            subtitle="Answer three quick questions and our AI will recommend a visa type, document checklist and step-by-step plan."
          />
          <VisaWizard />

          {/* Start application CTA after wizard */}
          <div className="mt-8 rounded-2xl border border-blue/20 bg-blue/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-bold text-navy">Ready to apply?</h3>
              <p className="text-sm text-charcoal/55 mt-0.5">
                Connect with a verified visa expert who will review your case and guide your application.
              </p>
            </div>
            <button
              onClick={() => setVisaLeadOpen(true)}
              className="btn-primary shrink-0 py-3 px-6"
            >
              Start my application →
            </button>
          </div>
        </div>
      </section>

      {/* Visa guides */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Popular visa guides"
            title="Featured visa guides"
            linkHref="/visa/countries"
            linkLabel="Browse all countries"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visas.map((v) => (
              <div key={v.slug} className="card card-hover flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{v.flag}</span>
                  <div className="flex gap-2">
                    <span className="chip">{v.category}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${DIFFICULTY_COLOR[v.difficulty]}`}>
                      {v.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-navy">{v.type}</h3>
                <p className="text-sm text-navy/55">{v.country}</p>
                <p className="mt-2 flex-1 text-sm text-navy/60">{v.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-charcoal/55 border-t border-soft-200 pt-3">
                  <div><span className="block text-navy/35">Processing</span>{v.processing}</div>
                  <div><span className="block text-navy/35">Fee from</span>{v.feeFrom}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/visa/${v.slug}`} className="btn-outline flex-1 py-2 text-center text-sm">
                    View guide
                  </Link>
                  <button
                    onClick={() => { setSelectedVisa(v.type); setVisaLeadOpen(true); }}
                    className="btn-primary flex-1 py-2 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified agents */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Verified visa agents"
            title="Get expert help with your application"
            subtitle="Identity-checked visa agents who prepare documents, review applications and guide you through interviews."
            linkHref="/agents"
            linkLabel="View all agents"
          />
          <VisaAgentsSection />
        </div>
      </section>

      {/* Countries grid */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visaCountries.slice(0, 8).map((c) => (
              <Link key={c.name} href="/visa/countries" className="card card-hover flex items-center gap-3 p-4">
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
        secondary={{ label: "Ask the AI assistant", href: "/ai-visa-assistant" }}
      />

      {/* Modals */}
      <ContactModal
        open={visaLeadOpen}
        onClose={() => { setVisaLeadOpen(false); setSelectedVisa(""); }}
        mode="visa_lead"
        subjectName={selectedVisa ? `Apply: ${selectedVisa}` : undefined}
      />
    </>
  );
}
