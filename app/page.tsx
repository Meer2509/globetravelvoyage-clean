import Link from "next/link";
import { Hero } from "@/components/Hero";
import { AICommandCenter } from "@/components/AICommandCenter";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQ } from "@/components/FAQ";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
import { Stars } from "@/components/Stars";
import {
  services,
  cheapRoutes,
  usaRoutes,
  stays,
  visas,
  reviews,
  roles,
  faqs,
  trustItems,
  referralTiers,
  travelGuides,
  visaHubCards,
  ticketRoutes,
  propertyListings,
  marketplaceProviders,
} from "@/lib/data";

export default function Home() {
  const featuredUsa = visas.find((v) => v.slug === "usa-b1-b2")!;

  return (
    <>
      {/* ── 1. Hero + 7-Tab AI Search ── */}
      <Hero />

      {/* ── 2. Service Ecosystem ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Everything travel"
            title="One platform. Every travel need."
            subtitle="Search, plan, apply, book and compare — all powered by AI and verified experts across 190+ countries."
            center
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="card card-hover group relative flex flex-col items-start p-5"
              >
                {s.badge && (
                  <span className="absolute right-3 top-3 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                    {s.badge}
                  </span>
                )}
                <span
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-navy transition-transform duration-300 group-hover:scale-110`}
                >
                  <span className="text-xl">{s.emoji}</span>
                </span>
                <h3 className="text-sm font-bold text-navy leading-snug">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-charcoal/60">
                  {s.description}
                </p>
                <span className="mt-3 text-xs font-semibold text-blue opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
            subtitle="Compare visa requirements, difficulty, processing times and approval rates for top destinations. AI-guided preparation for every passport."
            linkHref="/visa"
            linkLabel="All visa guides"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visaHubCards.slice(0, 8).map((v) => (
              <Link
                key={v.slug}
                href="/visa"
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
                    <p className="text-[10px] text-charcoal/45">Approval rate</p>
                    <p className="text-xs font-semibold text-navy">{v.successRate}%</p>
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
            title="Cheapest ticket routes — AI price tracking"
            subtitle="Compare airlines, track price trends and book the cheapest flights on the most popular Middle East & Pakistan routes. Sample estimates — confirm before booking."
            linkHref="/flights"
            linkLabel="View all routes"
          />

          {/* Route filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: "🇵🇰 Gulf → Pakistan", count: cheapRoutes.length },
              { label: "🇮🇳 Gulf → India", count: 2 },
              { label: "🇵🇭 Gulf → Philippines", count: 1 },
              { label: "✈️ PK → USA/UK", count: 2 },
            ].map((f) => (
              <button
                key={f.label}
                className="rounded-full border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-navy hover:border-blue hover:text-blue transition-colors"
              >
                {f.label}
              </button>
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
              <Link key={dest.name} href={`/destinations`} className="group relative overflow-hidden rounded-2xl cursor-pointer">
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

      {/* ── 9. Verified Marketplace ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Verified marketplace"
            title="Trusted visa experts, agencies & guides"
            subtitle="Every provider is ID-verified and review-rated. Compare response times, languages, specializations and services before connecting."
            linkHref="/agents"
            linkLabel="See all providers"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {marketplaceProviders.slice(0, 6).map((p) => {
              const roleColors: Record<string, string> = {
                "visa-agent": "bg-blue/10 text-blue",
                "agency": "bg-emerald-50 text-emerald-700",
                "guide": "bg-purple-50 text-purple-700",
                "host": "bg-amber-50 text-amber-700",
              };
              return (
                <div key={p.id} className="card card-hover p-5 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-2xl bg-navy text-xl font-extrabold text-gold">
                        {p.avatar}
                      </div>
                      {p.verified && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue text-white text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-navy truncate">{p.name}</h3>
                        {p.featured && (
                          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Featured</span>
                        )}
                      </div>
                      <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${roleColors[p.role] ?? "bg-soft text-charcoal"}`}>
                        {p.roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mt-3 flex items-center gap-2">
                    <Stars rating={Math.round(p.rating)} />
                    <span className="text-sm font-bold text-navy">{p.rating}</span>
                    <span className="text-xs text-charcoal/45">({p.reviews} reviews)</span>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Icon name="globe" className="h-3.5 w-3.5 text-charcoal/40" />
                      <span className="text-charcoal/60">{p.city}, {p.country} {p.flag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="sparkles" className="h-3.5 w-3.5 text-charcoal/40" />
                      <span className="text-charcoal/60">Specializes in {p.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="check" className="h-3.5 w-3.5 text-charcoal/40" />
                      <span className="text-charcoal/60">Responds in {p.responseTime}</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.languages.map((l) => (
                      <span key={l} className="chip text-[10px] px-2">{l}</span>
                    ))}
                  </div>

                  {/* Services */}
                  <div className="mt-3 flex-1">
                    <div className="flex flex-wrap gap-1">
                      {p.services.slice(0, 2).map((s) => (
                        <span key={s} className="rounded-lg bg-blue/5 px-2 py-1 text-[11px] text-navy/65">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-4">
                    <div>
                      <p className="text-[10px] text-charcoal/40">Starting from</p>
                      <p className="text-base font-extrabold text-navy">{p.priceFrom}</p>
                    </div>
                    <Link href="/agents" className="btn-blue px-4 py-2 text-xs">
                      Connect
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/agents" className="btn-primary px-8 py-3">
              Browse All Visa Experts
            </Link>
            <Link href="/agencies" className="btn-outline px-8 py-3">
              Travel Agencies
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. Travel Property Marketplace ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Property marketplace"
            title="Travel stays, rentals & investment properties"
            subtitle="From nightly vacation homes to monthly furnished apartments and buy/sell property listings across the Middle East, South Asia and beyond."
            linkHref="/properties"
            linkLabel="All properties"
          />

          {/* Type filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { label: "🌙 Vacation stays",      href: "/properties" },
              { label: "🏢 Monthly rentals",     href: "/properties" },
              { label: "💰 For sale / invest",   href: "/properties" },
              { label: "📋 Post a listing",      href: "/properties/post" },
            ].map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="rounded-full border border-soft-200 bg-white px-4 py-2 text-xs font-semibold text-navy hover:border-blue hover:text-blue transition-colors"
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {propertyListings.slice(0, 6).map((p) => (
              <Link key={p.id} href="/properties" className="card card-hover group overflow-hidden flex flex-col">
                {/* Thumbnail */}
                <div className={`relative h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                  <span className="text-5xl opacity-70">{p.emoji}</span>
                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-navy">
                      {p.tag}
                    </span>
                  )}
                  <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                    p.type === "sale" ? "bg-gold" : p.type === "stay" ? "bg-blue" : "bg-emerald-500"
                  }`}>
                    {p.type === "stay" ? "Stay" : p.type === "sale" ? "For Sale" : "For Rent"}
                  </span>
                  {p.verified && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-blue/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      <Icon name="check" className="h-3 w-3" /> Verified
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-navy leading-tight">{p.name}</h3>
                      <p className="text-xs text-charcoal/55 mt-0.5">{p.city} {p.flag}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-charcoal/60">
                    {p.beds > 0 ? <span>🛏 {p.beds} BR</span> : <span>🏠 Studio</span>}
                    {p.sqft > 0 && <span>·</span>}
                    {p.sqft > 0 && <span>📐 {p.sqft} sqft</span>}
                    {p.rating > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="text-gold">★</span>
                          <span className="font-semibold text-navy">{p.rating}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="chip text-[10px] px-2">{a}</span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-end justify-between border-t border-soft-200 pt-4 mt-4">
                    <div>
                      <p className="text-xl font-extrabold text-navy">{p.price}</p>
                      <p className="text-xs text-charcoal/45">per {p.per}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal/40">{p.host}</span>
                      <span className="text-xs font-semibold text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Disclaimer className="mt-6">
            Globe Travel Voyage is not a real estate broker or agent. Property listings are provided by independent hosts. Always conduct proper due diligence before any transaction.
          </Disclaimer>
        </div>
      </section>

      {/* ── 11. Social Proof ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Trusted by travelers"
            title="Real reviews from real travelers"
            center
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((r) => (
              <div key={r.name} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-navy text-sm">{r.name}</p>
                      <p className="text-xs text-charcoal/50">{r.location}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/70">
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="mt-4 text-xs text-charcoal/40 border-t border-soft-200 pt-3">{r.service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Referral & Rewards ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Referral program"
            title="Earn while you explore"
            subtitle="Share Globe Travel Voyage with your network and earn rewards for every traveler you bring. Three luxury tiers with increasing benefits."
            center
          />
          <div className="grid gap-5 sm:grid-cols-3">
            {referralTiers.map((tier, i) => (
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
                    Start earning
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-navy p-6 text-center">
            <p className="text-base font-bold text-white">Your referral link is waiting</p>
            <p className="mt-1 text-sm text-white/60">Sign up to get your unique referral code and start earning with every friend you invite.</p>
            <Link href="/register" className="btn-gold mt-4 px-8 py-3">
              Join the referral program
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
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Globe Travel Voyage operates with full transparency. Every provider is verified, every review is authentic, and every disclaimer is clearly stated.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: "🛡️",
                title: "Identity Verification",
                desc: "Every visa agent, agency, guide and host completes KYC identity verification before appearing on the platform.",
              },
              {
                emoji: "🔐",
                title: "Secure Communication",
                desc: "All messages between travelers and providers happen through our secure, encrypted messaging system.",
              },
              {
                emoji: "🤖",
                title: "AI Fraud Detection",
                desc: "Our AI systems monitor listings, reviews and communications for fake content, scams and suspicious activity.",
              },
              {
                emoji: "⚖️",
                title: "Visa Disclaimer",
                desc: "We are NOT a government agency, embassy or immigration authority. No visa approval is ever guaranteed by this platform.",
              },
              {
                emoji: "💳",
                title: "Payment Protection",
                desc: "Payments go through a secure escrow process. Funds are only released when services are confirmed and completed.",
              },
              {
                emoji: "📞",
                title: "24/7 Support Team",
                desc: "Our human support team is available to help with any dispute, question or concern — always real people, not just bots.",
              },
              {
                emoji: "⭐",
                title: "Authentic Reviews",
                desc: "Reviews are only accepted from verified travelers who have actually completed a booking or transaction.",
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
            ].map((item) => (
              <div key={item.title} className="card-dark group rounded-2xl border border-white/8 bg-white/5 p-5 hover:bg-white/8 transition-colors backdrop-blur-sm">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Disclaimer className="text-white/50 text-center text-sm leading-relaxed max-w-4xl mx-auto" />
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
              <Link key={g.id} href="/guides" className="card card-hover group overflow-hidden flex flex-col">
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
          <p className="mx-auto mt-5 max-w-xl text-base text-white/65">
            Join thousands of travelers who use Globe Travel Voyage for AI-powered trip planning, visa guidance, and booking the best travel services worldwide.
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
