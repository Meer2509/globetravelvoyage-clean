"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PersistentTravelAssistantChat } from "@/components/ai/PersistentTravelAssistantChat";
import {
  CONCIERGE_TOPICS,
  parseConciergeTopic,
  type ConciergeTopic,
} from "@/lib/v3/concierge-config";

const MARKETPLACE_LINKS = [
  { label: "Flights", href: "/flights" },
  { label: "Visa guides", href: "/visa" },
  { label: "Properties", href: "/properties" },
  { label: "Travel agents", href: "/travel-agents" },
  { label: "Group tours", href: "/tours" },
  { label: "Pricing", href: "/pricing" },
] as const;

export function ConciergeClient() {
  const searchParams = useSearchParams();
  const topic = parseConciergeTopic(searchParams.get("topic"));
  const config = CONCIERGE_TOPICS[topic];

  const initialMessage = useMemo(
    () => ({
      id: "welcome",
      role: "ai" as const,
      text: config.welcome,
      timestamp: new Date(),
    }),
    [config.welcome]
  );

  return (
    <div className="container-px py-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <TopicTabs active={topic} />
          <div className="mt-4">
            <PersistentTravelAssistantChat
              key={topic}
              suggestedPrompts={config.prompts}
              placeholder="Ask your concierge anything about travel…"
              disclaimer="AI responses are informational only. Not legal, immigration, or financial advice. No guarantees on visa approvals, prices, or availability."
              welcomeOverride={initialMessage}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/travel-agents"
              className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-gold/10 transition-colors"
            >
              Speak with a verified agent
            </Link>
            <Link
              href="/lead/contact"
              className="flex items-center gap-2 rounded-xl border border-soft-200 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal/70 hover:border-blue/30 hover:text-navy transition-colors"
            >
              Human support
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-1 font-extrabold text-navy">Marketplaces</h2>
            <p className="mb-4 text-xs text-charcoal/50">
              Your concierge connects you to verified providers
            </p>
            <div className="space-y-1">
              {MARKETPLACE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-charcoal/65 transition-colors hover:bg-soft hover:text-navy"
                >
                  {l.label}
                  <span className="text-blue/50">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-[11px] text-charcoal/55 leading-relaxed">
            <p className="font-semibold text-gold mb-1">Trust & disclaimer</p>
            Globe Travel Voyage is an independent marketplace — not a government agency,
            embassy, or immigration attorney. Verify all requirements with official sources.
          </div>
        </aside>
      </div>
    </div>
  );
}

function TopicTabs({ active }: { active: ConciergeTopic }) {
  const tabs: { topic: ConciergeTopic; label: string }[] = [
    { topic: "general", label: "All" },
    { topic: "trip", label: "Trips" },
    { topic: "visa", label: "Visas" },
    { topic: "flights", label: "Flights" },
    { topic: "documents", label: "Documents" },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-soft-200 bg-soft/50 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.topic}
          href={tab.topic === "general" ? "/concierge" : `/concierge?topic=${tab.topic}`}
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            active === tab.topic
              ? "bg-white text-navy shadow-sm"
              : "text-charcoal/55 hover:text-navy"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
