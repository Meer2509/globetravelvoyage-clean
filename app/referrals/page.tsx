import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { CTASection } from "@/components/CTASection";
import { Icon } from "@/components/Icon";
import { referralTiers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Referral Program & Commissions",
  description:
    "Invite friends and partners to Globe Travel Voyage and earn commission credits on qualifying actions. Terms apply.",
};

const steps = [
  { title: "Share your link", text: "Get a unique referral link from your dashboard.", icon: "referral" as const },
  { title: "Friends sign up", text: "They join and complete a qualifying action.", icon: "users" as const },
  { title: "You earn", text: "Commission credits are added to your balance.", icon: "star" as const },
];

export default function ReferralsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Earn with us"
        title="Referral program & commissions"
        subtitle="Invite travelers, agents, agencies and hosts. Earn commission credits when your referrals complete qualifying actions."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Referrals" }]}
      />

      <section className="section">
        <div className="container-px">
          <SectionHeader eyebrow="How it works" title="Earn in 3 simple steps" center />
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue/10 text-blue">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">
                  {i + 1}. {s.title}
                </h3>
                <p className="mt-2 text-sm text-navy/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-soft/50">
        <div className="container-px">
          <SectionHeader eyebrow="Tiers" title="The more you refer, the more you earn" center />
          <div className="grid gap-5 lg:grid-cols-3">
            {referralTiers.map((t) => (
              <div
                key={t.name}
                className={`card flex flex-col p-6 ${t.highlight ? "ring-2 ring-blue" : ""}`}
              >
                {t.highlight && (
                  <span className="mb-2 w-fit rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-navy">{t.name}</h3>
                <p className="text-sm text-navy/55">{t.referrals}</p>
                <p className="mt-3 text-2xl font-extrabold text-blue">{t.commission}</p>
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
          <div className="mx-auto mt-8 max-w-4xl">
            <Disclaimer>
              Referral commissions are credits subject to full program terms,
              verification and minimum payout thresholds. Rates shown are
              illustrative and may change. This is not investment or income advice.
            </Disclaimer>
          </div>
        </div>
      </section>

      <CTASection
        title="Start earning referral commissions"
        subtitle="Create a free account to get your referral link and track your earnings in real time."
        primary={{ label: "Get my referral link", href: "/register" }}
        secondary={{ label: "Open dashboard", href: "/dashboard/customer" }}
      />
    </>
  );
}
