# GlobeTravelVoyage V3 — Product Strategy

**Vision:** Transform GlobeTravelVoyage into an AI-first luxury travel marketplace — one trusted concierge, verified marketplaces, and reputation at the center.

**Design principles:** luxury · premium · mobile-first · conversion-focused · trustworthy

**Scope constraint:** No new travel categories. Consolidate existing surfaces (visas, flights, hotels, tours, properties, agents, cruises, rentals).

---

## Priority stack

| # | Pillar | Status | V3 outcome |
|---|--------|--------|------------|
| 1 | Unified AI Travel Concierge | Phase 1 | Single `/concierge` experience; fragmented `/ai-*` tools redirect here |
| 2 | Travel Agent Marketplace | Phase 2 | Deep integration in concierge + homepage; inquiry → agent routing |
| 3 | Property Marketplace | Phase 2 | Featured on homepage; concierge can surface property intents |
| 4 | Group Tours Marketplace | Phase 3 | `/tours` powered by Supabase group tours; admin + provider flows |
| 5 | Reviews & Reputation | Phase 3 | Cross-marketplace trust scores; concierge cites verified providers |
| 6 | Community | Phase 4 | Traveler stories, messaging, moderation at `/community` |
| 7 | Premium conversion | Phase 5 | Stripe plans, subscriptions, featured listings |

---

## Phase 1 — Foundation (current)

**Goal:** One AI front door + conversion-focused homepage.

### Deliverables
- [x] Concierge intent detection with marketplace CTAs (visa, flights, property, agents, tours, planning)
- [x] Reusable handoff form → `lead_requests` / `booking_requests` + support email
- [x] Live marketplace counts on homepage (no fake numbers)
- [x] Provider deep links from concierge actions
- [x] Admin visibility via existing intake consoles

### Success metrics
- Single entry point for all AI intents
- Homepage CTA click-through to `/concierge`
- Reduced bounce between fragmented AI pages

---

## Phase 2 — Marketplace depth (current)

**Goal:** Connect AI Concierge to real marketplace actions.

### Deliverables
- [x] Concierge intent routing with CTAs per topic
- [x] Handoff forms → Supabase + support email
- [x] Live homepage marketplace counts
- [x] Provider deep links (no dead ends)

---

## Phase 3 — Tours + reputation

- Group tours: provider onboarding → public `/tours` catalog from DB
- Unified review badges on marketplace cards
- Concierge “verified provider” cards with ratings
- Admin reputation moderation

---

## Phase 4 — Community + messaging (current)

- [x] `/community` — free join, travel posts, likes, comments, follows, reports
- [x] `/messages` — real traveler ↔ agent/host/expert/support messaging
- [x] Admin moderation at `/admin/community` and `/admin/messages`
- [x] RLS + moderation (pending posts, approved public feed)
- [x] Optional Supabase Storage for community images

---

## Phase 5 — Premium conversion (current)

- [x] `/pricing` — Free Traveler, AI Concierge Plus, Premium Concierge, Agent Pro, Featured listings
- [x] Real Stripe Checkout (one-time + subscription mode)
- [x] Tables: `subscriptions`, `premium_requests`, `featured_listings` (+ existing `payments`)
- [x] Access control: save limits, priority concierge/support by tier
- [x] Admin: `/admin/payments`, `/admin/subscriptions`
- [x] Post-payment emails via existing Resend flow

---

## Phase 6 — Launch QA & polish (current)

- [x] Full-site QA pass — admin protected, Stripe verify-only success, marketplace trust strip
- [x] Launch wording — removed public "coming soon" / demo language
- [x] `/admin/launch-checklist` — OpenAI, Duffel, Resend, Supabase, Stripe, Site URL, admin role
- [x] `/admin/users` — live user list
- [x] Concierge handoff CTAs + saved conversations (signed-in)

---

## Technical notes

- AI backend: `app/api/ai/route.ts` (single concierge system prompt)
- Persistence: `ai-actions.ts` feature `concierge`
- Do not add new travel verticals; wire existing routes only
- All public marketplace data from Supabase — no mock catalogs
