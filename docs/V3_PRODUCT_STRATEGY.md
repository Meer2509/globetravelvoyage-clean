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
| 6 | Community | Phase 4 | Traveler stories, Q&A, provider tips — new `/community` |

---

## Phase 1 — Foundation (current)

**Goal:** One AI front door + conversion-focused homepage.

### Deliverables
- [x] `/concierge` — canonical AI Travel Concierge (chat, persistence, marketplace sidebar)
- [x] Redirects: `/ai-travel-assistant`, `/ai-visa-assistant`, `/ai-trip-planner`, `/trip-planner`, `/ai-flight-finder`, `/ai-document-checker` → `/concierge`
- [x] Homepage rebuilt around trip planning with concierge as primary CTA
- [x] Supporting marketplace hub: flights, visas, properties, agents, group tours
- [x] Nav + footer unified on “AI Concierge”
- [x] Floating widget points to full concierge (no duplicate tool silos)

### Success metrics
- Single entry point for all AI intents
- Homepage CTA click-through to `/concierge`
- Reduced bounce between fragmented AI pages

---

## Phase 2 — Marketplace depth

- Concierge intent routing → agent/property inquiry forms
- Homepage live counts from Supabase (verified agents, approved properties)
- Agent dashboard ↔ concierge lead notifications
- Property featured carousel on homepage (real data)

---

## Phase 3 — Tours + reputation

- Group tours: provider onboarding → public `/tours` catalog from DB
- Unified review badges on marketplace cards
- Concierge “verified provider” cards with ratings
- Admin reputation moderation

---

## Phase 4 — Community

- `/community` — traveler posts, destination tips, provider showcases
- Moderation + RLS
- Concierge can suggest community threads (read-only until Phase 4)

---

## Phase 5 — Premium conversion

- Stripe concierge tiers surfaced in-chat
- Saved trips + shareable itineraries
- Luxury white-glove human escalation from concierge

---

## Technical notes

- AI backend: `app/api/ai/route.ts` (single concierge system prompt)
- Persistence: `ai-actions.ts` feature `concierge`
- Do not add new travel verticals; wire existing routes only
- All public marketplace data from Supabase — no mock catalogs
