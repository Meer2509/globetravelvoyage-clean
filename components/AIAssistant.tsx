"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { getTravelAssistantReply, AiUnavailableError } from "@/lib/ai-api";
import { VISA_AI_DISCLAIMER } from "@/lib/ai-types";

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

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI travel assistant. Ask me about visas, flights, stays, tours or planning a trip by budget.",
    },
  ]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;

    setMsgs((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setLoading(true);

    try {
      const { text: reply } = await getTravelAssistantReply(value);
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch (err) {
      const message =
        err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sorry, I couldn't reach the AI service. Please try again.";
      setMsgs((m) => [...m, { role: "ai", text: message }]);
    } finally {
      setLoading(false);
    }
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
              <p className="text-xs text-white/60">Live AI travel guidance</p>
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
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-soft px-3.5 py-2.5 text-sm text-navy/50">
                  Thinking…
                </div>
              </div>
            )}
            {msgs.length === 1 && !loading && (
              <div className="space-y-2 pt-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
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
              void send(input);
            }}
            className="border-t border-soft-200 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about travel…"
                disabled={loading}
                className="flex-1 rounded-full border border-soft-200 bg-soft/60 px-4 py-2 text-sm focus:border-blue focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white disabled:opacity-50"
                aria-label="Send"
              >
                <Icon name="flight" className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-charcoal/40 text-center">
              {VISA_AI_DISCLAIMER}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
