"use client";

const TRUST_BADGES = [
  "Secure account",
  "Encrypted payments",
  "Expert-reviewed support",
] as const;

export function CustomerDashboardHero({ firstName }: { firstName: string }) {
  const greeting = firstName.trim() || "Traveler";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-hero-gradient shadow-[var(--shadow-premium)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.12),transparent_55%)]" />
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <p className="eyebrow-gold mb-3">Your travel command center</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Welcome back, {greeting}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Manage your trips, visa cases, bookings and travel plans in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
          {TRUST_BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white/90 sm:text-sm"
            >
              <span className="text-gold" aria-hidden>
                ✓
              </span>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
