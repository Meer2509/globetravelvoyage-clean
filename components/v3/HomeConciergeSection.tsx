"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PersistentTravelAssistantChat } from "@/components/ai/PersistentTravelAssistantChat";
import { CONCIERGE_PATH, CONCIERGE_TOPICS } from "@/lib/v3/concierge-config";

export function HomeConciergeSection() {
  const config = CONCIERGE_TOPICS.general;

  return (
    <section className="section-dark bg-section-dark relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-blue/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" />

      <div className="container-px relative">
        <div className="mb-8 text-center lg:mb-10">
          <span className="eyebrow-gold mb-4 inline-flex items-center gap-2">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            AI Travel Concierge
          </span>
          <h2 className="h-section text-white">
            Start planning —{" "}
            <span className="text-gradient-gold">right here</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
            Ask about visas, budgets, itineraries or documents. Continue in the full concierge
            for saved history and expert handoff.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <PersistentTravelAssistantChat
            suggestedPrompts={config.prompts}
            placeholder="Where do you want to go? Tell me your budget, dates and travel style…"
            disclaimer="AI responses are informational only. Not legal, immigration, or financial advice."
          />
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href={CONCIERGE_PATH} className="btn-gold min-h-[48px] px-8 py-3 text-sm font-bold">
              Open full AI Concierge
            </Link>
            <Link
              href="/travel-agents"
              className="text-sm font-semibold text-white/60 transition-colors hover:text-gold"
            >
              Or speak with a verified agent →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
