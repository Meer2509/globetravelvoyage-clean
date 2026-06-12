"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";

export interface PendingBookingInput {
  userId: string | null;
  email: string | null;
  providerUserId?: string | null;
  productKey: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  paymentId: string;
  agentId?: string | null;
  listingId?: string | null;
  listingTitle?: string | null;
}

const BOOKING_TYPE_MAP: Record<string, string> = {
  usa_visa_consultation: "visa_consultation",
  usa_b1b2_document_review: "visa_consultation",
  full_visa_application_support: "visa_consultation",
  canada_visa_consultation: "visa_consultation",
  uk_visitor_visa_support: "visa_consultation",
  schengen_visa_support: "visa_consultation",
  visa_expert_consultation: "visa_consultation",
  visa_document_review: "visa_consultation",
  visa_application_prep: "visa_consultation",
  premium_ai_trip_plan: "travel_plan",
  family_vacation_plan: "travel_plan",
  concierge_travel_planning: "travel_plan",
  flight_quote_request: "travel_request",
  hotel_booking_help: "travel_request",
  cruise_yacht_quote: "travel_request",
  cruise_booking_request: "travel_request",
  tour_booking_deposit: "tour_deposit",
  tour_booking_request: "tour_deposit",
  property_rental_inquiry: "property_deposit",
  property_reservation_deposit: "property_deposit",
  expert_featured_listing: "provider_service",
  agency_featured_listing: "provider_service",
  verified_badge_fee: "provider_service",
  property_featured_listing: "provider_service",
  guide_featured_listing: "provider_service",
  provider_subscription: "provider_service",
  provider_service: "provider_service",
};

export async function createPendingBooking(
  input: PendingBookingInput
): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase not configured." };

  const bookingType = BOOKING_TYPE_MAP[input.productKey] ?? input.productKey;

  const { data, error } = await admin
    .from("bookings")
    .insert({
      user_id: input.userId,
      customer_email: input.email,
      provider_user_id: input.providerUserId ?? null,
      booking_type: bookingType,
      listing_id: input.listingId ?? null,
      listing_title: input.listingTitle ?? null,
      agent_id: input.agentId ?? null,
      payment_id: input.paymentId,
      status: "pending_payment",
      total_amount: input.amount,
      currency: input.currency.toUpperCase(),
      stripe_session_id: input.stripeSessionId,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { ok: false, error: "Run supabase/migrations/008_bookings_transactions.sql" };
    }
    return { ok: false, error: error.message };
  }

  const bookingId = (data as { id: string }).id;
  await admin.from("payments").update({ booking_id: bookingId }).eq("id", input.paymentId);

  return { ok: true, bookingId };
}
