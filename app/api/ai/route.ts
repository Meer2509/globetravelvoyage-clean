import { NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIpFromRequest,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { getSessionUserId } from "@/lib/auth-server";
import { trackGrowthEvent } from "@/lib/growth/track-event";
import { completeOnboardingStep } from "@/lib/growth/onboarding-checklist";

const SYSTEM_PROMPT = `You are Globe Travel Voyage's premium AI travel concierge. Provide helpful, structured travel guidance including visas, itineraries, budgets, and hotel suggestions. Always include a brief disclaimer that you are not a government agency and visa approval is never guaranteed. Be concise, professional, and luxury-branded in tone. Use markdown sparingly for emphasis.`;

const JSON_SYSTEM_PROMPT = `${SYSTEM_PROMPT} When asked for JSON, respond with valid JSON only — no markdown fences or commentary outside the JSON object.`;

const MAX_PROMPT_CHARS = 8000;

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const ip = getClientIpFromRequest(request);
  const rateKey = userId ? `user:${userId}` : `ip:${ip}`;
  const limited = await checkRateLimit("ai", rateKey);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "AI_UNAVAILABLE",
        message:
          "AI assistance is temporarily unavailable because OPENAI_API_KEY is not configured on this server.",
      },
      { status: 503 }
    );
  }

  let body: {
    prompt?: string;
    json?: boolean;
    messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userContent = body.prompt?.trim() ?? body.messages?.filter((m) => m.role === "user").at(-1)?.content?.trim();
  if (!userContent) {
    return NextResponse.json({ error: "prompt or messages required." }, { status: 400 });
  }

  if (userContent.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `Prompt must be ${MAX_PROMPT_CHARS} characters or fewer.` },
      { status: 400 }
    );
  }

  const useJson = Boolean(body.json);
  const messages = body.messages?.length
    ? [{ role: "system" as const, content: useJson ? JSON_SYSTEM_PROMPT : SYSTEM_PROMPT }, ...body.messages]
    : [
        { role: "system" as const, content: useJson ? JSON_SYSTEM_PROMPT : SYSTEM_PROMPT },
        { role: "user" as const, content: userContent },
      ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        ...(useJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[api/ai] OpenAI error:", errText.slice(0, 300));
      return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Empty response from AI service." }, { status: 502 });
    }

    trackGrowthEvent({
      eventType: "concierge_usage",
      userId,
      metadata: { prompt_chars: userContent.length, json: useJson },
    });
    if (userId) {
      completeOnboardingStep("try_concierge");
    }

    return NextResponse.json({ text, source: "openai" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    console.error("[api/ai]", message);
    return NextResponse.json({ error: "AI request failed." }, { status: 500 });
  }
}
