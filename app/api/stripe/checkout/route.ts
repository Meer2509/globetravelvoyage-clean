import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { getCheckoutProduct } from "@/lib/stripe/products";
import { getStripe, isStripeServerConfigured } from "@/lib/stripe/server";
import { createPaymentRecord } from "@/lib/stripe/payment-records";

export async function POST(request: Request) {
  if (!isStripeServerConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment.",
      },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client could not be initialized." }, { status: 503 });
  }

  let body: { productKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productKey = body.productKey?.trim();
  if (!productKey) {
    return NextResponse.json({ error: "productKey is required." }, { status: 400 });
  }

  const product = getCheckoutProduct(productKey);
  if (!product) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = authUser?.id ?? null;
  const userEmail = authUser?.email ?? undefined;

  const siteUrl = getSiteUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            unit_amount: product.amountCents,
            product_data: {
              name: product.name,
              description: product.description,
              metadata: { product_key: product.key },
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-cancelled`,
      customer_email: userEmail,
      metadata: {
        product_key: product.key,
        user_id: userId ?? "",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
    }

    const amount = product.amountCents / 100;
    const record = await createPaymentRecord({
      userId,
      amount,
      currency: product.currency,
      description: product.name,
      stripeSessionId: session.id,
    });

    if (!record.ok) {
      console.error("Payment record insert failed:", record.error);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      paymentRecordSaved: record.ok,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout session creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
