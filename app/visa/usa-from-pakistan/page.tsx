import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { ListingGrid } from "@/components/ListingGrid";
import { Icon } from "@/components/Icon";
import { visas, usaRoutes } from "@/lib/data";

export const metadata: Metadata = {
  title: "USA Visa & Tickets from Pakistan — Step-by-Step Guide",
  description:
    "Featured guidance for applying for a US visa from Pakistan, plus cheapest PK → USA ticket routes. Independent marketplace — no approval or price guarantee.",
};

const b1b2 = visas.find((v) => v.slug === "usa-b1-b2")!;
const f1 = visas.find((v) => v.slug === "usa-f1-student")!;

const journey = [
  { title: "Pick your visa type", text: "B1/B2 for tourism/business or F-1 for study. Use the AI wizard if unsure." },
  { title: "Complete DS-160", text: "Fill the online form carefully and save the confirmation page." },
  { title: "Pay fees", text: "Consular fee ($185) and, for students, the SEVIS fee." },
  { title: "Book biometrics & interview", text: "Schedule at the US Embassy Islamabad or Consulate Karachi." },
  { title: "Prepare documents & funds", text: "Bank statements, ties to Pakistan, employment/study proof." },
  { title: "Attend the interview", text: "Be honest and concise. Then track your passport return." },
];

export default function UsaFromPakistanPage() {
  return (
    <>
      <PageHeader
        eyebrow="🇵🇰 → 🇺🇸 Featured"
        title="USA visa & tickets from Pakistan"
        subtitle="A focused, step-by-step path for applicants in Pakistan — from choosing the right visa to booking the cheapest route to the USA. Independent guidance; no approval or price guarantee."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Visa", href: "/visa" },
          { label: "USA from Pakistan" },
        ]}
      />

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="The journey" title="Your 6-step path to the USA" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((j, i) => (
              <div key={j.title} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-navy">{j.title}</h3>
                <p className="mt-1 text-sm text-navy/60">{j.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader
            eyebrow="Choose your visa"
            title="Most common US visas from Pakistan"
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {[b1b2, f1].map((v) => (
              <div key={v.slug} className="card p-6">
                <h3 className="text-xl font-bold text-navy">{v.type}</h3>
                <p className="mt-2 text-sm text-navy/60">{v.summary}</p>
                <ul className="mt-4 space-y-1.5">
                  {v.documents.slice(0, 5).map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-navy/70">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link href={`/visa/${v.slug}`} className="btn-primary mt-5 w-fit px-5 py-2.5">
                  Full checklist
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-px">
          <SectionHeader
            eyebrow="Cheapest routes"
            title="Pakistan → USA ticket routes"
            subtitle="Sample fares from major Pakistani cities to the USA. Prices are estimates and change frequently — confirm before booking."
            linkHref="/flights"
            linkLabel="Search all flights"
          />
          <ListingGrid
            columns={3}
            items={usaRoutes.map((r) => ({
              id: r.id,
              emoji: "✈️",
              title: `${r.from} → ${r.to}`,
              subtitle: `${r.fromCode} – ${r.toCode} · ${r.stops}`,
              price: r.priceFrom,
              priceNote: r.duration,
              badge: r.tag,
              tags: r.airlines,
              ctaLabel: "View route",
            }))}
          />
          <div className="mt-8">
            <Disclaimer>
              Prices and visa information are for guidance only. Globe Travel Voyage
              is not an airline, embassy, the US government or an immigration lawyer.
              We do not guarantee ticket prices or visa approval.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to start your USA application from Pakistan?"
        subtitle="Connect with a verified visa agent in Pakistan, or track your application in your free traveler dashboard."
        primary={{ label: "Find a Pakistan-based agent", href: "/agents" }}
        secondary={{ label: "Create traveler account", href: "/register" }}
      />
    </>
  );
}
