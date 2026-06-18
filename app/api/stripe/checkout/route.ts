import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import { getCheckoutProduct } from "@/lib/stripe/products";
import { getStripe, isStripeServerConfigured } from "@/lib/stripe/server";
import { createPaymentRecord } from "@/lib/stripe/payment-records";
import { createPendingBooking } from "@/lib/stripe/create-booking";
import { applicationFeeCents } from "@/lib/stripe/commission";
import { fetchConnectReadyAccount } from "@/lib/stripe/connect-accounts";
import { isSubscriptionProduct } from "@/lib/v5/plans";

interface CheckoutBody {
  productKey?: string;
  providerServiceId?: string;
  agentId?: string;
  listingId?: string;
  listingTitle?: string;
  listingType?: string;
  providerUserId?: string;
}

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

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const authUser = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = authUser?.id ?? null;
  const userEmail = authUser?.email ?? undefined;
  const siteUrl = getSiteUrl();

  let productKey = body.productKey?.trim() ?? "";
  let name = "";
  let description = "";
  let amountCents = 0;
  let currency = "usd";
  let metadata: Record<string, string> = {
    user_id: userId ?? "",
    email: userEmail ?? "",
  };

  if (body.providerServiceId) {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }
    const { data: service, error } = await admin
      .from("provider_services")
      .select("id, title, description, price, currency, provider_user_id, is_active")
      .eq("id", body.providerServiceId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !service) {
      return NextResponse.json({ error: "Provider service not found or inactive." }, { status: 404 });
    }

    productKey = "provider_service";
    name = (service as { title: string }).title;
    description = (service as { description: string | null }).description ?? "Provider marketplace service";
    amountCents = Math.round(Number((service as { price: number }).price) * 100);
    currency = ((service as { currency: string }).currency ?? "USD").toLowerCase();
    metadata = {
      ...metadata,
      product_key: productKey,
      provider_service_id: body.providerServiceId,
      provider_user_id: (service as { provider_user_id: string }).provider_user_id,
    };
  } else {
    if (!productKey) {
      return NextResponse.json({ error: "productKey or providerServiceId is required." }, { status: 400 });
    }
    const product = getCheckoutProduct(productKey);
    if (!product) {
      return NextResponse.json({ error: "Unknown product." }, { status: 400 });
    }
    name = product.name;
    description = product.description;
    if (body.listingTitle) {
      description = `${product.description} — ${body.listingTitle}`;
      name = `${product.name}: ${body.listingTitle}`;
    }
    amountCents = product.amountCents;
    currency = product.currency;
    metadata = {
      ...metadata,
      product_key: product.key,
      agent_id: body.agentId ?? "",
      listing_id: body.listingId ?? "",
      listing_title: body.listingTitle ?? "",
      listing_type: body.listingType ?? "",
      provider_user_id: body.providerUserId ?? "",
    };
  }

  if (amountCents < 50) {
    return NextResponse.json({ error: "Invalid service price." }, { status: 400 });
  }

  const providerUserId = metadata.provider_user_id?.trim() || null;
  let connectDestination: string | null = null;
  let transferStatus: string | null = null;

  if (providerUserId) {
    const ready = await fetchConnectReadyAccount(providerUserId);
    if (ready) {
      connectDestination = ready.stripeAccountId;
      transferStatus = "pending";
      metadata.connect_destination = connectDestination;
      metadata.connect_split = "true";
    } else {
      transferStatus = "pending_setup";
      metadata.connect_split = "false";
    }
  }

  try {
    const isSubscription = isSubscriptionProduct(productKey);

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            ...(isSubscription
              ? {
                  recurring: { interval: "month" as const },
                }
              : {}),
            product_data: {
              name,
              description,
              metadata: { product_key: productKey },
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-cancelled?product_key=${encodeURIComponent(productKey)}`,
      customer_email: userEmail,
      metadata: {
        ...metadata,
        checkout_mode: isSubscription ? "subscription" : "payment",
      },
    };

    if (!isSubscription && connectDestination) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeCents(amountCents),
        transfer_data: { destination: connectDestination },
        metadata: {
          connect_destination: connectDestination,
          provider_user_id: providerUserId ?? "",
          product_key: productKey,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!isSubscription && typeof session.payment_intent === "string") {
      await stripe.paymentIntents.update(session.payment_intent, {
        metadata: { checkout_session_id: session.id, product_key: productKey },
      });
    }

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
    }

    const amount = amountCents / 100;
    const record = await createPaymentRecord({
      userId,
      email: userEmail ?? null,
      serviceType: productKey,
      amount,
      currency,
      description: name,
      stripeSessionId: session.id,
      providerUserId: metadata.provider_user_id || null,
      providerServiceId: metadata.provider_service_id || null,
      transferStatus,
    });

    if (!record.ok) {
      console.error("Payment record insert failed:", record.error);
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch {
        /* session may already be active */
      }
      return NextResponse.json(
        { error: `Could not save payment record: ${record.error}` },
        { status: 500 }
      );
    }

    const bookingResult = await createPendingBooking({
      userId,
      email: userEmail ?? null,
      providerUserId: metadata.provider_user_id || null,
      productKey,
      amount,
      currency,
      stripeSessionId: session.id,
      paymentId: record.id,
      agentId: metadata.agent_id || null,
      listingId: metadata.listing_id || null,
      listingTitle: metadata.listing_title || name,
    });
    if (!bookingResult.ok) {
      console.error("Pending booking insert failed:", bookingResult.error);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      paymentRecordSaved: true,
      productKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout session creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
