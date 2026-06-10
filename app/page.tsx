import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { TrustBadge } from "@/components/TrustBadge";
import { CTASection } from "@/components/CTASection";
import { ListingGrid } from "@/components/ListingGrid";
import { FAQ } from "@/components/FAQ";
import { Icon } from "@/components/Icon";
import { Disclaimer } from "@/components/Disclaimer";
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
} from "@/lib/data";

export default function Home() {
  const featuredUsa = visas.find((v) => v.slug === "usa-b1-b2")!;

  return (
    <>
      {/* 1. Hero + AI global search bar */}
      <Hero />

      {/* Quick service grid */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Everything travel"
            title="One platform for your entire journey"
            subtitle="Search, plan, apply, book, compare and get help for almost every travel-related service — powered by AI and verified experts."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured USA Visa from Pakistan */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <div className="overflow-hidden rounded-3xl bg-navy text-white">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold">
                  <Icon name="star" className="h-4 w-4" /> Featured guidance
                </span>
                <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                  USA Visa from Pakistan 🇵🇰 → 🇺🇸
                </h2>
                <p className="mt-4 text-white/75">
                  Step-by-step AI guidance for the {featuredUsa.type}: DS-160,
                  consular fees, interview prep and a complete document checklist —
                  tailored for applicants from Pakistan.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/55">Processing</p>
                    <p className="text-sm font-semibold">3–12 weeks</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/55">Validity</p>
                    <p className="text-sm font-semibold">Up to 10 yrs</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-white/55">Fee from</p>
                    <p className="text-sm font-semibold">$185</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/visa/usa-from-pakistan" className="btn-gold px-6 py-3">
                    View USA from Pakistan guide
                  </Link>
                  <Link
                    href="/visa/usa"
                    className="btn border border-white/20 px-6 py-3 text-white hover:bg-white/10"
                  >
                    All USA visas
                  </Link>
                </div>
              </div>
              <div className="relative hidden items-center justify-center bg-gradient-to-br from-blue/20 to-gold/10 lg:flex">
                <div className="p-12 text-center">
                  <div className="text-[120px] leading-none">🛂</div>
                  <p className="mt-4 text-sm text-white/70">
                    Plus cheap PK → USA ticket routes from $760
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cheapest tickets Middle East → Pakistan, India, Philippines, Bangladesh */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Hot ticket routes"
            title="Cheapest tickets: Middle East → South & Southeast Asia"
            subtitle="Popular budget routes from the Gulf to Pakistan, India, the Philippines and Bangladesh. Sample prices — always confirm before booking."
            linkHref="/flights"
            linkLabel="See all flights"
          />
          <ListingGrid
            columns={4}
            items={cheapRoutes.map((r) => ({
              id: r.id,
              emoji: "✈️",
              title: `${r.from} → ${r.to}`,
              subtitle: `${r.fromCode} – ${r.toCode} · ${r.stops}`,
              price: r.priceFrom,
              priceNote: r.duration,
              badge: r.tag,
              tags: r.airlines,
              ctaLabel: "View deal",
            }))}
          />
          <div className="mt-6">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>

      {/* 4. AI trip planner by budget and travel days */}
      <section className="section bg-navy text-white">
        <div className="container-px">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold">
                <Icon name="sparkles" className="h-4 w-4" /> AI trip planner
              </span>
              <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                Tell us your budget & days. Get a full plan in seconds.
              </h2>
              <p className="mt-4 text-white/75">
                Our AI splits your budget across flights, stays, food, tours and
                transport, then drafts a day-by-day itinerary and flags the visa
                steps you'll need.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Budget breakdown by category",
                  "Day-by-day itinerary",
                  "Visa & document reminders",
                  "Verified providers for each step",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/80">
                    <Icon name="check" className="h-5 w-5 text-gold" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/trip-planner" className="btn-gold mt-8 px-7 py-3.5">
                Open the AI Trip Planner
              </Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-white/70">Destination</span>
                  <span className="font-semibold">Dubai 🇦🇪</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-white/70">Days</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-white/70">Budget</span>
                  <span className="font-semibold">$1,200</span>
                </div>
                <div className="rounded-xl bg-gold/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-gold">
                    AI suggestion
                  </p>
                  <p className="mt-1 text-white/85">
                    Flights $384 · Stay $336 · Food $192 · Tours $168 · ~$240/day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Visa marketplace */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Visa marketplace"
            title="AI visa guidance for every country"
            subtitle="Understand the right visa type, documents and steps — then connect with verified visa agents who prepare your application."
            linkHref="/visa"
            linkLabel="Open visa marketplace"
          />
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
                        ? "bg-blue/10 text-blue"
                        : v.difficulty === "Complex"
                        ? "bg-gold/15 text-navy"
                        : ""
                    }`}
                  >
                    {v.difficulty}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{v.type}</h3>
                <p className="text-sm text-navy/55">{v.country}</p>
                <p className="mt-2 flex-1 text-sm text-navy/60">{v.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-3 text-sm">
                  <span className="text-navy/55">From {v.feeFrom}</span>
                  <span className="font-semibold text-blue">Guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Hotels & apartment rentals */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Stays"
            title="Hotels & apartment rentals"
            subtitle="Hotels, serviced apartments, villas and long-stay rentals across the world."
            linkHref="/hotels"
            linkLabel="Browse all stays"
          />
          <ListingGrid
            items={stays.slice(0, 3).map((s) => ({
              id: s.id,
              emoji: s.emoji,
              title: s.name,
              subtitle: `${s.city}, ${s.country} · ${s.type}`,
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

      {/* 8. Car rentals */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Car rentals"
            title="Self-drive & chauffeur cars"
            subtitle="Economy to luxury, with or without a driver, in 90+ countries."
            linkHref="/car-rentals"
            linkLabel="Browse cars"
          />
          <ListingGrid
            items={cars.slice(0, 3).map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.model,
              subtitle: `${c.category} · ${c.city}`,
              price: c.pricePerDay,
              priceNote: "per day",
              tags: [
                `${c.seats} seats`,
                c.transmission,
                c.withDriver ? "With driver" : "Self-drive",
              ],
              ctaLabel: "Reserve",
            }))}
          />
        </div>
      </section>

      {/* 9. Cruises, boats, ships */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="On the water"
            title="Cruises, boats & ships"
            subtitle="Ocean cruises, river boats, ferries and private yacht charters."
            linkHref="/cruises"
            linkLabel="Browse cruises"
          />
          <ListingGrid
            items={cruises.slice(0, 3).map((c) => ({
              id: c.id,
              emoji: c.emoji,
              title: c.name,
              subtitle: `${c.type} · ${c.region}`,
              price: c.priceFrom,
              priceNote: c.nights > 0 ? `${c.nights} nights` : "Day charter",
              tags: c.highlights,
              ctaLabel: "View",
            }))}
          />
        </div>
      </section>

      {/* 10. Local tours & attractions */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Experiences"
            title="Local tours & attractions"
            subtitle="Guided experiences led by verified local guides, plus skip-the-line attraction tickets."
            linkHref="/tours"
            linkLabel="Browse tours"
          />
          <ListingGrid
            items={tours.slice(0, 3).map((t) => ({
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

      {/* 11. Verified agents & agencies */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Trust & expertise"
            title="Verified agents & agencies"
            subtitle="Work with identity-checked visa agents, travel agencies, tour guides and property hosts."
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
                meta={`${a.cases.toLocaleString()} cases handled`}
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

      {/* 12. Referral program */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Earn with us"
            title="Referral program & commissions"
            subtitle="Invite friends and partners. Earn commission credits when your referrals complete qualifying actions."
            linkHref="/referrals"
            linkLabel="Join referral program"
            center
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {referralTiers.map((t) => (
              <div
                key={t.name}
                className={`card flex flex-col p-6 ${
                  t.highlight ? "ring-2 ring-blue" : ""
                }`}
              >
                {t.highlight && (
                  <span className="mb-2 w-fit rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-navy">{t.name}</h3>
                <p className="text-sm text-navy/55">{t.referrals}</p>
                <p className="mt-3 text-2xl font-extrabold text-blue">
                  {t.commission}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-navy/70">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Trust & safety */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Trust & safety"
            title="Built on verification and transparency"
            subtitle="We combine AI guidance with verified human experts — and we're always clear about what we are and aren't."
            center
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((t) => (
              <TrustBadge key={t.title} icon={t.icon} title={t.title} text={t.text} />
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <Disclaimer />
          </div>
        </div>
      </section>

      {/* 14. Global destination cards */}
      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Inspiration"
            title="Global destinations"
            subtitle="Discover where travelers are heading next — from the Gulf to the West."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((d) => (
              <div
                key={d.city}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-navy/10 to-blue/10 text-5xl">
                  {d.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-navy">{d.city}</h3>
                  <p className="text-xs text-navy/50">{d.country}</p>
                  <p className="mt-1 text-sm text-navy/60">{d.tagline}</p>
                  <p className="mt-2 text-sm font-semibold text-blue">
                    Flights from {d.fromPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />

      {/* 15. FAQ */}
      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions, answered"
            subtitle="The important things to know about how Globe Travel Voyage works."
            center
          />
          <FAQ items={faqs} />
        </div>
      </section>
    </>
  );
}
