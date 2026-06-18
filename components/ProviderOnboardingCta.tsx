import Link from "next/link";
import { PROVIDER_ONBOARDING_HEADLINE } from "@/lib/launch-trust";

const ROLES = [
  { label: "Visa expert", href: "/providers/visa-expert", emoji: "👔" },
  { label: "Travel agency", href: "/providers/travel-agent", emoji: "🏢" },
  { label: "Tour guide", href: "/providers/tour-organizer", emoji: "🧭" },
  { label: "Property host", href: "/providers/property-host", emoji: "🏠" },
] as const;

export function ProviderOnboardingCta({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-2xl border border-gold/25 bg-gold/5 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-navy text-sm">{PROVIDER_ONBOARDING_HEADLINE}</p>
          <p className="text-xs text-muted mt-0.5">List services, receive leads, and earn through Stripe Connect payouts.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/providers" className="btn-primary px-5 py-2.5 text-sm">
            Provider programs
          </Link>
          <Link href="/register?role=agent" className="btn-outline px-5 py-2.5 text-sm">
            Apply now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-hero-gradient shadow-[var(--shadow-premium)]">
      <div className="container-px py-10 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow-gold">Provider marketplace</span>
          <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
            {PROVIDER_ONBOARDING_HEADLINE}
          </h2>
          <p className="mt-3 text-sm text-white/65 leading-relaxed">
            Visa experts, agencies, guides, and property hosts can list services, receive verified leads, and receive payouts through Stripe Connect.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 text-left backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                <span className="text-2xl">{r.emoji}</span>
                <p className="mt-2 font-bold text-white text-sm">{r.label}</p>
                <p className="mt-1 text-xs text-white/50">Onboarding →</p>
              </Link>
            ))}
          </div>
          <Link href="/providers" className="btn-gold mt-8 inline-flex px-8 py-3 text-sm">
            View all provider programs
          </Link>
        </div>
      </div>
    </div>
  );
}
