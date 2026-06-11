"use client";

import { useState } from "react";
import Link from "next/link";

const TABS = [
  { key: "tours",   label: "Tours",    emoji: "🗺️", browseHref: "/tours" },
  { key: "hotels",  label: "Stays",    emoji: "🏨", browseHref: "/hotels" },
  { key: "agents",  label: "Experts",  emoji: "👔", browseHref: "/agents" },
  { key: "tickets", label: "Tickets",  emoji: "🎟️", browseHref: "/tickets" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tours");
  const active = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen bg-soft/30">
      <div className="bg-hero-gradient py-12">
        <div className="container-px">
          <Link href="/dashboard/customer" className="mb-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Dashboard
          </Link>
          <span className="eyebrow-white mb-3">Saved</span>
          <h1 className="text-3xl font-extrabold text-white">Your saved items</h1>
          <p className="mt-2 text-white/60 text-sm">Save tours, stays, experts, and tickets as you browse — they appear here when signed in.</p>
        </div>
      </div>

      <div className="container-px py-8">
        <div className="mb-6 flex gap-1 w-fit rounded-xl bg-white border border-soft-200 p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key ? "bg-navy text-white shadow-sm" : "text-charcoal/55 hover:text-navy"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-soft-200 bg-white py-20 text-center">
          <span className="text-5xl mb-4">{active.emoji}</span>
          <p className="font-bold text-navy text-lg">No saved {active.label.toLowerCase()} yet</p>
          <p className="mt-2 max-w-sm text-sm text-charcoal/50">
            Tap the heart on any listing while browsing to save it here. Your saved items sync when you are logged in.
          </p>
          <Link href={active.browseHref} className="btn-primary mt-6 px-6 py-2.5 text-sm">
            Browse {active.label.toLowerCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}
