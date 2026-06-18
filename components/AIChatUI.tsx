"use client";

import { useEffect, useRef, useState } from "react";
import type { AiMessage, AiCard } from "@/lib/ai-types";
import type { ConciergeAction, ConciergeHandoffTopic } from "@/lib/v3/concierge-intent";
import { buildConversationSummary } from "@/lib/v3/concierge-intent";
import { ConciergeActionButtons } from "@/components/v3/ConciergeActionButtons";
import { ConciergeHandoffForm } from "@/components/v3/ConciergeHandoffForm";
import { uid } from "@/lib/ai-types";
import { AiUnavailableError } from "@/lib/ai-api";

// ── Typing indicator ──────────────────────────────────────────────────────────

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-blue/50 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

// ── Card renderer ─────────────────────────────────────────────────────────────

const CARD_COLORS = {
  blue:  { bg: "bg-blue/5  border-blue/20",  title: "text-blue",        accent: "text-blue"  },
  gold:  { bg: "bg-gold/5  border-gold/20",  title: "text-gold",        accent: "text-gold"  },
  red:   { bg: "bg-red-50  border-red-200",  title: "text-red-700",     accent: "text-red-600" },
  green: { bg: "bg-emerald-50 border-emerald-200", title: "text-emerald-700", accent: "text-emerald-600" },
  navy:  { bg: "bg-navy/4  border-navy/12",  title: "text-navy",        accent: "text-navy"  },
};

function AiCardBlock({ card }: { card: AiCard }) {
  const c = CARD_COLORS[card.color ?? "navy"];

  if (card.type === "checklist" || card.type === "itinerary") {
    return (
      <div className={`mt-2 rounded-xl border p-3.5 ${c.bg}`}>
        <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${c.title}`}>{card.title}</p>
        <ul className="space-y-1.5">
          {(card.items ?? []).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-charcoal/70">
              <span className={`mt-0.5 shrink-0 text-sm ${c.accent}`}>
                {card.type === "itinerary" ? `${i + 1}.` : "✓"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (card.type === "warning") {
    return (
      <div className={`mt-2 rounded-xl border p-3.5 ${c.bg}`}>
        <div className="flex items-start gap-2">
          <span className="text-base">⚠️</span>
          <div>
            <p className={`text-xs font-bold ${c.title}`}>{card.title}</p>
            {card.value && <p className="mt-0.5 text-xs text-charcoal/60 leading-relaxed">{card.value}</p>}
            {card.items && (
              <ul className="mt-1.5 space-y-1">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-charcoal/60">
                    <span className="text-red-500">•</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (card.type === "risk" && card.score !== undefined) {
    const color = card.score >= 70 ? "bg-emerald-500" : card.score >= 50 ? "bg-gold" : "bg-red-500";
    const label = card.score >= 70 ? "Good"        : card.score >= 50 ? "Moderate" : "Challenging";
    return (
      <div className={`mt-2 rounded-xl border p-3.5 ${c.bg}`}>
        <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${c.title}`}>{card.title}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-soft-200">
            <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${card.score}%` }} />
          </div>
          <span className={`text-sm font-bold ${c.accent}`}>{card.score}%</span>
          <span className={`text-xs font-semibold ${c.accent}`}>{label}</span>
        </div>
        {card.subtext && <p className="mt-2 text-[11px] text-charcoal/50 leading-relaxed">{card.subtext}</p>}
      </div>
    );
  }

  if (card.type === "flight") {
    return (
      <div className={`mt-2 rounded-xl border p-3.5 ${c.bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-xs font-bold ${c.title}`}>{card.title}</p>
            {card.subtext && <p className="mt-0.5 text-[11px] text-charcoal/50">{card.subtext}</p>}
          </div>
          {card.value && <span className={`text-sm font-extrabold ${c.accent} shrink-0`}>{card.value}</span>}
        </div>
      </div>
    );
  }

  // Default: info / tip
  return (
    <div className={`mt-2 rounded-xl border p-3.5 ${c.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className={`text-xs font-bold ${c.title}`}>{card.title}</p>
          {card.subtext && <p className="mt-0.5 text-[11px] text-charcoal/55">{card.subtext}</p>}
          {card.items && (
            <ul className="mt-2 space-y-1">
              {card.items.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-charcoal/60">
                  <span className={c.accent}>→</span>{item}
                </li>
              ))}
            </ul>
          )}
        </div>
        {card.value && !card.items && (
          <span className={`shrink-0 text-sm font-extrabold ${c.accent}`}>{card.value}</span>
        )}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onHandoff,
}: {
  msg: AiMessage;
  onHandoff: (action: ConciergeAction) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
        isUser ? "bg-navy text-white" : "bg-gradient-to-br from-blue to-navy text-white"
      }`}>
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-navy text-white"
            : "rounded-tl-sm bg-white border border-soft-200 text-charcoal shadow-[var(--shadow-card)]"
        }`}>
          {/* Render **bold** and newlines in text */}
          {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
        </div>

        {/* Cards (AI only) */}
        {!isUser && msg.cards && msg.cards.length > 0 && (
          <div className="w-full space-y-1">
            {msg.cards.map((card, i) => (
              <AiCardBlock key={i} card={card} />
            ))}
          </div>
        )}

        {!isUser && msg.actions && msg.actions.length > 0 && (
          <ConciergeActionButtons actions={msg.actions} onHandoff={onHandoff} />
        )}

        <span className="text-[10px] text-charcoal/30">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ── Chat input ────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
}

