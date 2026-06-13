import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HeroStatsBar } from "@/components/HeroStatsBar";
import { AICommandCenter } from "@/components/AICommandCenter";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQ } from "@/components/FAQ";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
import {
  services,
  cheapRoutes,
  usaRoutes,
  stays,
  visas,
  roles,
  faqs,
  referralTiers,
  travelGuides,
  visaHubCards,
  ticketRoutes,
} from "@/lib/data";
import { HomeMarketplaceSection } from "@/components/HomeMarketplaceSection";
import { HomePropertiesSection } from "@/components/HomePropertiesSection";
import { HomeServicesSection } from "@/components/HomeServicesSection";
import { TrustSection } from "@/components/TrustSection";
import { ProviderOnboardingCta } from "@/components/ProviderOnboardingCta";
import { PriceEstimateLabel } from "@/components/PriceEstimateLabel";
import { areReferralRewardsLive, REFERRAL_LAUNCHING_SOON } from "@/lib/launch-trust";
import { visaHubHref, destinationHref, guideHref } from "@/lib/marketplace-routes";

export default function Home() {
  const featuredUsa = visas.find((v) => v.slug === "usa-b1-b2")!;

  return (
    <>
      {/* ── 1. Hero + 7-Tab AI Search ── */}
      <Hero statsBar={<HeroStatsBar />} />

      {/* ── Disclaimer strip ── */}
      <div className="border-b border-soft-200 bg-gold-50">
        <div className="container-px py-3">
          <p className="text-center text-[11px] text-charcoal/60 leading-relaxed">
            <span className="font-bold text-charcoal/80">⚠ Disclaimer:</span>{" "}
            Globe Travel Voyage is an independent marketplace — not a government agency, embassy, immigration authority, airline, hotel chain or real estate broker.
            {" "}Visa approvals, prices and availability are never guaranteed. All information is for guidance only.{" "}
            <Link href="/legal/disclaimer" className="font-semibold text-navy/70 underline hover:text-navy">Full disclaimer →</Link>
          </p>
        </div>
      </div>

      {/* ── 2. Service Ecosystem ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Everything travel"
            title="One platform. Every travel need."
            subtitle="Search, plan, apply, book and compare — powered by AI guidance and a verified provider marketplace launching now."
            center
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="card card-hover group relative flex flex-col items-start p-5 sm:p-6"
              >
                {s.badge && (
                  <span className="absolute right-3 top-3 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                    {s.badge}
                  </span>
                )}
                <span
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} shadow-[0_4px_16px_-4px_rgba(8,28,58,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_24px_-4px_rgba(8,28,58,0.22)]`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                </span>
                <h3 className="text-sm font-bold text-navy leading-snug">{s.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-charcoal/55">
                  {s.description}
                </p>
                <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-2">
                  Explore <span>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeServicesSection />

      {/* ── 3. AI Travel Command Center ── */}
      <AICommandCenter />

      {/* ── 4. Featured USA Visa from Pakistan ── */}
      <section className="section">
        <div className="container-px">
          <div className="overflow-hidden rounded-3xl bg-hero-gradient shadow-[var(--shadow-premium)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-14">
                <span className="eyebrow-gold">
                  <Icon name="star" className="h-3.5 w-3.5" /> Featured guidance
                </span>
                <h2 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                  USA Visa from{" "}
                  <span className="text-gradient-gold">Pakistan 🇵🇰→🇺🇸</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  Step-by-step AI guidance for the {featuredUsa.type}: DS-160, embassy fees,
                  interview preparation and a complete document checklist — tailored for applicants in Pakistan.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Processing", value: "3–12 weeks" },
                    { label: "Validity", value: "Up to 10 yrs" },
                    { label: "Max stay", value: "6 months" },
                    { label: "Fee from", value: "$185" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/50">{s.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>

                <ul className="mt-7 space-y-2.5">
                  {featuredUsa.steps.slice(0, 4).map((step) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm text-white/75">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {step}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/visa/usa-from-pakistan" className="btn-gold px-6 py-3">
                    View Full PK → USA Guide
                  </Link>
                  <Link href="/agents" className="btn border border-white/20 px-6 py-3 text-white hover:bg-white/10">
                    Find a visa expert
                  </Link>
                </div>
              </div>
              <div className="relative hidden items-center justify-center bg-white/5 lg:flex">
                <div className="p-10 text-center">
                  <div className="text-[100px] leading-none animate-float">🛂</div>
                  <p className="mt-5 text-sm text-white/60 max-w-xs mx-auto">
                    Plus PK → USA tickets from{" "}
                    <span className="font-bold text-gold">$720</span>
                  </p>
                  <div className="mt-4 space-y-2">
                    {usaRoutes.slice(0, 2).map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
                        <span className="text-white/70">{r.from} → {r.to}</span>
                        <span className="font-bold text-gold">{r.priceFrom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Visa Intelligence Hub ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa Intelligence"
            title="AI Visa Intelligence Hub"
            subtitle="Compare visa requirements, difficulty, and processing timelines for top destinations. General guides only — not approval guarantees."
            linkHref="/visa"
            linkLabel="All visa guides"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visaHubCards.slice(0, 8).map((v) => (
              <Link
                key={v.slug}
                href={visaHubHref(v.slug)}
                className="card card-hover group flex flex-col p-5 overflow-hidden relative"
              >
                {/* Difficulty accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${v.difficultyColor}`} />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-2xl">{v.flag}</span>
                    <h3 className="mt-1.5 text-sm font-bold text-navy leading-tight">{v.country}</h3>
                    <p className="text-xs text-charcoal/55 mt-0.5 leading-snug">{v.type}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${v.difficultyColor}`}>
                    {v.difficultyLabel}
                  </span>
                </div>

                {/* Difficulty bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal/50">Difficulty</span>
                    <span className="font-bold text-navy">{v.difficultyScore}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-soft-200">
                    <div className={`h-1.5 rounded-full ${v.difficultyColor}`} style={{ width: `${v.difficultyScore * 10}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-soft p-2">
                    <p className="text-[10px] text-charcoal/45">Timeline</p>
                    <p className="text-xs font-semibold text-navy">{v.timeline}</p>
                  </div>
                  <div className="rounded-lg bg-soft p-2">
                    <p className="text-[10px] text-charcoal/45">Guide type</p>
                    <p className="text-xs font-semibold text-navy">General info</p>
                  </div>
                </div>

                {/* Fee */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-charcoal/50">Consular fee</span>
                  <span className="text-sm font-extrabold text-navy">{v.fee}</span>
                </div>

                {/* AI tip */}
                <div className="mt-3 rounded-lg bg-blue/5 px-3 py-2 flex items-start gap-1.5">
                  <Icon name="sparkles" className="h-3.5 w-3.5 shrink-0 text-blue mt-0.5" />
                  <p className="text-[11px] text-navy/65 line-clamp-2">{v.aiRecommendation}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {v.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="chip text-[10px] px-2">{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    Guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Disclaimer className="mt-8" />
        </div>
      </section>

      {/* ── 6. Smart Ticket Marketplace ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Smart ticket marketplace"
            title="Cheapest ticket routes — sample estimates"
            subtitle="Compare airlines on popular Middle East and Pakistan routes. Sample estimates only — submit a request for live quotes."
            linkHref="/flights"
            linkLabel="View all routes"
          />

          {/* Route filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: "🇵🇰 Gulf → Pakistan", href: "/flights" },
              { label: "🇮🇳 Gulf → India", href: "/flights" },
              { label: "🇵🇭 Gulf → Philippines", href: "/flights" },
              { label: "✈️ PK → USA/UK", href: "/flights" },
            ].map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="rounded-full border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-navy hover:border-gold hover:text-navy transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ticketRoutes.slice(0, 6).map((r) => (
              <div key={r.id} className="card card-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">{r.fromFlag}</span>
                      <span className="font-extrabold text-navy">{r.fromCode}</span>
                      <span className="text-charcoal/30">→</span>
                      <span className="text-xl">{r.toFlag}</span>
                      <span className="font-extrabold text-navy">{r.toCode}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-navy">
                      {r.from} → {r.to}
                    </h3>
                  </div>
                  {r.trending && (
                    <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                      🔥 Trending
                    </span>
                  )}
                </div>

                {/* Airlines */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.airlines.map((a) => (
                    <span key={a} className="chip text-[10px] px-2">{a}</span>
                  ))}
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-soft p-2">
                    <p className="text-charcoal/45">Duration</p>
                    <p className="font-semibold text-navy">{r.duration}</p>
                  </div>
                  <div className="rounded-lg bg-soft p-2">
                    <p className="text-charcoal/45">Cheapest month</p>
                    <p className="font-semibold text-navy">{r.cheapestMonth}</p>
                  </div>
                </div>

                {/* AI tip */}
                <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-blue/5 px-3 py-2">
                  <Icon name="sparkles" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                  <p className="text-[11px] text-navy/65">{r.tip}</p>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-soft-200 pt-3">
                  <div>
                    <p className="text-xs text-charcoal/50">from</p>
                    <p className="text-xl font-extrabold text-navy">{r.priceFrom}</p>
                    <p className="text-xs text-charcoal/40">up to {r.priceTo}</p>
                    <PriceEstimateLabel className="mt-1" />
                  </div>
                  <Link href="/flights" className="btn-blue px-4 py-2 text-xs">
                    Search
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Disclaimer className="mt-6" variant="compact" />
        </div>
      </section>

      {/* ── 7. Hotels & Luxury Stays ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Hotels & stays"
            title="Luxury stays, vacation homes & monthly rentals"
            subtitle="From five-star Dubai hotels to furnished monthly apartments in Karachi and Manila — find and compare your perfect stay."
            linkHref="/hotels"
            linkLabel="Browse all stays"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stays.slice(0, 6).map((s) => (
              <Link key={s.id} href="/hotels" className="card card-hover group overflow-hidden">
                {/* Image placeholder */}
                <div className="relative h-44 bg-gradient-to-br from-blue/20 to-navy/20 flex items-center justify-center">
                  <span className="text-5xl opacity-80">{s.emoji}</span>
                  {s.stars && (
                    <div className="absolute bottom-3 left-3 flex gap-0.5">
                      {Array.from({ length: s.stars }).map((_, i) => (
                        <span key={i} className="text-gold text-sm">★</span>
                      ))}
                    </div>
                  )}
                  <span className="absolute right-3 top-3 chip text-[10px] bg-white/90 border-transparent text-navy">
                    {s.type}
                  </span>
                </div>
                <div className="p-5">
                  <div>
                    <h3 className="font-bold text-navy">{s.name}</h3>
                    <p className="text-xs text-charcoal/55 mt-0.5">{s.city}, {s.country}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="chip text-[10px] px-2">{a}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-charcoal/45">from</p>
                      <p className="text-xl font-extrabold text-navy">{s.pricePerNight}</p>
                      <p className="text-[10px] text-charcoal/45">per night</p>
                      <PriceEstimateLabel className="mt-1" />
                    </div>
                    <span className="text-xs font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Luxury Destination Explorer ── */}
      <section className="section section-dark bg-section-dark relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-blue/15 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-gold/8 blur-[100px]" />

        <div className="container-px relative">
          <SectionHeader
            eyebrow="Destination explorer"
            title="Discover luxury destinations"
            subtitle="Hand-curated travel destinations with AI-powered budget estimates, visa overviews and featured experiences."
            linkHref="/destinations"
            linkLabel="All destinations"
            dark
          />

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[
              { name: "Dubai", country: "UAE", flag: "🇦🇪", emoji: "🏙️", budget: "from $800", season: "Nov–Apr", visa: "eVisa (easy)", gradient: "from-blue/30 to-navy/80", tag: "🔥 Most popular" },
              { name: "Istanbul", country: "Turkey", flag: "🇹🇷", emoji: "🕌", budget: "from $600", season: "Apr–Jun", visa: "eVisa ($50)", gradient: "from-red-800/40 to-navy/80", tag: "✨ Staff pick" },
              { name: "Bangkok", country: "Thailand", flag: "🇹🇭", emoji: "🏯", budget: "from $500", season: "Nov–Mar", visa: "Visa-free / 30d", gradient: "from-emerald-800/30 to-navy/80", tag: "" },
              { name: "Maldives", country: "Maldives", flag: "🇲🇻", emoji: "🏝️", budget: "from $1,400", season: "Nov–Apr", visa: "Free on arrival", gradient: "from-teal-600/40 to-navy/80", tag: "💎 Luxury" },
              { name: "Switzerland", country: "Switzerland", flag: "🇨🇭", emoji: "🏔️", budget: "from $2,000", season: "Jun–Sep", visa: "Schengen visa", gradient: "from-sky-700/30 to-navy/80", tag: "" },
              { name: "Japan", country: "Japan", flag: "🇯🇵", emoji: "🗻", budget: "from $1,200", season: "Mar–May", visa: "eVisa / Free", gradient: "from-pink-700/30 to-navy/80", tag: "🌸 Spring pick" },
              { name: "London", country: "UK", flag: "🇬🇧", emoji: "🎡", budget: "from $1,400", season: "May–Sep", visa: "UK Visitor Visa", gradient: "from-purple-700/30 to-navy/80", tag: "" },
              { name: "New York", country: "USA", flag: "🇺🇸", emoji: "🗽", budget: "from $2,000", season: "Sep–Nov", visa: "USA B1/B2", gradient: "from-slate-700/30 to-navy/80", tag: "" },
              { name: "Saudi Arabia", country: "Saudi Arabia", flag: "🇸🇦", emoji: "🕋", budget: "from $700", season: "Oct–Mar", visa: "eVisa (fast)", gradient: "from-green-800/30 to-navy/80", tag: "🕋 Umrah" },
              { name: "Philippines", country: "Philippines", flag: "🇵🇭", emoji: "🌊", budget: "from $700", season: "Dec–May", visa: "Free 30 days", gradient: "from-blue-700/30 to-navy/80", tag: "" },
              { name: "Canada", country: "Canada", flag: "🇨🇦", emoji: "🍁", budget: "from $1,800", season: "Jun–Aug", visa: "TRV required", gradient: "from-red-700/30 to-navy/80", tag: "" },
              { name: "Pakistan", country: "Pakistan", flag: "🇵🇰", emoji: "🏔️", budget: "from $300", season: "Oct–Mar", visa: "eVisa (175+ nations)", gradient: "from-green-700/30 to-navy/80", tag: "🌟 Hidden gem" },
            ].map((dest) => (
              <Link key={dest.name} href={destinationHref(dest.name)} className="group relative overflow-hidden rounded-2xl cursor-pointer">
                {/* Gradient background */}
                <div className={`h-40 bg-gradient-to-b ${dest.gradient} flex items-end justify-start p-4`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 text-6xl">
                    {dest.emoji}
                  </div>
                  {dest.tag && (
                    <span className="absolute right-2 top-2 rounded-full bg-white/15 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                      {dest.tag}
                    </span>
                  )}
                  <div className="relative z-10">
                    <span className="text-lg">{dest.flag}</span>
                    <h3 className="text-base font-extrabold text-white leading-tight">{dest.name}</h3>
                    <p className="text-[11px] text-white/60">{dest.country}</p>
                  </div>
                </div>
                {/* Details */}
                <div className="border border-t-0 border-white/10 bg-white/5 p-3 backdrop-blur-sm rounded-b-2xl group-hover:bg-white/10 transition-colors">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/50">Budget</span>
                    <span className="font-bold text-gold">{dest.budget}</span>
                  </div>
                  <p className="mt-1 text-[9px] text-white/40">Sample estimate — confirm before booking.</p>
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span className="text-white/50">Best time</span>
                    <span className="text-white/70">{dest.season}</span>
                  </div>
                  <div className="mt-1.5">
                    <span className="chip bg-white/8 border-white/10 text-white/60 text-[10px]">{dest.visa}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeMarketplaceSection />

      <HomePropertiesSection />

      <section className="section-sm">
        <div className="container-px">
          <ProviderOnboardingCta />
        </div>
      </section>

      {/* ── 11. Social Proof ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Platform reviews"
            title="Reviews from completed bookings"
            subtitle="Reviews from completed bookings appear here as travelers share feedback."
            center
          />
          <div className="rounded-2xl border-2 border-dashed border-soft-200 bg-white py-16 text-center">
            <p className="font-bold text-navy text-lg">No platform reviews yet</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-charcoal/50">
              Verified reviews will appear after completed bookings.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/agents" className="btn-primary px-5 py-2.5 text-sm">Find visa experts</Link>
              <Link href="/agencies" className="btn-outline px-5 py-2.5 text-sm">Browse agencies</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Referral & Rewards ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Referral program"
            title={areReferralRewardsLive() ? "Earn while you explore" : REFERRAL_LAUNCHING_SOON}
            subtitle={
              areReferralRewardsLive()
                ? "Share Globe Travel Voyage with your network and earn rewards for every traveler you bring."
                : "We are preparing referral rewards for early members. Sign up now to be notified when payouts go live."
            }
            center
          />
          {!areReferralRewardsLive() && (
            <div className="mb-8 rounded-2xl border border-gold/25 bg-gold/5 px-5 py-4 text-center text-sm text-muted">
              <p className="font-bold text-navy">{REFERRAL_LAUNCHING_SOON}</p>
              <p className="mt-1">Referral tracking is in development. Commission payouts will open after launch verification.</p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-3">
            {referralTiers.map((tier) => (
              <div
                key={tier.name}
                className={`card overflow-hidden relative ${tier.highlight ? "border-gold ring-2 ring-gold/20 shadow-[var(--shadow-gold)]" : ""}`}
              >
                {tier.highlight && (
                  <div className="bg-gold-gradient px-4 py-1.5 text-center text-xs font-bold text-navy">
                    ⭐ Most rewarding
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-4xl">{tier.badge}</span>
                    <div>
                      <h3 className="text-lg font-extrabold text-navy">{tier.name}</h3>
                      <p className="text-sm text-charcoal/55">{tier.referrals}</p>
                    </div>
                  </div>
                  <div className="mb-4 rounded-2xl bg-soft p-4 text-center">
                    <p className="text-2xl font-extrabold text-navy">{tier.commission}</p>
                    <p className="text-xs text-charcoal/50 mt-1">commission earned</p>
                  </div>
                  <ul className="space-y-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-charcoal/70">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/referrals" className={`mt-5 w-full py-2.5 text-sm inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ${tier.highlight ? "btn-gold" : "btn-outline"}`}>
                    {areReferralRewardsLive() ? "Start earning" : "Get notified"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-navy p-6 text-center">
            <p className="text-base font-bold text-white">
              {areReferralRewardsLive() ? "Your referral link is waiting" : REFERRAL_LAUNCHING_SOON}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {areReferralRewardsLive()
                ? "Sign up to get your unique referral code and start earning with every friend you invite."
                : "Create a free account to reserve your place. We will email you when referral rewards open."}
            </p>
            <Link href="/register" className="btn-gold mt-4 px-8 py-3">
              {areReferralRewardsLive() ? "Join the referral program" : "Join the waitlist"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 13. Trust & Safety Center ── */}
      <section className="section section-dark bg-section-dark relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue/10 to-transparent" />

        <div className="container-px relative">
          <div className="mb-12 text-center">
            <span className="eyebrow-gold mb-4">Trust &amp; Safety</span>
            <h2 className="mt-4 h-section text-white">
              Your safety is our{" "}
              <span className="text-gradient-gold">top priority</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-dark">
              Globe Travel Voyage operates with full transparency. We are an independent marketplace — not a government agency, embassy, or immigration authority.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: "🛡️",
                title: "Provider Verification",
                desc: "Provider verification is reviewed by our admin team before profiles go live on the marketplace.",
              },
              {
                emoji: "💳",
                title: "Secure Payments",
                desc: "Secure payments powered by Stripe. Card data is handled by Stripe — we never store raw payment details.",
              },
              {
                emoji: "⭐",
                title: "Authentic Reviews",
                desc: "Reviews appear after completed bookings. No pay-to-rank or fabricated ratings.",
              },
              {
                emoji: "⚖️",
                title: "Visa Disclaimer",
                desc: "We are NOT a government agency, embassy or immigration authority. No visa approval is ever guaranteed by this platform.",
              },
              {
                emoji: "🔐",
                title: "Secure Communication",
                desc: "Messages between travelers and providers are handled through our platform messaging system.",
              },
              {
                emoji: "📋",
                title: "Pricing Disclaimer",
                desc: "All prices shown are estimates only. Final prices depend on availability, dates and provider confirmation.",
              },
              {
                emoji: "🏛️",
                title: "Independent Marketplace",
                desc: "We connect travelers with providers. We are not an airline, hotel chain, embassy or real estate broker.",
              },
              {
                emoji: "🤖",
                title: "AI Guidance",
                desc: "AI tools help with trip planning and document checklists — always paired with clear disclaimers and human experts when needed.",
              },
              {
                emoji: "📞",
                title: "Support",
                desc: "Contact our team through the support page for questions about bookings, providers, or your account.",
              },
            ].map((item) => (
              <div key={item.title} className="group rounded-2xl border border-white/8 bg-white/5 p-6 hover:bg-white/10 hover:border-gold/20 transition-all duration-300 backdrop-blur-sm cursor-default">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-2xl transition-transform duration-300 group-hover:scale-110">{item.emoji}</div>
                <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-dark">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Legal Disclaimer</h3>
            </div>
            <Disclaimer className="text-white/55 text-center text-sm leading-relaxed max-w-4xl mx-auto" />
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-white/35">
              <Link href="/legal/disclaimer" className="hover:text-gold transition-colors">Full Disclaimer</Link>
              <span>·</span>
              <Link href="/legal/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link href="/legal/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 14. Travel Guides teaser ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Travel intelligence"
            title="Expert travel guides"
            subtitle="In-depth visa guides, destination insights, cost breakdowns and AI travel tips written for real-world travelers."
            linkHref="/guides"
            linkLabel="All guides"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {travelGuides.slice(0, 3).map((g) => (
              <Link key={g.id} href={guideHref(g)} className="card card-hover group overflow-hidden flex flex-col">
                <div className="h-40 bg-gradient-to-br from-navy to-blue/80 flex items-end p-5">
                  <span className="eyebrow-white text-[10px]">{g.category}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {g.featured && (
                    <span className="eyebrow mb-2 text-[10px]">Editor&apos;s pick</span>
                  )}
                  <h3 className="font-bold text-navy leading-snug group-hover:text-blue transition-colors">
                    {g.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-charcoal/60 line-clamp-2">{g.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-charcoal/40">
                    <span>⏱ {g.readTime} read</span>
                    <span className="font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. FAQ ── */}
      <section className="section">
        <div className="container-px max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" center />
          <FAQ items={faqs.slice(0, 8)} />
        </div>
      </section>

      <TrustSection />

      {/* ── 16. CTA ── */}
      <section className="section-sm bg-hero-gradient relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="container-px relative text-center">
          <span className="eyebrow-gold mb-4">Get started free</span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Start your global journey today
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-dark">
            Create your free account for AI-powered trip planning, visa guidance, and access to our verified provider marketplace as it launches.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register" className="btn-gold w-full px-8 py-3.5 sm:w-auto">
              <Icon name="sparkles" className="h-4 w-4" />
              Create free account
            </Link>
            <Link href="/trip-planner" className="btn w-full border border-white/20 px-8 py-3.5 text-white hover:bg-white/10 sm:w-auto backdrop-blur-sm">
              Plan with AI — no signup
            </Link>
          </div>
          <div className="mt-6 text-xs text-white/35">
            No credit card required · No visa approval guarantee · Independent marketplace
          </div>
        </div>
      </section>
    </>
  );
}
