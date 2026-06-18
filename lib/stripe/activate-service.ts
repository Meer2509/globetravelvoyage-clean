"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/profile-utils";
import { getCheckoutProduct } from "@/lib/stripe/products";
import { createVisaCase, isVisaProductKey } from "@/lib/visa-case";
import { sendEmail } from "@/lib/email/send-email";
import { visaCaseCreatedEmail } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site-url";

const VISA_PRODUCTS = new Set([
  "visa_document_review",
  "visa_application_assistance",
  "premium_visa_filing_support",
  "urgent_visa_prep",
  "family_visa_package",
  "usa_visa_consultation",
  "usa_b1b2_document_review",
  "full_visa_application_support",
  "canada_visa_consultation",
  "uk_visitor_visa_support",
  "schengen_visa_support",
  "visa_expert_consultation",
  "visa_application_prep",
]);

const PROVIDER_FEATURED = new Set([
  "expert_featured_listing",
  "agency_featured_listing",
  "guide_featured_listing",
  "property_featured_listing",
  "homepage_placement",
  "provider_subscription",
  "travel_agent_featured_listing",
  "featured_group_tour_listing",
]);

const CONCIERGE_PLUS = new Set(["ai_concierge_plus"]);
const PREMIUM_CONCIERGE = new Set(["premium_concierge_planning"]);
const AGENT_PRO = new Set(["travel_agent_pro"]);

export interface ActivationResult {
  entitlementId?: string;
  visaApplicationId?: string;
  visaCaseId?: string;
  caseNumber?: string;
  entitlementType: string;
  subscriptionId?: string;
  premiumRequestId?: string;
  featuredListingId?: string;
}

function entitlementTypeForProduct(productKey: string): string {
  if (CONCIERGE_PLUS.has(productKey)) return "concierge_plus";
  if (PREMIUM_CONCIERGE.has(productKey)) return "premium_concierge";
  if (AGENT_PRO.has(productKey)) return "agent_pro";
  if (
    productKey === "full_visa_application_support" ||
    productKey === "premium_visa_filing_support" ||
    productKey === "visa_application_prep"
  ) {
    return "visa_full_support";
  }
  if (isVisaProductKey(productKey) || VISA_PRODUCTS.has(productKey)) return "visa_premium";
  if (productKey === "premium_ai_trip_plan" || productKey === "family_vacation_plan") return "premium_ai";
  if (
    productKey === "concierge_travel_planning" ||
    productKey === "human_trip_planner" ||
    productKey === "luxury_concierge_planning" ||
    productKey === "honeymoon_planning"
  ) {
    return "concierge";
  }
  if (PROVIDER_FEATURED.has(productKey)) return "provider_featured";
  if (productKey === "verified_badge_fee") return "verified_badge";
  return productKey;
}

const VISA_CHECKLIST = [
  { name: "Valid passport (6+ months validity)", status: "pending" },
  { name: "Completed visa application form", status: "pending" },
  { name: "Passport-size photographs", status: "pending" },
  { name: "Proof of financial means", status: "pending" },
  { name: "Travel itinerary / invitation letter", status: "pending" },
  { name: "Employment / education proof", status: "pending" },
  { name: "Previous visa copies (if applicable)", status: "pending" },
];

