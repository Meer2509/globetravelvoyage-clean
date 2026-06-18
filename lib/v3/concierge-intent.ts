export type ConciergeIntent =
  | "visa"
  | "flights"
  | "property"
  | "travel_agent"
  | "group_tours"
  | "trip_planning"
  | "general";

export type ConciergeHandoffTopic = "visa" | "property" | "trip_planning";

export interface ConciergeAction {
  id: string;
  label: string;
  kind: "link" | "handoff";
  href?: string;
  handoffTopic?: ConciergeHandoffTopic;
  variant: "primary" | "secondary";
}

const INTENT_PATTERNS: { intent: ConciergeIntent; patterns: RegExp[]; weight: number }[] = [
  {
    intent: "visa",
    weight: 10,
    patterns: [
      /\b(visa|immigration|embassy|consulate|schengen|ds-?160|b1\/?b2|i-?20|work permit|student visa|visitor visa)\b/i,
      /\b(document checklist|passport validity|visa refusal|visa interview)\b/i,
    ],
  },
  {
    intent: "flights",
    weight: 9,
    patterns: [/\b(flight|flights|fly|airline|airfare|fare|ticket|layover|airport|duffel)\b/i],
  },
  {
    intent: "property",
    weight: 9,
    patterns: [
      /\b(property|properties|rent|rental|apartment|villa|real estate|furnished|lease|buy a home|investment property)\b/i,
    ],
  },
  {
    intent: "travel_agent",
    weight: 8,
    patterns: [/\b(travel agent|travel agents|human expert|speak with an agent|bespoke agent)\b/i],
  },
  {
    intent: "group_tours",
    weight: 8,
    patterns: [/\b(group tour|group tours|guided tour|day trip|excursion|tour package|group departure)\b/i],
  },
  {
    intent: "trip_planning",
    weight: 7,
    patterns: [
      /\b(plan my trip|itinerary|trip plan|days in|honeymoon|vacation|holiday|travel budget|day-by-day)\b/i,
      /\b(plan|planning)\b.*\b(trip|journey|travel)\b/i,
    ],
  },
];

export function detectConciergeIntent(message: string): ConciergeIntent {
  const text = message.trim();
  if (!text) return "general";

  let best: ConciergeIntent = "general";
  let bestScore = 0;

  for (const { intent, patterns, weight } of INTENT_PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) score += weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return bestScore > 0 ? best : "general";
}

export function getConciergeActions(intent: ConciergeIntent): ConciergeAction[] {
  switch (intent) {
    case "visa":
      return [
        {
          id: "visa-handoff",
          label: "Connect with a Visa Expert",
          kind: "handoff",
          handoffTopic: "visa",
          variant: "primary",
        },
        {
          id: "visa-start",
          label: "Start visa application",
          kind: "link",
          href: "/visa/start",
          variant: "secondary",
        },
      ];
    case "flights":
      return [
        {
          id: "flights-search",
          label: "Search Live Flights",
          kind: "link",
          href: "/flights",
          variant: "primary",
        },
      ];
    case "property":
      return [
        {
          id: "property-browse",
          label: "Browse Properties",
          kind: "link",
          href: "/properties",
          variant: "primary",
        },
        {
          id: "property-handoff",
          label: "Request Property Help",
          kind: "handoff",
          handoffTopic: "property",
          variant: "secondary",
        },
      ];
    case "travel_agent":
      return [
        {
          id: "agents-find",
          label: "Find a Travel Agent",
          kind: "link",
          href: "/travel-agents",
          variant: "primary",
        },
      ];
    case "group_tours":
      return [
        {
          id: "tours-explore",
          label: "Explore Group Tours",
          kind: "link",
          href: "/tours",
          variant: "primary",
        },
      ];
    case "trip_planning":
      return [
        {
          id: "trip-handoff",
          label: "Request Concierge Planning Help",
          kind: "handoff",
          handoffTopic: "trip_planning",
          variant: "primary",
        },
        {
          id: "booking-request",
          label: "Custom quote request",
          kind: "link",
          href: "/booking/request",
          variant: "secondary",
        },
      ];
    default:
      return [
        {
          id: "concierge-planning",
          label: "Request Concierge Planning Help",
          kind: "handoff",
          handoffTopic: "trip_planning",
          variant: "secondary",
        },
        {
          id: "agents-general",
          label: "Find a Travel Agent",
          kind: "link",
          href: "/travel-agents",
          variant: "secondary",
        },
      ];
  }
}

export function buildConversationSummary(
  messages: Array<{ role: string; text: string }>,
  maxChars = 2000
): string {
  const lines = messages
    .slice(-12)
    .map((m) => `${m.role === "user" ? "Traveler" : "Concierge"}: ${m.text.trim()}`)
    .filter(Boolean);

  let summary = lines.join("\n\n");
  if (summary.length > maxChars) {
    summary = `${summary.slice(0, maxChars - 3)}...`;
  }
  return summary;
}
