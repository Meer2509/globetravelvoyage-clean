"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CONCIERGE_PATH } from "@/lib/v3/concierge-config";
import type { ReactNode } from "react";

const QUICK_PROMPTS = [
  { label: "Plan a trip", href: `${CONCIERGE_PATH}?topic=trip` },
  { label: "Visa checklist", href: `${CONCIERGE_PATH}?topic=visa` },
  { label: "Flight routes", href: `${CONCIERGE_PATH}?topic=flights` },
  { label: "Find an agent", href: "/travel-agents" },
] as const;

export function V3HomeHero({ statsBar }: { statsBar?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      <div className="pointer-events-none absolute -left-48 -top-24 h-[600px] w-[600px] rounded-full bg-blue/25 blur-[120px] opacity-60" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-[450px] w-[450px] rounded-full bg-gold/15 blur-[100px] opacity-50" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-px relative py-14 sm:py-18 lg:py-22">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI-first travel marketplace
          </span>

          <h1 className="mt-6 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Plan your entire journey with{" "}
            <span className="text-gradient-gold">one AI concierge</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
            Visas, itineraries, flights and verified experts — luxury travel planning
            in a single trusted conversation. No fragmented tools.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              href={CONCIERGE_PATH}
              className="btn-gold flex min-h-[52px] items-center justify-center gap-2 px-8 py-3.5 text-base font-bold shadow-[0_12px_40px_-8px_rgba(201,162,39,0.55)]"
            >
              <Icon name="sparkles" className="h-5 w-5" />
              Start AI Concierge
            </Link>
            <Link
              href="#marketplaces"
              className="btn flex min-h-[52px] items-center justify-center gap-2 border border-white/25 bg-white/10 px-8 py-3.5 text-base text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              Explore marketplaces
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-gold/35 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="mt-6 text-[11px] leading-relaxed text-white/40">
            Independent marketplace — not a government or immigration authority.
            AI guidance is informational only.
          </p>
        </div>

        {statsBar && <div className="mt-12">{statsBar}</div>}
      </div>
    </section>
  );
}