export async function activatePaidService(input: {
  userId: string;
  productKey: string;
  paymentId: string;
  bookingId?: string | null;
  email?: string | null;
  listingTitle?: string | null;
  agentId?: string | null;
  listingId?: string | null;
  listingType?: string | null;
  stripeSessionId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  subscriptionPeriodEnd?: string | null;
}): Promise<ActivationResult | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const product = getCheckoutProduct(input.productKey);
  const entitlementType = entitlementTypeForProduct(input.productKey);

  let visaApplicationId: string | undefined;
  let visaCaseId: string | undefined;
  let caseNumber: string | undefined;

  if (isVisaProductKey(input.productKey) || VISA_PRODUCTS.has(input.productKey)) {
    const isFullSupport =
      input.productKey === "full_visa_application_support" ||
      input.productKey === "visa_application_prep";

    const visaInsert = {
      applicant_id: input.userId,
      agent_id: input.agentId || null,
      visa_type: isFullSupport ? "Full Application Support" : product?.name ?? "Visa Consultation",
      destination_country: "USA",
      origin_country: "—",
      status: isFullSupport ? "submitted" : "under_review",
      payment_id: input.paymentId,
      booking_id: input.bookingId ?? null,
      service_product_key: input.productKey,
      progress_step: 1,
      assigned_expert_name: "Assignment in progress",
      agent_fee_paid: true,
      ai_checklist: VISA_CHECKLIST,
      notes: input.listingTitle ? `Purchased: ${input.listingTitle}` : `Purchased: ${product?.name}`,
    };

    const { data: visaApp, error: visaError } = await admin
      .from("visa_applications")
      .insert(visaInsert)
      .select("id")
      .single();

    if (!visaError && visaApp) {
      visaApplicationId = (visaApp as { id: string }).id;
    } else if (visaError && !isMissingTableError(visaError)) {
      console.error("Visa application create failed:", visaError.message);
    }

    const visaCase = await createVisaCase({
      userId: input.userId,
      paymentId: input.paymentId,
      bookingId: input.bookingId,
      serviceName: product?.name ?? input.productKey,
      productKey: input.productKey,
      providerUserId: input.agentId ?? null,
      visaType: product?.name ?? "Visa Service",
    });
    if (visaCase && "caseId" in visaCase) {
      visaCaseId = visaCase.caseId;
      caseNumber = visaCase.caseNumber;
      if (input.email) {
        const tpl = visaCaseCreatedEmail({
          caseNumber: visaCase.caseNumber,
          serviceName: product?.name ?? "Visa Service",
          dashboardUrl: `${getSiteUrl()}/dashboard/visa-cases/${visaCase.caseId}`,
        });
        await sendEmail({
          to: input.email,
          subject: tpl.subject,
          html: tpl.html,
          type: "visa_case_created",
          userId: input.userId,
        });
      }
    }
  }

  const TRIP_PLAN_PRODUCTS = new Set([
    "premium_ai_trip_plan",
    "family_vacation_plan",
    "human_trip_planner",
    "luxury_concierge_planning",
    "honeymoon_planning",
    "concierge_travel_planning",
  ]);

  if (TRIP_PLAN_PRODUCTS.has(input.productKey)) {
    await admin.from("trip_plans").insert({
      user_id: input.userId,
      title: input.listingTitle ? `Premium: ${input.listingTitle}` : product?.name ?? "Trip Plan",
      destination: input.listingTitle ?? null,
      travel_style: "luxury",
      is_saved: true,
      ai_itinerary: { premium: true, unlocked: true, product_key: input.productKey },
    });
  }

  const { data: existingEnt } = await admin
    .from("user_entitlements")
    .select("id, visa_application_id")
    .eq("payment_id", input.paymentId)
    .maybeSingle();

  if (existingEnt) {
    const ent = existingEnt as { id: string; visa_application_id: string | null };
    return {
      entitlementId: ent.id,
      visaApplicationId: ent.visa_application_id ?? visaApplicationId,
      visaCaseId,
      caseNumber,
      entitlementType,
    };
  }

  if (input.productKey === "verified_badge_fee") {
    await admin.from("visa_experts").update({ verification_status: "under_review" }).eq("user_id", input.userId);
    await admin.from("agencies").update({ verification_status: "under_review" }).eq("user_id", input.userId);
    await admin.from("tour_guides").update({ verification_status: "under_review" }).eq("user_id", input.userId);
    await admin.from("provider_verifications").insert({
      user_id: input.userId,
      provider_role: "provider",
      status: "pending",
      notes: "Paid verified provider review",
    });
  }

  if (PROVIDER_FEATURED.has(input.productKey)) {
    await admin.from("visa_experts").update({ is_featured: true }).eq("user_id", input.userId);
    await admin.from("agencies").update({ is_featured: true }).eq("user_id", input.userId);
    await admin.from("tour_guides").update({ is_featured: true }).eq("user_id", input.userId);
  }

  if (input.productKey === "travel_agent_featured_listing") {
    const agentListingId = input.listingId ?? input.agentId;
    if (agentListingId) {
      await admin.from("travel_agent_profiles").update({ featured: true }).eq("id", agentListingId);
    } else {
      await admin.from("travel_agent_profiles").update({ featured: true }).eq("user_id", input.userId);
    }
  }

  if (input.productKey === "property_featured_listing" && input.listingId) {
    await admin.from("property_listings").update({ is_featured: true }).eq("id", input.listingId);
  }

  if (input.productKey === "featured_group_tour_listing" && input.listingId) {
    await admin.from("group_tours").update({ featured: true }).eq("id", input.listingId);
  }

  let subscriptionId: string | undefined;
  let premiumRequestId: string | undefined;
  let featuredListingId: string | undefined;

  const { recordSubscription, recordPremiumRequest, recordFeaturedListing } = await import(
    "@/lib/supabase/premium-actions"
  );

  if (input.stripeSubscriptionId && (CONCIERGE_PLUS.has(input.productKey) || AGENT_PRO.has(input.productKey))) {
    const sub = await recordSubscription({
      userId: input.userId,
      planKey: input.productKey,
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripeCustomerId: input.stripeCustomerId,
      currentPeriodEnd: input.subscriptionPeriodEnd,
      paymentId: input.paymentId,
    });
    if (sub.ok) subscriptionId = sub.data.id;
  }

  if (CONCIERGE_PLUS.has(input.productKey) || PREMIUM_CONCIERGE.has(input.productKey)) {
    const req = await recordPremiumRequest({
      userId: input.userId,
      planKey: input.productKey,
      paymentId: input.paymentId,
      subscriptionId,
      requestType: PREMIUM_CONCIERGE.has(input.productKey) ? "premium_planning" : "concierge_plus",
      details: {
        listing_title: input.listingTitle,
        priority: true,
      },
    });
    if (req.ok) premiumRequestId = req.data.id;
  }

  if (
    input.productKey === "travel_agent_featured_listing" ||
    input.productKey === "property_featured_listing" ||
    input.productKey === "featured_group_tour_listing"
  ) {
    const listingType =
      input.productKey === "travel_agent_featured_listing"
        ? "travel_agent"
        : input.productKey === "property_featured_listing"
          ? "property"
          : "group_tour";
    const listingId = input.listingId ?? input.agentId ?? input.userId;
    const feat = await recordFeaturedListing({
      userId: input.userId,
      listingType,
      listingId,
      paymentId: input.paymentId,
      stripeSessionId: input.stripeSessionId,
    });
    if (feat.ok) featuredListingId = feat.data.id;
  }

  const expiresAt =
    PROVIDER_FEATURED.has(input.productKey) || input.productKey === "featured_group_tour_listing"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : input.subscriptionPeriodEnd ?? null;

  const { data: entitlement, error: entError } = await admin
    .from("user_entitlements")
    .insert({
      user_id: input.userId,
      entitlement_type: entitlementType,
      product_key: input.productKey,
      payment_id: input.paymentId,
      booking_id: input.bookingId ?? null,
      visa_application_id: visaApplicationId ?? null,
      status: "active",
      metadata: {
        product_name: product?.name ?? input.productKey,
        listing_title: input.listingTitle ?? null,
      },
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (entError) {
    if (!isMissingTableError(entError)) {
      console.error("Entitlement insert failed:", entError.message);
    }
    return {
      entitlementType,
      visaApplicationId,
      visaCaseId,
      caseNumber,
      subscriptionId,
      premiumRequestId,
      featuredListingId,
    };
  }

  return {
    entitlementId: (entitlement as { id: string }).id,
    visaApplicationId,
    visaCaseId,
    caseNumber,
    entitlementType,
    subscriptionId,
    premiumRequestId,
    featuredListingId,
  };
}
