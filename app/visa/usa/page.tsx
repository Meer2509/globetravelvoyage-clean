import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { Icon } from "@/components/Icon";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "USA Visa Guidance — B1/B2, F-1 Student & More",
  description:
    "Featured AI guidance for US visas: B1/B2 visitor, F-1 student and more. Document checklists, steps and interview prep. Not affiliated with the US government.",
};

const interviewTips = [
  "Be concise, honest and confident in your answers",
  "Clearly explain your purpose and ties to your home country",
  "Bring organized documents but answer from memory",
  "Show genuine intent to return after your trip or studies",
  "Dress professionally and arrive early",
];

export default async function UsaVisaPage() {
  const { visas } = await loadCatalogBundle();
  const usaVisas = visas.filter((v) => v.country === "United States");

  return (
    <>
      <PageHeader
        eyebrow="🇺🇸 Featured visa guidance"
        title="United States visa guidance"
        subtitle="AI-assisted guidance for the most common US visas. We are not affiliated with the US government, an embassy or an immigration lawyer, and we never guarantee approval."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Visa", href: "/visa" },
          { label: "USA" },
        ]}
      >
        <Link href="/visa/usa-from-pakistan" className="btn-gold px-5 py-2.5">
          Special: USA from Pakistan →
        </Link>
      </PageHeader>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa types"
            title="Choose your US visa type"
            subtitle="The right category depends on your purpose of travel."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {usaVisas.map((v) => (
              <div key={v.slug} className="card flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-navy">{v.type}</h3>
                  <span className="chip">{v.category}</span>
                </div>
                <p className="mt-2 text-sm text-navy/60">{v.summary}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-soft/60 p-3">
                    <p className="text-xs text-navy/45">Processing</p>
                    <p className="font-semibold text-navy">{v.processing}</p>
                  </div>
                  <div className="rounded-lg bg-soft/60 p-3">
                    <p className="text-xs text-navy/45">Validity</p>
                    <p className="font-semibold text-navy">{v.validity}</p>
                  </div>
                  <div className="rounded-lg bg-soft/60 p-3">
                    <p className="text-xs text-navy/45">Fee from</p>
                    <p className="font-semibold text-navy">{v.feeFrom}</p>
                  </div>
                </div>
                <Link
                  href={`/visa/${v.slug}`}
                  className="btn-primary mt-5 w-fit px-5 py-2.5"
                >
                  Full guide & checklist
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Interview prep" title="US visa interview tips" />
            <ul className="space-y-3">
              {interviewTips.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-navy/75">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy">DS-160 quick facts</h3>
            <div className="mt-4 space-y-3 text-sm text-navy/70">
              <p>• The DS-160 is the online non-immigrant visa application form.</p>
              <p>• You&apos;ll need it for B1/B2, F-1 and most visitor/student visas.</p>
              <p>• Keep your confirmation page — you need it for the interview.</p>
              <p>• Pay the consular fee and, for students, the SEVIS fee.</p>
            </div>
            <Link href="/agents" className="btn-outline mt-6 w-full py-2.5">
              Get help from a verified agent
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px">
          <Disclaimer />
        </div>
      </section>

      <CTASection
        title="Preparing for a US visa?"
        subtitle="Use our AI guidance and connect with verified agents. No one can guarantee a US visa approval — decisions rest solely with US authorities."
        primary={{ label: "Find a US visa agent", href: "/agents" }}
        secondary={{ label: "USA from Pakistan guide", href: "/visa/usa-from-pakistan" }}
      />
    </>
  );
}