function ChatInput({ onSend, loading, placeholder = "Ask anything about travel, visas, flights…" }: ChatInputProps) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const t = input.trim();
    if (!t || loading) return;
    onSend(t);
    setInput("");
    if (ref.current) ref.current.style.height = "auto";
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function autoResize() {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 120)}px`;
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-soft-200 bg-white p-3 shadow-[var(--shadow-card)]">
      <textarea
        ref={ref}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-navy placeholder-charcoal/35 outline-none leading-relaxed"
        placeholder={loading ? "AI is thinking…" : placeholder}
        value={input}
        onChange={(e) => { setInput(e.target.value); autoResize(); }}
        onKeyDown={handleKey}
        disabled={loading}
      />
      <button
        onClick={submit}
        disabled={!input.trim() || loading}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white transition-all hover:bg-navy-800 disabled:opacity-35"
        aria-label="Send"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Suggested prompts ─────────────────────────────────────────────────────────

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (p: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({ prompts, onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          disabled={disabled}
          className="rounded-full border border-blue/20 bg-blue/5 px-3 py-1.5 text-xs font-medium text-blue transition-colors hover:bg-blue hover:text-white disabled:opacity-40"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Main AIChatUI component ───────────────────────────────────────────────────

export interface AIChatUIProps {
  initialMessages?: AiMessage[];
  suggestedPrompts?: string[];
  onUserMessage: (text: string) => Promise<{ text: string; cards?: AiCard[]; actions?: ConciergeAction[] }>;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  disclaimer?: string;
}

export function AIChatUI({
  initialMessages = [],
  suggestedPrompts = [],
  onUserMessage,
  placeholder,
  className = "",
  maxHeight = "480px",
  disclaimer,
}: AIChatUIProps) {
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);
  const [loading, setLoading]   = useState(false);
  const [handoffTopic, setHandoffTopic] = useState<ConciergeHandoffTopic | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const userMsg: AiMessage = { id: uid(), role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await onUserMessage(text);
      const aiMsg: AiMessage = {
        id: uid(),
        role: "ai",
        text: result.text,
        cards: result.cards,
        actions: result.actions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: AiMessage = {
        id: uid(), role: "ai",
        text: err instanceof AiUnavailableError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sorry, I encountered an issue. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const showPrompts = suggestedPrompts.length > 0 && messages.length <= 1;
  const conversationSummary = buildConversationSummary(messages);

  function openHandoff(action: ConciergeAction) {
    if (action.handoffTopic) setHandoffTopic(action.handoffTopic);
  }

  return (
    <>
    <div className={`flex flex-col rounded-2xl border border-soft-200 bg-soft overflow-hidden ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onHandoff={openHandoff} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue to-navy text-white text-sm">
              🤖
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white border border-soft-200 shadow-[var(--shadow-card)]">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {showPrompts && (
        <div className="border-t border-soft-200 bg-white/50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal/35">Try asking</p>
          <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleSend} disabled={loading} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-soft-200 bg-white p-3">
        <ChatInput onSend={handleSend} loading={loading} placeholder={placeholder} />
        {disclaimer && (
          <p className="mt-2 text-[10px] text-charcoal/35 leading-relaxed text-center">{disclaimer}</p>
        )}
      </div>
    </div>

    <ConciergeHandoffForm
      open={handoffTopic !== null}
      onClose={() => setHandoffTopic(null)}
      topic={handoffTopic ?? "trip_planning"}
      conversationSummary={conversationSummary}
    />
    </>
  );
}
