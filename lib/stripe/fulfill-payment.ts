"use server";

import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { splitPaymentAmount } from "@/lib/stripe/commission";
import { fulfillPaymentFromCheckoutSession } from "@/lib/stripe/payment-records";
import { resolveUserIdFromEmail } from "@/lib/stripe/link-user";
import { activatePaidService } from "@/lib/stripe/activate-service";
import {
  sendCustomerPaymentConfirmation,
  sendAdminPaymentNotification,
} from "@/lib/email/send-payment-emails";
import { getCheckoutProduct } from "@/lib/stripe/products";

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
  homepage_placement: "provider_service",
  provider_subscription: "provider_service",
  provider_service: "provider_service",
};

function bookingTypeFromProduct(productKey: string): string {
  return BOOKING_TYPE_MAP[productKey] ?? productKey;
}

export interface FulfillResult {
  ok: true;
  bookingId?: string;
  paymentId?: string;
  visaApplicationId?: string;
  entitlementType?: string;
  invoiceNumber?: string;
  alreadyFulfilled?: boolean;
}

export async function fulfillStripePaymentComplete(
  session: Stripe.Checkout.Session
): Promise<FulfillResult | { ok: false; error: string }> {
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

  const meta = session.metadata ?? {};
  const productKey = meta.product_key ?? "";
  const product = getCheckoutProduct(productKey);
  const amount = session.amount_total != null ? session.amount_total / 100 : 0;
  const currency = (session.currency ?? "usd").toUpperCase();

  let userId = meta.user_id || null;
  if (!userId && email) {
    userId = await resolveUserIdFromEmail(email);
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Supabase admin client is not configured." };
  }

  const { data: existingPaid } = await admin
    .from("payments")
    .select("id, booking_id, invoice_number, status")
    .eq("stripe_session_id", session.id)
    .eq("status", "paid")
    .maybeSingle();

  if (existingPaid) {
    const row = existingPaid as { id: string; booking_id: string | null; invoice_number: string | null };
    return {
      ok: true,
      paymentId: row.id,
      bookingId: row.booking_id ?? undefined,
      invoiceNumber: row.invoice_number ?? undefined,
      alreadyFulfilled: true,
    };
  }

  const fulfillResult = await fulfillPaymentFromCheckoutSession({
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amount,
    currency,
    email,
    userId,
    serviceType: productKey,
    description: meta.listing_title || product?.name || productKey,
    providerUserId: meta.provider_user_id || null,
    providerServiceId: meta.provider_service_id || null,
  });

  if (!fulfillResult.ok) return fulfillResult;

  const paymentId = fulfillResult.paymentId;
  const providerUserId = meta.provider_user_id || null;
  const split = providerUserId ? splitPaymentAmount(amount) : null;

  const { data: paymentRow } = await admin
    .from("payments")
    .select("id, booking_id, invoice_number, description, service_type")
    .eq("id", paymentId)
    .single();

  const payment = paymentRow as {
    id: string;
    booking_id: string | null;
    invoice_number: string | null;
    description: string | null;
    service_type: string | null;
  };

  let bookingId = payment.booking_id ?? null;

  if (!bookingId) {
    const { data: existingBooking } = await admin
      .from("bookings")
      .select("id, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    bookingId = (existingBooking as { id: string } | null)?.id ?? null;

    if (bookingId) {
      await admin
        .from("bookings")
        .update({
          status: "confirmed",
          payment_id: paymentId,
          stripe_payment_id: paymentIntentId,
          user_id: userId || undefined,
          customer_email: email,
        })
        .eq("id", bookingId);
    } else {
      const bookingInsert = {
        user_id: userId || null,
        customer_email: email,
        provider_user_id: providerUserId || null,
        booking_type: bookingTypeFromProduct(productKey),
        listing_id: meta.listing_id || null,
        listing_title: meta.listing_title || product?.name || null,
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
        return { ok: false, error: `Booking save failed: ${bookingError.message}` };
      }
      if (booking) {
        bookingId = (booking as { id: string }).id;
      }
    }

    if (bookingId) {
      await admin.from("payments").update({ booking_id: bookingId }).eq("id", paymentId);
    }
  }

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
      description: meta.listing_title || product?.name || productKey || "Stripe payment",
    });

    if (txError && !isMissingTableError(txError)) {
      console.error("Transaction insert failed:", txError.message);
      return { ok: false, error: `Transaction save failed: ${txError.message}` };
    }
  }

  let visaApplicationId: string | undefined;
  let entitlementType: string | undefined;

  if (userId && productKey) {
    const activation = await activatePaidService({
      userId,
      productKey,
      paymentId,
      bookingId,
      email,
      listingTitle: meta.listing_title || null,
      agentId: meta.agent_id || null,
    });
    if (activation) {
      visaApplicationId = activation.visaApplicationId;
      entitlementType = activation.entitlementType;
    }
  }

  if (email) {
    const emailPayload = {
      customerEmail: email,
      customerName: session.customer_details?.name ?? null,
      serviceType: payment.service_type ?? productKey,
      description: payment.description ?? product?.name ?? "",
      amount,
      currency,
      invoiceNumber: payment.invoice_number ?? `GTV-${paymentId.slice(0, 8).toUpperCase()}`,
      paymentId,
      bookingId: bookingId ?? undefined,
      visaApplicationId,
    };
    await Promise.all([
      sendCustomerPaymentConfirmation(emailPayload),
      sendAdminPaymentNotification(emailPayload),
    ]);
  }

  return {
    ok: true,
    bookingId: bookingId ?? undefined,
    paymentId,
    visaApplicationId,
    entitlementType,
    invoiceNumber: payment.invoice_number ?? undefined,
  };
}
