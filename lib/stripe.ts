// =============================================================================
// Globe Travel Voyage — Stripe Stubs
// =============================================================================
// STATUS: Stub — safe to import. Returns null until real keys are added.
//
// To enable real Stripe:
//   1. Add keys to .env.local (see .env.example)
//   2. Install:  npm install stripe @stripe/stripe-js @stripe/react-stripe-js
//   3. Replace this file with real Stripe client setup:
//
//   Browser client:
//     import { loadStripe } from "@stripe/stripe-js";
//     export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
//
//   Server client:
//     import Stripe from "stripe";
//     export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//
// =============================================================================

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

/** Stub — replace with loadStripe() from @stripe/stripe-js */
export const stripePromise = null;

// ── Price IDs (set these in your Stripe dashboard then add to env) ────────────
// Add these to .env.local after creating products in Stripe:

export const STRIPE_PRICE_IDS = {
  ai_visa_guidance:       process.env.STRIPE_PRICE_AI_VISA        ?? "",
  premium_checklist:      process.env.STRIPE_PRICE_CHECKLIST      ?? "",
  expert_consultation:    process.env.STRIPE_PRICE_CONSULTATION    ?? "",
  agency_lead:            process.env.STRIPE_PRICE_AGENCY_LEAD     ?? "",
  tour_booking:           process.env.STRIPE_PRICE_TOUR_BOOKING    ?? "",
  property_lead:          process.env.STRIPE_PRICE_PROPERTY_LEAD   ?? "",
  ai_trip_premium:        process.env.STRIPE_PRICE_AI_TRIP         ?? "",
  featured_agency:        process.env.STRIPE_PRICE_FEATURED_AGENCY ?? "",
  featured_expert:        process.env.STRIPE_PRICE_FEATURED_EXPERT ?? "",
  starter_bundle:         process.env.STRIPE_PRICE_STARTER_BUNDLE  ?? "",
  pro_bundle:             process.env.STRIPE_PRICE_PRO_BUNDLE      ?? "",
  agency_pro:             process.env.STRIPE_PRICE_AGENCY_PRO      ?? "",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICE_IDS;
