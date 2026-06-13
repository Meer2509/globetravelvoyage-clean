import Link from "next/link";
import { PROVIDER_ONBOARDING_HEADLINE } from "@/lib/launch-trust";

const VARIANTS = {
  agents: {
    emoji: "👔",
    title: "Verified visa experts are joining now",
    subtitle:
      "Be among the first experts travelers discover. Complete onboarding and our team will review your profile before listing.",
    primary: { label: "Become a visa expert", href: "/onboarding/agent" },
    secondary: { label: "View requirements", href: "/pricing" },
  },
  agencies: {
    emoji: "🏢",
    title: "Premium travel agencies opening soon",
    subtitle:
      "List packages, tours, and visa support services. Early agencies receive priority verification and marketplace placement.",
    primary: { label: "Register your agency", href: "/register?role=agency" },
    secondary: { label: "Agency onboarding", href: "/onboarding/agency" },
  },
  properties: {
    emoji: "🏠",
    title: "Luxury stays and rentals launching",
    subtitle:
      "Property hosts are being verified now. List rentals, vacation stays, and monthly homes for travelers worldwide.",
    primary: { label: "Become a property host", href: "/register?role=host" },
    secondary: { label: "Post a listing", href: "/properties/post" },
  },
} as const;

export function PremiumMarketplaceEmpty({
  variant,
}: {
  variant: keyof typeof VARIANTS;
}) {
  const v = VARIANTS[variant];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-soft-200 bg-white text-center shadow-[var(--shadow-premium)]">
      <div className="h-1.5 w-full bg-hero-gradient" />
      <div className="px-6 py-16 sm:px-10 sm:py-20">
        <span className="text-5xl mb-5 block">{v.emoji}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-gold">{PROVIDER_ONBOARDING_HEADLINE}</p>
        <h2 className="mt-3 text-xl font-extrabold text-navy sm:text-2xl">{v.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted leading-relaxed">{v.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={v.primary.href} className="btn-primary px-6 py-3 text-sm">
            {v.primary.label}
          </Link>
          <Link href={v.secondary.href} className="btn-outline px-6 py-3 text-sm">
            {v.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
