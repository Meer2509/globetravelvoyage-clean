import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Stars } from "@/components/Stars";
import { SectionHeader } from "@/components/SectionHeader";
import { PROVIDER_ONBOARDING_HEADLINE } from "@/lib/launch-trust";
import { fetchMarketplaceExperts } from "@/lib/supabase/mvp-queries";
import { fetchMarketplaceAgencies } from "@/lib/supabase/mvp-queries";

export async function HomeMarketplaceSection() {
  const [experts, agencies] = await Promise.all([
    fetchMarketplaceExperts(),
    fetchMarketplaceAgencies(),
  ]);

  const providers = [
    ...experts.slice(0, 4).map((e) => {
      const name = e.full_name ?? e.email.split("@")[0];
      return {
        id: e.id,
        name,
        avatar: name.slice(0, 2).toUpperCase(),
        roleLabel: "Visa Expert",
        role: "visa-agent",
        verified: e.is_verified,
        rating: 0,
        reviews: 0,
        city: e.city ?? "—",
        country: e.country ?? "—",
        flag: "",
        specialization: (e.services ?? [])[0]?.replace(/^[^:]+:/, "").trim() ?? "Visa preparation",
        responseTime: "—",
        languages: ["English"],
        services: (e.services ?? []).slice(0, 2),
        priceFrom: "Request quote",
        featured: e.is_verified,
        href: "/agents",
      };
    }),
    ...agencies.slice(0, 2).map((a) => ({
      id: a.id,
      name: a.agency_name,
      avatar: a.agency_name.slice(0, 2).toUpperCase(),
      roleLabel: "Travel Agency",
      role: "agency",
      verified: a.is_verified,
      rating: a.rating ?? 0,
      reviews: a.review_count ?? 0,
      city: "—",
      country: a.registration_country ?? "—",
      flag: "",
      specialization: (a.services ?? [])[0] ?? "Travel packages",
      responseTime: "—",
      languages: ["English"],
      services: (a.services ?? []).slice(0, 2),
      priceFrom: "Request quote",
      featured: a.is_verified,
      href: "/agencies",
    })),
  ];

  const roleColors: Record<string, string> = {
    "visa-agent": "bg-blue/10 text-blue",
    agency: "bg-emerald-50 text-emerald-700",
    guide: "bg-purple-50 text-purple-700",
    host: "bg-amber-50 text-amber-700",
  };

  return (
    <section className="section">
      <div className="container-px">
        <SectionHeader
          eyebrow="Verified marketplace"
          title="Trusted visa experts, agencies & guides"
          subtitle="Verified visa experts and travel agencies ready to help with your journey."
          linkHref="/agents"
          linkLabel="See all providers"
        />

        {providers.length === 0 ? (
          <div className="rounded-3xl border border-soft-200 bg-white py-16 text-center shadow-[var(--shadow-premium)] overflow-hidden">
            <div className="h-1.5 w-full bg-hero-gradient" />
            <div className="px-6 pt-12">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">{PROVIDER_ONBOARDING_HEADLINE}</p>
              <p className="mt-3 font-bold text-navy text-lg">{PROVIDER_ONBOARDING_HEADLINE}</p>
              <p className="mt-2 max-w-md mx-auto text-sm text-muted">
                Our admin team reviews every provider profile before it goes live. Join the marketplace as a verified expert or agency.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 pb-12">
                <Link href="/register?role=agent" className="btn-primary px-5 py-2.5 text-sm">Become a visa expert</Link>
                <Link href="/register?role=agency" className="btn-outline px-5 py-2.5 text-sm">Register your agency</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <div key={p.id} className="card card-hover p-5 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-navy text-xl font-extrabold text-gold">
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
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">Verified</span>
                      )}
                    </div>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${roleColors[p.role] ?? "bg-soft text-charcoal"}`}>
                      {p.roleLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {p.reviews > 0 ? (
                    <>
                      <Stars rating={Math.round(p.rating)} />
                      <span className="text-sm font-bold text-navy">{p.rating}</span>
                      <span className="text-xs text-charcoal/45">({p.reviews} reviews)</span>
                    </>
                  ) : (
                    <span className="text-xs text-charcoal/50">Verified reviews from completed trips</span>
                  )}
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Icon name="globe" className="h-3.5 w-3.5 text-charcoal/40" />
                    <span className="text-charcoal/60">{p.city}, {p.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="sparkles" className="h-3.5 w-3.5 text-charcoal/40" />
                    <span className="text-charcoal/60">{p.specialization}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-soft-200 pt-4">
                  <div>
                    <p className="text-[10px] text-charcoal/40">Starting from</p>
                    <p className="text-base font-extrabold text-navy">{p.priceFrom}</p>
                  </div>
                  <Link href={p.href} className="btn-blue px-4 py-2 text-xs">
                    Connect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
  );
}
