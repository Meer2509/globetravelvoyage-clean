import { NextResponse } from "next/server";
import { getStripe, isStripeServerConfigured } from "@/lib/stripe/server";
import { fulfillStripeCheckoutSession } from "@/lib/stripe/fulfill-session";
import { getCheckoutProduct } from "@/lib/stripe/products";
import { isSubscriptionProduct } from "@/lib/v5/plans";
import { repairMissingVisaCaseForUser } from "@/lib/supabase/visa-case-queries";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (!isStripeServerConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client could not be initialized." }, { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const amount = session.amount_total ? session.amount_total / 100 : null;
    const productKey = session.metadata?.product_key ?? "";
    const product = productKey ? getCheckoutProduct(productKey) : undefined;
    const isSubscription =
      session.mode === "subscription" || isSubscriptionProduct(productKey);
    const paid =
      session.payment_status === "paid" ||
      (isSubscription && session.status === "complete");

    let bookingId: string | undefined;
    let paymentId: string | undefined;
    let visaApplicationId: string | undefined;
    let visaCaseId: string | undefined;
    let caseNumber: string | undefined;
    let entitlementType: string | undefined;
    let invoiceNumber: string | undefined;
    let alreadyFulfilled = false;

    if (paid) {
      const fulfill = await fulfillStripeCheckoutSession(session);
      if (!fulfill.ok) {
        return NextResponse.json({ error: fulfill.error }, { status: 500 });
      }
      bookingId = fulfill.bookingId;
      paymentId = fulfill.paymentId;
      visaApplicationId = fulfill.visaApplicationId;
      visaCaseId = fulfill.visaCaseId;
      caseNumber = fulfill.caseNumber;
      entitlementType = fulfill.entitlementType;
      invoiceNumber = fulfill.invoiceNumber;
      alreadyFulfilled = fulfill.alreadyFulfilled ?? false;
    }

    const listingTitle = session.metadata?.listing_title;
    const displayName = listingTitle
      ? `${product?.name ?? "Purchase"}: ${listingTitle}`
      : product?.name ?? session.metadata?.product_key ?? "Your purchase";

    const isVisaService =
      productKey.includes("visa") ||
      productKey === "full_visa_application_support" ||
      entitlementType?.includes("visa");

    if (paid && isVisaService && !visaCaseId) {
      const userId = session.metadata?.user_id?.trim();
      if (userId) {
        const repairedId = await repairMissingVisaCaseForUser(userId);
        if (repairedId) {
          visaCaseId = repairedId;
          const admin = createAdminClient();
          if (admin) {
            const { data: caseRow } = await admin
              .from("visa_cases")
              .select("case_number")
              .eq("id", repairedId)
              .maybeSingle();
            caseNumber = (caseRow as { case_number?: string } | null)?.case_number ?? caseNumber;
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      paid,
      sessionId: session.id,
      productName: displayName,
      productKey,
      serviceType: productKey || null,
      amount,
      currency: session.currency?.toUpperCase() ?? "USD",
      bookingId,
      paymentId,
      visaApplicationId,
      entitlementType,
      invoiceNumber,
      alreadyFulfilled,
      isVisaService,
      visaCaseId,
      caseNumber,
      hasVisaCase: Boolean(visaCaseId || visaApplicationId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify payment session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
