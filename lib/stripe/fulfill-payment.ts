"use server";

import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { splitPaymentAmount } from "@/lib/stripe/commission";
import { fulfillPaymentFromCheckoutSession } from "@/lib/stripe/payment-records";

const BOOKING_TYPE_MAP: Record<string, string> = {
  visa_expert_consultation: "visa_consultation",
  visa_document_review: "visa_consultation",
  visa_application_prep: "visa_consultation",
  premium_ai_trip_plan: "travel_plan",
  concierge_travel_planning: "travel_plan",
  tour_booking_deposit: "tour_deposit",
  tour_booking_request: "tour_deposit",
  property_reservation_deposit: "property_deposit",
  provider_service: "provider_service",
};

function bookingTypeFromProduct(productKey: string): string {
  return BOOKING_TYPE_MAP[productKey] ?? productKey;
}

export async function fulfillStripePaymentComplete(
  session: Stripe.Checkout.Session
): Promise<{ ok: true; bookingId?: string } | { ok: false; error: string }> {
  if (session.payment_status !== "paid") {
    return { ok: false, error: "Session is not paid." };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.email ??
    null;

  const fulfillResult = await fulfillPaymentFromCheckoutSession({
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amount: session.amount_total != null ? session.amount_total / 100 : undefined,
    currency: session.currency ?? undefined,
    email,
  });

  if (!fulfillResult.ok) return fulfillResult;

  const admin = createAdminClient();
  if (!admin) return { ok: true };

  const meta = session.metadata ?? {};
  const productKey = meta.product_key ?? "";
  const amount = session.amount_total != null ? session.amount_total / 100 : 0;
  const currency = (session.currency ?? "usd").toUpperCase();
  const userId = meta.user_id || null;
  const providerUserId = meta.provider_user_id || null;
  const split = providerUserId ? splitPaymentAmount(amount) : null;

  const { data: paymentRow } = await admin
    .from("payments")
    .select("id, booking_id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  const paymentId = (paymentRow as { id: string; booking_id: string | null } | null)?.id;
  let bookingId = (paymentRow as { id: string; booking_id: string | null } | null)?.booking_id ?? null;

  if (!bookingId && paymentId) {
    const { data: existingBooking } = await admin
      .from("bookings")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    bookingId = (existingBooking as { id: string } | null)?.id ?? null;

    if (!bookingId) {
      const bookingInsert = {
        user_id: userId || null,
        customer_email: email,
        provider_user_id: providerUserId || null,
        booking_type: bookingTypeFromProduct(productKey),
        listing_id: meta.listing_id || null,
        listing_title: meta.listing_title || null,
        agent_id: meta.agent_id || null,
        payment_id: paymentId,
        status: "confirmed",
        total_amount: amount,
        currency,
        stripe_session_id: session.id,
        stripe_payment_id: paymentIntentId,
        notes: meta.notes || null,
      };

      const { data: booking, error: bookingError } = await admin
        .from("bookings")
        .insert(bookingInsert)
        .select("id")
        .single();

      if (bookingError && !isMissingTableError(bookingError)) {
        console.error("Booking insert failed:", bookingError.message);
      } else if (booking) {
        bookingId = (booking as { id: string }).id;
        await admin.from("payments").update({ booking_id: bookingId }).eq("id", paymentId);
      }
    } else {
      await admin
        .from("bookings")
        .update({ status: "confirmed", payment_id: paymentId, stripe_payment_id: paymentIntentId })
        .eq("id", bookingId);
    }
  }

  if (paymentId) {
    const { data: existingTx } = await admin
      .from("transactions")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!existingTx) {
      const { error: txError } = await admin.from("transactions").insert({
        payment_id: paymentId,
        booking_id: bookingId,
        user_id: userId || null,
        provider_user_id: providerUserId || null,
        transaction_type: "payment",
        amount,
        platform_fee: split?.platformFee ?? null,
        provider_amount: split?.providerAmount ?? null,
        currency,
        status: "completed",
        stripe_payment_intent_id: paymentIntentId,
        stripe_session_id: session.id,
        description: meta.listing_title || productKey || "Stripe payment",
      });

      if (txError && !isMissingTableError(txError)) {
        console.error("Transaction insert failed:", txError.message);
      }
    }
  }

  return { ok: true, bookingId: bookingId ?? undefined };
}
