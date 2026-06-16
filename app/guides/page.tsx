import type { Metadata } from "next";
import Link from "next/link";
import { guideHref } from "@/lib/marketplace-routes";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";

export const metadata: Metadata = {
  title: "Travel Guides — Expert Destination & Visa Guides",
  description:
    "Expert travel guides for destinations, visa processes, flight routes and budget planning. AI-assisted content covering 190+ countries.",
};

const categories = ["All", "City Guide", "Visa Guide", "Flights", "Religious Travel", "Budget Travel", "Beach"];

export default async function GuidesPage() {
  const { travelGuides, visas } = await loadCatalogBundle();
  const featured = travelGuides.filter((g) => g.featured);
  const all = travelGuides;

  return (
    <>
      <PageHeader
        eyebrow="Knowledge center"
        title="Expert travel guides"
        subtitle="Deep-dive guides on destinations, visa requirements and travel routes — AI-assisted and verified by experienced travelers and agents."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Travel Guides" }]}
      />

      {/* Featured guides */}
      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="Featured" title="Editor picks" />
          <div className="grid gap-5 lg:grid-cols-3">
            {featured.map((g) => (
              <div key={g.id} className="card card-hover flex flex-col overflow-hidden">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-navy/8 to-blue/8 text-7xl">
                  {g.emoji}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip text-xs">{g.category}</span>
                    <span className="text-xs text-charcoal/45">📖 {g.readTime}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-navy leading-snug">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-charcoal/65">{g.excerpt}</p>
                  <Link href={guideHref(g)} className="btn-primary mt-5 w-full py-2.5 text-sm text-center block">
                    Read guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All guides */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader eyebrow="All guides" title="Browse all travel guides" />

          {/* Category filter chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  c === "All"
                    ? "border-navy bg-navy text-white"
                    : "border-soft-200 bg-white text-charcoal hover:border-navy/30 hover:text-navy"
                }`}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((g) => (
              <div key={g.id} className="card card-hover flex gap-4 p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-soft-100 text-3xl">
                  {g.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="chip text-xs">{g.category}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-navy leading-snug line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-xs text-charcoal/55 line-clamp-1">{g.excerpt}</p>
                  <p className="mt-2 text-xs text-charcoal/40">📖 {g.readTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa guides cross-link */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa intelligence"
            title="Detailed visa guides"
            subtitle="Step-by-step visa guides with document checklists, fee breakdowns and common mistakes to avoid."
            linkHref="/visa"
            linkLabel="Open visa center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visas.slice(0, 4).map((v) => (
              <Link
                key={v.slug}
                href={`/visa/${v.slug}`}
                className="card card-hover flex flex-col p-5"
              >
                <span className="text-3xl">{v.flag}</span>
                <h3 className="mt-3 text-sm font-bold text-navy">{v.type}</h3>
                <p className="mt-1 text-xs text-charcoal/55">{v.country}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-charcoal/45">From {v.feeFrom.split(" ")[0]}</span>
                  <span className="font-semibold text-blue">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-soft">
        <div className="container-px">
          <div className="overflow-hidden rounded-3xl border border-soft-200 bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
            <span className="text-5xl">📬</span>
            <h2 className="mt-4 text-2xl font-extrabold text-navy sm:text-3xl">
              Get travel guides in your inbox
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-charcoal/65">
              New destination guides, visa updates and travel deals — curated weekly
              by our AI and verified by travel experts.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
              <Link href="/lead/contact" className="btn-primary px-6 py-3 shrink-0 text-center">
                Request guide updates
              </Link>
            </div>
            <p className="mt-3 text-xs text-charcoal/40">
              Newsletter signup opens soon. Contact us to request destination guides.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
