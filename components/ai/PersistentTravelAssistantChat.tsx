"use client";

import { AIChatUI } from "@/components/AIChatUI";
import { usePersistentAiChat } from "@/components/ai/usePersistentAiChat";
import { getTravelAssistantReply } from "@/lib/ai-api";

export function PersistentTravelAssistantChat({
  suggestedPrompts,
  placeholder,
  disclaimer,
}: {
  suggestedPrompts: string[];
  placeholder?: string;
  disclaimer?: string;
}) {
  const { persistExchange, persistError } = usePersistentAiChat(
    "concierge",
    "AI Travel Assistant"
  );

  return (
    <div className="space-y-2">
      <AIChatUI
        initialMessages={[
          {
            id: "welcome",
            role: "ai",
            text: "Hello! I'm your AI Travel Concierge. I can help with visa requirements, trip planning, flight routes, hotel recommendations, document checklists and more. What would you like to explore today?",
            cards: [
              {
                type: "tip",
                title: "What I can help with",
                items: [
                  "Visa requirements for any destination",
                  "Trip planning with day-by-day itinerary",
                  "Flight routes and live fare search",
                  "Hotel and accommodation recommendations",
                  "Document checklists for visa applications",
                ],
                color: "blue",
              },
            ],
            timestamp: new Date(),
          },
        ]}
        suggestedPrompts={suggestedPrompts}
        onUserMessage={async (text) => {
          const result = await getTravelAssistantReply(text);
          await persistExchange(text, result.text);
          return result;
        }}
        placeholder={placeholder}
        maxHeight="520px"
        disclaimer={disclaimer}
      />
      {persistError && (
        <p className="text-xs text-charcoal/45 px-1">
          Conversation could not be saved: {persistError}. Sign in to enable history.
        </p>
      )}
    </div>
  );
}
