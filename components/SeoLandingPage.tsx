import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { TrustSection } from "@/components/TrustSection";
import { FAQ } from "@/components/FAQ";

export interface SeoPageConfig {
  title: string;
  subtitle: string;
  eyebrow: string;
  breadcrumbs: { label: string; href?: string }[];
  highlights: { label: string; value: string }[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  freeCta: { label: string; href: string };
  paidCta: { label: string; href: string };
}

export function SeoLandingPage({ config }: { config: SeoPageConfig }) {
  return (
    <>
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        subtitle={config.subtitle}
        breadcrumbs={config.breadcrumbs}
      />

      <section className="section">
        <div className="container-px">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {config.highlights.map((h) => (
              <div key={h.label} className="card p-5 text-center">
                <p className="text-xs text-muted uppercase tracking-wide">{h.label}</p>
                <p className="mt-1 text-lg font-bold text-navy">{h.value}</p>
              </div>
            ))}
          </div>

          <SectionHeader eyebrow="Your path" title="Step-by-step guidance" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {config.steps.map((s, i) => (
              <div key={s.title} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-navy">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={config.freeCta.href} className="btn-outline px-6 py-3 text-sm">
              {config.freeCta.label}
            </Link>
            <Link href={config.paidCta.href} className="btn-primary px-6 py-3 text-sm">
              {config.paidCta.label}
            </Link>
          </div>
        </div>
      </section>

      <TrustSection compact />

      <section className="section bg-soft/50">
        <div className="container-px max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Common questions" center />
          <FAQ items={config.faqs} />
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
