"use client";

import { useState } from "react";
import { Icon } from "./Icon";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const quickPrompts = [
  "Which visa do I need for the USA?",
  "Cheapest flight Dubai → Manila",
  "Plan 5 days in Dubai under $1200",
  "Documents for a UK visitor visa",
];

function reply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("visa") && q.includes("usa"))
    return "For the USA, most travelers use the B1/B2 visitor visa (tourism/business) or the F-1 student visa. You'll need a valid passport, DS-160, fee receipt and proof of ties. I can open the full guide and connect you with a verified agent. Note: no one can guarantee approval.";
  if (q.includes("visa"))
    return "Tell me your nationality, destination and purpose, and I'll suggest the right visa type plus a document checklist. Try the Visa Wizard on the Visa page. This is guidance only — not legal advice.";
  if (q.includes("flight") || q.includes("cheap"))
    return "I can compare popular routes — for example, Dubai → Manila from $320 direct, or Abu Dhabi → Delhi from $150. These are planning figures only; request a verified quote for confirmed fares.";
  if (q.includes("plan") || q.includes("budget") || q.includes("days"))
    return "Great — head to the AI Trip Planner. Enter destination, days and budget, and I'll split your budget across flights, stay, food and tours, then draft a day-by-day itinerary.";
  if (q.includes("hotel") || q.includes("stay"))
    return "I can suggest hotels, apartments and long-stay rentals. For Dubai, the Burj Vista Residences from $180/night is popular. Open Hotels & Stays to filter by area and price.";
  return "I can help with visas, flights, hotels, cars, cruises, tours, properties and full trip planning. What would you like to do? Informational guidance only — provider confirmation required for quotes.";
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI travel assistant. Ask me about visas, flights, stays, tours or planning a trip by budget.",
    },
  ]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMsgs((m) => [...m, { role: "user", text: value }, { role: "ai", text: reply(value) }]);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold shadow-[var(--shadow-premium)] transition-transform hover:scale-105"
      >
        <Icon name={open ? "check" : "sparkles"} className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-soft-200 bg-white shadow-[var(--shadow-premium)]">
          <div className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold">
              <Icon name="sparkles" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">AI Travel Assistant</p>
              <p className="text-xs text-white/60">AI travel guidance</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-blue text-white"
                      : "bg-soft text-navy/80"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="space-y-2 pt-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="block w-full rounded-xl border border-soft-200 px-3 py-2 text-left text-xs font-medium text-navy/70 hover:border-blue hover:text-navy"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-soft-200 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about travel…"
              className="flex-1 rounded-full border border-soft-200 bg-soft/60 px-4 py-2 text-sm focus:border-blue focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white"
              aria-label="Send"
            >
              <Icon name="flight" className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
