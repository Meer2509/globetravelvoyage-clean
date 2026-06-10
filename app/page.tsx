import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { TrustBadge } from "@/components/TrustBadge";
import { CTASection } from "@/components/CTASection";
import { ListingGrid } from "@/components/ListingGrid";
import { FAQ } from "@/components/FAQ";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
import { Stars } from "@/components/Stars";
import {
  services,
  cheapRoutes,
  usaRoutes,
  stays,
  cars,
  cruises,
  tours,
  agents,
  agencies,
  destinations,
  faqs,
  trustItems,
  referralTiers,
  visas,
  reviews,
  roles,
  travelGuides,
} from "@/lib/data";

export default function Home() {
  const featuredUsa = visas.find((v) => v.slug === "usa-b1-b2")!;

  return (
    <>
      {/* ── 1. Hero + AI Command Search ── */}
      <Hero />

      {/* ── 2. Service Ecosystem (20 cards) ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Everything travel"
            title="One platform. Every travel need."
            subtitle="Search, plan, apply, book, compare and get help for almost every travel-related service — powered by AI and verified experts."
            center
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-navy`}
                >
                  <span className="text-xl">{s.emoji}</span>
                </span>
                <h3 className="text-sm font-bold text-navy leading-snug">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-charcoal/70">
                  {s.description}
                </p>
                <span className="mt-3 text-xs font-semibold text-blue opacity-0 transition-opacity group-hover:opacity-100">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured USA Visa from Pakistan ── */}
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
                  Step-by-step AI guidance for the {featuredUsa.type}: DS-160,
                  embassy fees, interview preparation and a complete document
                  checklist — tailored for applicants in Pakistan.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Processing", value: "3–12 weeks" },
                    { label: "Validity", value: "Up to 10 yrs" },
                    { label: "Stay", value: "6 months" },
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
                    View PK → USA guide
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
                    Plus PK → USA ticket routes from{" "}
                    <span className="font-bold text-gold">$760</span>
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

      {/* ── 4. Featured Routes ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Hot ticket routes"
            title="Cheapest tickets: Middle East → South & Southeast Asia"
            subtitle="Popular budget routes from the Gulf to Pakistan, India, the Philippines and Bangladesh. Sample prices — always confirm before booking."
            linkHref="/flights"
            linkLabel="See all flights"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cheapRoutes.map((r) => (
              <div key={r.id} className="card card-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                      {r.fromCode} → {r.toCode}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-navy">
                      {r.from} → {r.to}
                    </h3>
                  </div>
                  {r.tag && (
                    <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                      {r.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-charcoal/60">
                  <span>✈️ {r.stops}</span>
                  <span>·</span>
                  <span>{r.duration}</span>
                </div>
                {r.aiTip && (
                  <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-blue/5 px-3 py-2">
                    <Icon name="sparkles" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                    <p className="text-xs text-navy/65">{r.aiTip}</p>
                  </div>
                )}
                <div className="mt-4 flex items-end justify-between border-t border-soft-200 pt-3">
                  <div>
                    <p className="text-xs text-charcoal/50">from</p>
                    <p className="text-xl font-extrabold text-navy">{r.priceFrom}</p>
                  </div>
                  <button className="btn-blue px-4 py-2 text-xs">View deal</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      {/* ── 5. AI Visa Intelligence Center ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa intelligence"
            title="AI visa guidance for every country"
            subtitle="Understand the right visa type, requirements, fees and timeline — then connect with verified visa agents who prepare your application."
            linkHref="/visa"
            linkLabel="Open visa center"
          />

          {/* Visa Success Score mock UI */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-soft-200 bg-gradient-to-r from-navy to-blue p-6 text-white sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <span className="eyebrow-gold text-xs">AI Visa Success Prep Score</span>
                <h3 className="mt-3 text-xl font-extrabold sm:text-2xl">How ready is your application?</h3>
                <p className="mt-2 text-sm text-white/65">
                  Our AI analyses your document checklist, financial proof, travel history and purpose — then gives you a preparation score and action plan.
                </p>
                <Link href="/visa" className="btn-gold mt-5 px-6 py-2.5 text-sm">
                  Check my readiness
                </Link>
              </div>
              <div className="hidden sm:flex items-center justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold/40 bg-white/10">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-gold">78%</p>
                    <p className="text-xs text-white/60">Sample score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visas.slice(0, 6).map((v) => (
              <Link
                key={v.slug}
                href={`/visa/${v.slug}`}
                className="card card-hover flex flex-col p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{v.flag}</span>
                  <span
                    className={`chip ${
                      v.difficulty === "Easy"
                        ? "bg-blue/10 text-blue border-blue/20"
                        : v.difficulty === "Complex"
                        ? "bg-gold/15 text-navy border-gold/30"
                        : "bg-soft text-charcoal"
                    }`}
                  >
                    {v.difficulty}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{v.type}</h3>
                <p className="text-sm text-charcoal/60">{v.country}</p>
                <p className="mt-2 flex-1 text-sm text-charcoal/65 line-clamp-2">{v.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-soft px-3 py-2">
                    <p className="text-charcoal/45">Processing</p>
                    <p className="font-semibold text-navy">{v.processing.split(" ")[0]}</p>
                  </div>
                  <div className="rounded-lg bg-soft px-3 py-2">
                    <p className="text-charcoal/45">Fee from</p>
                    <p className="font-semibold text-navy">{v.feeFrom.split(" ")[0]}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-soft-200 pt-3 text-sm font-semibold text-blue">
                  View guide & checklist →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AI Trip Planner CTA ── */}
      <section className="section bg-hero-gradient text-white">
        <div className="container-px">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow-gold">
                <Icon name="sparkles" className="h-3.5 w-3.5" /> AI trip planner
              </span>
              <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                Tell us your budget & days.{" "}
                <span className="text-gradient-gold">Get a full plan in seconds.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70">
                Our AI splits your budget across flights, stays, food, tours and
                transport, then drafts a day-by-day itinerary with visa steps,
                hidden gems and local tips.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Budget breakdown by category",
                  "Day-by-day itinerary",
                  "Visa & document reminders",
                  "Restaurant & transport tips",
                  "Verified providers for each step",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/trip-planner" className="btn-gold mt-8 px-7 py-3.5">
                Open the AI Trip Planner
              </Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold/80">Sample AI plan</p>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Destination", value: "Dubai 🇦🇪" },
                  { label: "Days", value: "5" },
                  { label: "Travelers", value: "2 adults" },
                  { label: "Budget", value: "$2,400" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-4 py-2.5">
                    <span className="text-white/60">{r.label}</span>
                    <span className="font-semibold text-white">{r.value}</span>
                  </div>
                ))}
                <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gold">AI budget split</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { item: "✈️ Flights", amount: "$768", pct: 32 },
                      { item: "🏨 Stay", amount: "$672", pct: 28 },
                      { item: "🍽️ Food", amount: "$384", pct: 16 },
                      { item: "🎟️ Tours", amount: "$336", pct: 14 },
                    ].map((b) => (
                      <div key={b.item} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-white/70">
                            <span>{b.item}</span>
                            <span>{b.amount}</span>
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-white/10">
                            <div className="h-1 rounded-full bg-gold/70" style={{ width: `${b.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Hotels & Stays ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Stays"
            title="Hotels & luxury stays"
            subtitle="Five-star hotels, boutique residences, serviced apartments and long-stay rentals across the Gulf, South Asia and beyond."
            linkHref="/hotels"
            linkLabel="Browse all stays"
          />
          <ListingGrid
            items={stays.map((s) => ({
              id: s.id,
              emoji: s.emoji,
              title: s.name,
              subtitle: `${s.city}, ${s.country} · ${s.type}${s.stars ? ` · ${"★".repeat(s.stars)}` : ""}`,
              price: s.pricePerNight,
              priceNote: "per night",
              rating: s.rating,
              reviews: s.reviews,
              tags: s.amenities,
              ctaLabel: "View stay",
            }))}
          />
        </div>
      </section>

      {/* ── 8. Car Rentals ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Car rentals"
            title="Self-drive & chauffeur cars"
            subtitle="Economy hatchbacks to luxury sedans and people carriers — with or without a driver — in 90+ countries."
            linkHref="/car-rentals"
            linkLabel="Browse cars"
          />
          <ListingGrid
            items={cars.map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.model,
              subtitle: `${c.category} · ${c.city}`,
              price: c.pricePerDay,
              priceNote: "per day",
              tags: [`${c.seats} seats`, c.transmission, c.withDriver ? "With driver" : "Self-drive"],
              ctaLabel: "Reserve",
            }))}
          />
        </div>
      </section>

      {/* ── 9. Cruises, Boats & Ships ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="On the water"
            title="Cruises, boats & yacht charters"
            subtitle="Ocean cruises, river voyages, luxury liners, private yachts and island-hopping boat tours."
            linkHref="/cruises"
            linkLabel="Browse all cruises"
          />
          <ListingGrid
            items={cruises.map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.name,
              subtitle: `${c.type} · ${c.region}`,
              price: c.priceFrom,
              priceNote: c.nights > 0 ? `${c.nights} nights` : "Day charter",
              tags: c.highlights,
              ctaLabel: "View cruise",
            }))}
          />
        </div>
      </section>

      {/* ── 10. Local Tours & Attractions ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Experiences"
            title="Local tours & attraction tickets"
            subtitle="Private and group guided experiences led by verified local experts, plus skip-the-line attraction tickets worldwide."
            linkHref="/tours"
            linkLabel="Browse experiences"
          />
          <ListingGrid
            items={tours.map((t) => ({
              id: t.id,
              emoji: t.emoji,
              title: t.title,
              subtitle: `${t.city}, ${t.country} · ${t.duration}`,
              price: t.price,
              priceNote: "per person",
              rating: t.rating,
              reviews: t.reviews,
              tags: [`Guide: ${t.guide}`],
              ctaLabel: "Book tour",
            }))}
          />
        </div>
      </section>

      {/* ── 11. Verified Agents & Agencies ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Trusted marketplace"
            title="Verified experts & agencies"
            subtitle="Identity-checked visa agents, travel agencies, local tour guides and property hosts — with transparent reviews and rating scores."
            linkHref="/agents"
            linkLabel="View all experts"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(0, 2).map((a) => (
              <MarketplaceCard
                key={a.id}
                initials={a.initials}
                name={a.name}
                subtitle={a.title}
                rating={a.rating}
                reviews={a.reviews}
                verified={a.verified}
                tags={a.specialties}
                meta={`${a.cases.toLocaleString()} cases handled · ${a.responseTime}`}
              />
            ))}
            {agencies.slice(0, 2).map((a) => (
              <MarketplaceCard
                key={a.id}
                initials={a.initials}
                name={a.name}
                subtitle={`${a.city}, ${a.country}`}
                rating={a.rating}
                reviews={a.reviews}
                verified={a.verified}
                tags={a.services}
                meta={`${a.packages} active packages`}
                ctaLabel="View agency"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Destination Inspiration ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Inspiration"
            title="Luxury destinations worldwide"
            subtitle="Discover where travelers are heading next — from the Gulf to the Alps, from South Asian jewels to Southeast Asian paradise."
            linkHref="/destinations"
            linkLabel="All destinations"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.slice(0, 8).map((d) => (
              <Link
                key={d.city}
                href="/destinations"
                className="card card-hover group overflow-hidden"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-navy/10 to-blue/10 text-5xl transition-transform duration-300 group-hover:scale-105">
                  {d.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-navy">{d.city}</h3>
                  <p className="text-xs text-charcoal/50">{d.country}</p>
                  <p className="mt-1 text-xs text-charcoal/65 line-clamp-1">{d.tagline}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-blue">from {d.fromPrice}</p>
                    {d.visaRequired && (
                      <span className="text-[10px] text-charcoal/45">{d.visaRequired}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. Social Proof / Reviews ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Real travelers"
            title="Trusted by thousands of travelers"
            subtitle="Hear from travelers, visa applicants and explorers who've used Globe Travel Voyage."
            center
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((r) => (
              <div key={r.name} className="card flex flex-col p-6">
                <Stars rating={r.rating} className="mb-3" />
                <p className="flex-1 text-sm leading-relaxed text-charcoal/75">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-soft-200 pt-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                    {r.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">{r.name}</p>
                    <p className="text-xs text-charcoal/50">{r.location} · {r.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14. Account Types ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="For every role"
            title="One platform. Every account type."
            subtitle="Whether you're a traveler, visa agent, travel agency, tour guide, property host or administrator — there's a tailored dashboard for you."
            center
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <div key={r.slug} className={`card card-hover flex flex-col overflow-hidden`}>
                <div className={`bg-gradient-to-r ${r.color} p-6`}>
                  <span className="text-3xl">{r.emoji}</span>
                  <h3 className="mt-3 text-lg font-bold text-navy">{r.title}</h3>
                  <p className="mt-1 text-sm text-charcoal/65">{r.description}</p>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <ul className="flex-1 space-y-2">
                    {r.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-charcoal/70">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={r.href} className="btn-primary mt-5 w-full py-2.5 text-sm">
                    {r.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. Trust & Safety ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Trust & safety"
            title="Built on verification and transparency"
            subtitle="We combine world-class AI with verified human experts, and we're always clear about what we are — and aren't."
            center
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((t) => (
              <TrustBadge key={t.title} icon={t.icon} title={t.title} text={t.text} emoji={t.emoji} />
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <Disclaimer />
          </div>
        </div>
      </section>

      {/* ── 16. Referral Program ── */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Earn with us"
            title="Referral program & commissions"
            subtitle="Invite friends and partners. Earn commission credits when your referrals complete qualifying actions on the platform."
            linkHref="/referrals"
            linkLabel="Join the program"
            center
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {referralTiers.map((t) => (
              <div
                key={t.name}
                className={`card flex flex-col p-6 ${t.highlight ? "ring-2 ring-blue shadow-[var(--shadow-glow)]" : ""}`}
              >
                {t.highlight && (
                  <span className="mb-3 w-fit rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.badge}</span>
                  <div>
                    <h3 className="text-lg font-bold text-navy">{t.name}</h3>
                    <p className="text-sm text-charcoal/55">{t.referrals}</p>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-extrabold text-blue">{t.commission}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-charcoal/70">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/referrals" className={`mt-5 w-full py-2.5 text-sm ${t.highlight ? "btn-primary" : "btn-outline"}`}>
                  Join as {t.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 17. Travel Guides Teaser ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="Knowledge center"
            title="Expert travel guides"
            subtitle="Deep-dive guides on destinations, visa processes and travel routes — written with AI intelligence and verified by experts."
            linkHref="/guides"
            linkLabel="Browse all guides"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {travelGuides.slice(0, 3).map((g) => (
              <Link key={g.id} href="/guides" className="card card-hover flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="chip text-xs">{g.category}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-navy leading-snug">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm text-charcoal/65 line-clamp-2">{g.excerpt}</p>
                <p className="mt-4 text-xs text-charcoal/45">📖 {g.readTime} read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 18. CTA ── */}
      <CTASection />

      {/* ── 19. FAQ ── */}
      <section className="section bg-soft">
        <div className="container-px">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions, answered"
            subtitle="The most important things to know about how Globe Travel Voyage works."
            center
          />
          <FAQ items={faqs} />
        </div>
      </section>
    </>
  );
}
