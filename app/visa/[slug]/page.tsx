import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { Icon } from "@/components/Icon";
import { visas } from "@/lib/data";

export function generateStaticParams() {
  return visas.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const visa = visas.find((v) => v.slug === slug);
  if (!visa) return { title: "Visa guide" };
  return {
    title: `${visa.country} ${visa.type} — Guide & Documents`,
    description: visa.summary,
  };
}

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const visa = visas.find((v) => v.slug === slug);
  if (!visa) notFound();

  const related = visas.filter((v) => v.slug !== visa.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={`${visa.flag} ${visa.country}`}
        title={visa.type}
        subtitle={visa.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Visa", href: "/visa" },
          { label: visa.type },
        ]}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Category", value: visa.category },
            { label: "Processing", value: visa.processing },
            { label: "Validity", value: visa.validity },
            { label: "Fee from", value: visa.feeFrom },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-3">
              <p className="text-xs text-white/55">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="section">
        <div className="container-px grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-navy">Document checklist</h2>
              <p className="mt-1 text-sm text-navy/55">
                Typical documents for this visa. Requirements vary by applicant and
                consulate — always confirm with the official authority.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {visa.documents.map((d) => (
                  <div
                    key={d}
                    className="flex items-start gap-3 rounded-xl border border-soft-200 bg-white p-4"
                  >
                    <Icon name="doc" className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
                    <span className="text-sm text-navy/75">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy">Step-by-step process</h2>
              <ol className="mt-5 space-y-4">
                {visa.steps.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                      {i + 1}
                    </span>
                    <p className="pt-1.5 text-sm text-navy/75">{s}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold text-navy">Good to know</h2>
              <div className="space-y-3">
                <div className="rounded-xl bg-soft/60 p-4">
                  <p className="text-sm font-semibold text-navy">
                    Maximum stay: {visa.stay}
                  </p>
                </div>
                <Disclaimer>
                  This {visa.type} guide is AI-assisted, informational content based
                  on sample data. Globe Travel Voyage is not an embassy, government
                  agency or immigration lawyer, and we do not guarantee visa
                  approval. Verify all requirements with the official authority.
                </Disclaimer>
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:h-fit">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-navy">Get expert help</h3>
              <p className="mt-2 text-sm text-navy/60">
                Connect with a verified visa agent to prepare and review your
                application.
              </p>
              <Link href="/agents" className="btn-primary mt-4 w-full py-2.5">
                Find a verified agent
              </Link>
              <Link href="/register" className="btn-outline mt-2 w-full py-2.5">
                Track this application
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-bold text-navy">Related guides</h3>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/visa/${r.slug}`}
                      className="flex items-center gap-2 text-sm text-navy/70 hover:text-blue"
                    >
                      <span>{r.flag}</span> {r.type}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CTASection />
    </>
  );
}
