import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HeroStatsBar } from "@/components/HeroStatsBar";
import { AICommandCenter } from "@/components/AICommandCenter";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQ } from "@/components/FAQ";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";
import { HomeTravelServicesSection } from "@/components/HomeTravelServicesSection";
import { TrustSection } from "@/components/TrustSection";
import { ProviderOnboardingCta } from "@/components/ProviderOnboardingCta";
import { visaHubHref } from "@/lib/marketplace-routes";

export default async function Home() {
  const { visas, faqs, visaHubCards } = await loadCatalogBundle();
  const featuredUsa = visas.find((v) => v.slug === "usa-b1-b2")!;

  return (
    <>
      <Hero statsBar={<HeroStatsBar />} />

      <div className="border-b border-soft-200 bg-gold-50">
        <div className="container-px py-3">
          <p className="text-center text-[11px] text-charcoal/60 leading-relaxed">
            <span className="font-bold text-charcoal/80">Disclaimer:</span>{" "}
            Independent marketplace — not a government agency or immigration authority.
            Visa approvals are never guaranteed.{" "}
            <Link href="/legal/disclaimer" className="font-semibold text-navy/70 underline hover:text-navy">
              Full disclaimer →
            </Link>
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="section-sm border-b border-soft-200 bg-white">
        <div className="container-px">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "AI visa check",
                text: "Get requirement summaries, document checklists, and difficulty insights for your nationality and destination.",
                href: "/ai-visa-assistant",
                cta: "Start AI Visa Check",
              },
              {
                step: "02",
                title: "Plan your trip",
                text: "Build AI itineraries with budget estimates, visa notes, and activity suggestions for international travel.",
                href: "/ai-trip-planner",
                cta: "Plan My Trip",
              },
              {
                step: "03",
                title: "Expert support",
                text: "Connect with verified visa experts and travel providers when you need human review and confirmed quotes.",
                href: "/agents",
                cta: "Find experts",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-soft-200 bg-soft/30 p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">{item.step}</span>
                <h3 className="mt-2 text-lg font-extrabold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.text}</p>
                <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-blue hover:underline">
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AICommandCenter />

      {/* Featured visa guide */}
      <section className="section">
        <div className="container-px">
          <div className="overflow-hidden rounded-3xl bg-hero-gradient shadow-[var(--shadow-premium)]">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-8 sm:p-12">
                <span className="eyebrow-gold">
                  <Icon name="star" className="h-3.5 w-3.5" /> Featured route
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  USA Visa from{" "}
                  <span className="text-gradient-gold">Pakistan</span>
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
                  AI-guided preparation for the {featuredUsa.type}: DS-160, embassy fees,
                  interview prep and document checklist — tailored for Pakistani applicants.
                </p>
                <ul className="mt-6 space-y-2">
                  {featuredUsa.steps.slice(0, 3).map((step) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm text-white/75">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {step}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/ai-visa-assistant" className="btn-gold px-6 py-3">
                    Start AI Visa Check
                  </Link>
                  <Link href="/visa/usa-from-pakistan" className="btn border border-white/20 px-6 py-3 text-white hover:bg-white/10">
                    Full PK → USA guide
                  </Link>
                </div>
              </div>
              <div className="hidden items-center justify-center bg-white/5 p-10 lg:flex">
                <div className="text-center">
                  <div className="text-[88px] leading-none animate-float">🛂</div>
                  <p className="mt-4 text-sm text-white/55 max-w-xs">
                    Consular fee from <span className="font-bold text-gold">$185</span> · Processing 3–12 weeks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visa hub — top destinations */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa intelligence"
            title="Popular visa destinations"
            subtitle="AI-powered guides for the routes our travelers ask about most. General information only — not approval guarantees."
            linkHref="/visa"
            linkLabel="All visa guides"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visaHubCards.slice(0, 4).map((v) => (
              <Link
                key={v.slug}
                href={visaHubHref(v.slug)}
                className="card card-hover group flex flex-col p-5 overflow-hidden relative"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${v.difficultyColor}`} />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-2xl">{v.flag}</span>
                    <h3 className="mt-1.5 text-sm font-bold text-navy">{v.country}</h3>
                    <p className="text-xs text-charcoal/55 mt-0.5">{v.type}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${v.difficultyColor}`}>
                    {v.difficultyLabel}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-charcoal/50">{v.timeline}</span>
                  <span className="font-extrabold text-navy">{v.fee}</span>
                </div>
                <p className="mt-3 text-[11px] text-charcoal/55 line-clamp-2">{v.aiRecommendation}</p>
                <span className="mt-4 text-xs font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  View guide →
                </span>
              </Link>
            ))}
          </div>
          <Disclaimer className="mt-6" variant="compact" />
        </div>
      </section>

      <HomeTravelServicesSection />

      <section className="section-sm">
        <div className="container-px">
          <ProviderOnboardingCta />
        </div>
      </section>

      <TrustSection compact />

      <section className="section bg-soft">
        <div className="container-px max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Common questions" center />
          <FAQ items={faqs.slice(0, 6)} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-sm bg-hero-gradient relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container-px relative text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready for your next international journey?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/65">
            Start with AI visa guidance, plan your trip, or join as a verified provider.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/ai-visa-assistant" className="btn-gold w-full px-8 py-3.5 sm:w-auto">
              Start AI Visa Check
            </Link>
            <Link href="/ai-trip-planner" className="btn w-full border border-white/20 px-8 py-3.5 text-white hover:bg-white/10 sm:w-auto">
              Plan My Trip
            </Link>
            <Link href="/register?role=agent" className="btn w-full border border-white/15 px-8 py-3.5 text-white/90 hover:border-gold/40 hover:text-gold sm:w-auto">
              Become a Verified Provider
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
