"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ProviderLandingConfig } from "@/lib/provider-acquisition/types";
import { trackProviderLandingView } from "@/lib/provider-acquisition/track-landing";

export function ProviderLandingPage({ config }: { config: ProviderLandingConfig }) {
  const registerHref = `/register?role=${config.registerParam}`;

  useEffect(() => {
    trackProviderLandingView(config.slug, config.role);
  }, [config.slug, config.role]);

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-16 sm:py-20">
        <div className="container-px">
          <Link href="/providers" className="mb-4 inline-flex text-xs text-white/50 hover:text-white/80">
            ← All provider programs
          </Link>
          <span className="eyebrow-white mb-3">{config.eyebrow}</span>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{config.emoji}</span>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{config.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">{config.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={registerHref} className="btn-gold px-8 py-3 text-sm">
                  Get started free →
                </Link>
                <Link href="/referrals" className="btn-outline border-white/30 bg-white/10 px-6 py-3 text-sm text-white hover:bg-white/15">
                  Refer a provider
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-12 space-y-12">
        <section>
          <h2 className="text-xl font-extrabold text-navy">Why join</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.benefits.map((b) => (
              <div key={b.title} className="card p-5">
                <span className="text-2xl">{b.icon}</span>
                <p className="mt-2 font-bold text-navy text-sm">{b.title}</p>
                <p className="mt-1 text-xs text-charcoal/55 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-navy">How it works</h2>
          <ol className="mt-6 space-y-4">
            {config.steps.map((step, i) => (
              <li key={step.title} className="card flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-extrabold text-gold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-navy">{step.title}</p>
                  <p className="mt-1 text-sm text-charcoal/55">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-extrabold text-navy">Requirements</h2>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/65">
              {config.requirements.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-gold">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-extrabold text-navy">FAQ</h2>
            <dl className="mt-4 space-y-4">
              {config.faq.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-bold text-navy">{item.q}</dt>
                  <dd className="mt-1 text-sm text-charcoal/55">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="rounded-3xl bg-hero-gradient p-8 text-center sm:p-10">
          <h2 className="text-2xl font-extrabold text-white">Ready to join the marketplace?</h2>
          <p className="mt-2 text-sm text-white/60">Free to apply · Admin verification · Stripe Connect payouts</p>
          <Link href={registerHref} className="btn-gold mt-6 inline-flex px-10 py-3 text-sm">
            Apply now →
          </Link>
        </div>
      </div>
    </div>
  );
}
