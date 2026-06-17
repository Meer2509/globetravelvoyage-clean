"use client";

import { useState } from "react";
import Link from "next/link";
import { PersistentTravelAssistantChat } from "@/components/ai/PersistentTravelAssistantChat";

const PROMPTS = [
  "Which visa do I need for the USA from Pakistan?",
  "Plan 5 days in Dubai for $2,000",
  "Cheapest flight Dubai to London in July",
  "Documents needed for a Schengen visa",
  "Best time to visit Turkey?",
  "Plan a family trip to Istanbul for 7 days",
  "UK visitor visa checklist",
  "Budget Bangkok trip for 10 days",
];

const AI_SERVICES = [
  { href: "/ai-visa-assistant",   emoji: "🛂", title: "Visa Assistant",     desc: "Nationality → destination → document checklist + risk analysis"  },
  { href: "/ai-trip-planner",     emoji: "🗺️", title: "Trip Planner",       desc: "Budget, days, style → full itinerary + hotel & tour picks"        },
  { href: "/ai-flight-finder",    emoji: "✈️", title: "Flight Finder",      desc: "From/to/dates → cheapest routes + flexible date comparison"       },
  { href: "/ai-document-checker", emoji: "📋", title: "Document Checker",   desc: "Checklist + readiness score for visa documents"  },
];

export default function AITravelAssistantPage() {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    const text = `Globe Travel Voyage — AI Travel Checklist

1. Check visa requirements for your destination
2. Book flights and accommodation
3. Purchase travel insurance
4. Check passport validity (6+ months)
5. Get required vaccinations
6. Notify your bank of travel plans
7. Make copies of important documents

Disclaimer: For guidance only. Verify all requirements with official sources.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "globe-travel-checklist.txt"; a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }

  return (
    <div className="min-h-screen bg-soft">
      {/* ── Header ── */}
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Home
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-2xl">🤖</span>
                <span className="eyebrow-white">AI-powered</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                AI Travel Assistant
              </h1>
              <p className="mt-2 max-w-xl text-white/60 text-sm leading-relaxed">
                Your intelligent travel concierge — visa guidance, trip planning, flight tips, document checklists and more. Powered by AI.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs text-white/60">
                AI Travel Assistant
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-px py-8">
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* ── Chat panel ── */}
          <div>
            <PersistentTravelAssistantChat
              suggestedPrompts={PROMPTS}
              placeholder="Ask about visas, flights, hotels, trip planning…"
              disclaimer="AI responses are informational only. Not legal, immigration, or financial advice. No guarantees on visa approvals, prices, or availability."
            />

            {/* ── Action bar ── */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${downloaded ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-soft-200 bg-white text-charcoal/60 hover:border-blue/30 hover:text-navy"}`}
              >
                {downloaded ? "✓ Downloaded!" : "📥 Download checklist"}
              </button>
              <Link
                href="/lead/contact"
                className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-semibold text-navy hover:bg-gold/10 transition-colors"
              >
                👔 Contact a verified expert
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="mb-1 font-extrabold text-navy">Specialised AI tools</h2>
              <p className="mb-4 text-xs text-charcoal/50">Use dedicated tools for deeper guidance</p>
              <div className="space-y-3">
                {AI_SERVICES.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex items-start gap-3 rounded-xl border border-soft-200 bg-soft p-3 transition-all hover:border-blue/30 hover:bg-blue/3 hover:shadow-[var(--shadow-card)] group"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-xl group-hover:bg-blue/10 transition-colors">
                      {s.emoji}
                    </span>
                    <div>
                      <p className="font-bold text-navy text-sm group-hover:text-blue transition-colors">{s.title}</p>
                      <p className="text-[11px] text-charcoal/50 leading-relaxed">{s.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-navy text-sm">Quick links</h3>
              <div className="space-y-2">
                {[
                  { label: "Visa marketplace", href: "/visa"         },
                  { label: "Flight search",    href: "/flights"       },
                  { label: "Hotels & stays",   href: "/hotels"        },
                  { label: "Tour guides",      href: "/tours"         },
                  { label: "Pricing",          href: "/pricing"       },
                  { label: "Verified experts", href: "/agents"        },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between text-sm text-charcoal/60 hover:text-navy transition-colors py-1 border-b border-soft-200 last:border-0">
                    {l.label}
                    <span className="text-blue/50">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-[11px] text-charcoal/50 leading-relaxed">
              <p className="font-semibold text-gold mb-1">⚠ Important disclaimer</p>
              Globe Travel Voyage is not a government agency, embassy, or immigration attorney. All AI responses are informational only. No visa approval, travel outcome or financial outcome is guaranteed. Always verify requirements with official sources.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
