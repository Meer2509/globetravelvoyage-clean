import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Globe Travel Voyage's premium AI travel concierge. Provide helpful, structured travel guidance including visas, itineraries, budgets, and hotel suggestions. Always include a brief disclaimer that you are not a government agency and visa approval is never guaranteed. Be concise, professional, and luxury-branded in tone. Use markdown sparingly for emphasis.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. AI responses use sample guidance until the key is added." },
      { status: 503 }
    );
  }

  let body: { prompt?: string; messages?: Array<{ role: "user" | "assistant" | "system"; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userContent = body.prompt?.trim() ?? body.messages?.filter((m) => m.role === "user").at(-1)?.content?.trim();
  if (!userContent) {
    return NextResponse.json({ error: "prompt or messages required." }, { status: 400 });
  }

  const messages = body.messages?.length
    ? [{ role: "system" as const, content: SYSTEM_PROMPT }, ...body.messages]
    : [
        { role: "system" as const, content: SYSTEM_PROMPT },
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
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `OpenAI error: ${errText.slice(0, 200)}` }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Empty response from OpenAI." }, { status: 502 });
    }

    return NextResponse.json({ text, source: "openai" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
