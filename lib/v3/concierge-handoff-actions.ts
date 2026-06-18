"use server";

import {
  submitBookingRequest,
  submitLeadRequest,
  type ActionResult,
} from "@/lib/supabase/actions";
import type { ConciergeHandoffTopic } from "./concierge-intent";

export interface ConciergeHandoffInput {
  topic: ConciergeHandoffTopic;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  budget?: string;
  travelDates?: string;
  message?: string;
  aiConversationSummary?: string;
}

export async function submitConciergeHandoff(
  input: ConciergeHandoffInput
): Promise<ActionResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  const summaryBlock = input.aiConversationSummary?.trim()
    ? `\n\n--- AI conversation summary ---\n${input.aiConversationSummary.trim()}`
    : "";

  const composedMessage = [
    input.message?.trim(),
    input.destination ? `Destination: ${input.destination}` : "",
    input.budget ? `Budget: ${input.budget}` : "",
    input.travelDates ? `Travel dates: ${input.travelDates}` : "",
    summaryBlock,
  ]
    .filter(Boolean)
    .join("\n");

  if (input.topic === "trip_planning") {
    return submitBookingRequest({
      serviceType: "concierge_planning",
      serviceName: "AI Concierge Planning Help",
      name,
      email,
      phone: input.phone,
      toLocation: input.destination,
      budget: input.budget,
      message: composedMessage || undefined,
      details: input.aiConversationSummary?.trim() || undefined,
      travelers: "1",
    });
  }

  const leadType =
    input.topic === "visa"
      ? "concierge_visa"
      : input.topic === "property"
        ? "concierge_property"
        : "concierge_contact";

  return submitLeadRequest({
    name,
    email,
    phone: input.phone,
    leadType,
    expertType: input.topic === "visa" ? "visa_agent" : input.topic === "property" ? "property" : undefined,
    purpose: input.topic === "visa" ? "Visa help from AI Concierge" : input.topic === "property" ? "Property help from AI Concierge" : "AI Concierge handoff",
    message: composedMessage || undefined,
    subjectMeta: input.destination || undefined,
    extra: {
      topic: input.topic,
      destination: input.destination ?? "",
      budget: input.budget ?? "",
      travel_dates: input.travelDates ?? "",
      ai_conversation_summary: input.aiConversationSummary ?? "",
    },
  });
}
