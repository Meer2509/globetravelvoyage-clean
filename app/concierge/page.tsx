import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConciergeClient } from "./ConciergeClient";

export const metadata: Metadata = {
  title: "AI Travel Concierge",
  description:
    "Your unified AI travel concierge — visas, trip planning, flights, documents and verified experts in one premium conversation.",
};

export default function ConciergePage() {
  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-hero-gradient py-12 sm:py-14">
        <div className="container-px">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            ← Home
          </Link>
          <div className="max-w-2xl">
            <span className="eyebrow-white">Globe Travel Voyage V3</span>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              AI Travel Concierge
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
              One intelligent conversation for your entire journey — planning, visas,
              routes, documents and handoff to verified agents when you need a human.
            </p>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="container-px py-12 text-center text-sm text-charcoal/50">
            Loading concierge…
          </div>
        }
      >
        <ConciergeClient />
      </Suspense>
    </div>
  );
}
