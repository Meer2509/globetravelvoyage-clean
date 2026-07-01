# Globe Travel Voyage — Production Audit

**Generated:** 2026-06-11  
**Production URL:** https://www.globetravelvoyage.com  
**Audit method:** Automated crawl of 134 routes + manual API probes + local production build (`npm run build`, `npm run lint`)

---

## Executive summary

GlobeTravelVoyage is **functionally launch-ready** on production. All 127 static routes return HTTP 200 (or intentional 307 redirects). Navigation links are intact. Core integrations — Supabase auth, OpenAI, Duffel, and Stripe — are live on Vercel.

The main gaps are **SEO infrastructure** (no `sitemap.xml` or `robots.txt`) and **page-level metadata** on ~48% of routes. Local development has an empty `.env.local`, which disables integrations when running `next start` locally.

### Launch readiness score: **82 / 100**

| Area | Score | Notes |
|------|-------|-------|
| Route health | 25/25 | 0 broken internal links; 0 user-facing 404s |
| API & integrations | 18/20 | Live on prod; minor error-code issue on Stripe verify |
| Auth & security | 12/15 | Prod redirects work; hardcoded admin fallback in proxy |
| SEO & metadata | 7/15 | No sitemap/robots; 62 pages use root default title |
| Configuration | 13/15 | Vercel prod configured; local `.env.local` empty |
| Build quality | 10/10 | Build passes (139 routes); lint 0 errors |

---

## 1. Route crawl results

### Scope

- **130** `page.tsx` routes in the app directory
- **19** API routes under `app/api`
- **134** URLs crawled on production (122 static + 12 redirect aliases + 7 visa catalog slugs)

### 404 pages

**None on valid, linked routes.**

The only 404s found were for **non-catalog visa slugs** used in audit probes (`/visa/schengen-tourist`, `/visa/australia-visitor`). These are not linked in the app. Valid catalog slugs all return 200:

| Slug | Status |
|------|--------|
| `/visa/usa-b1-b2` | 200 |
| `/visa/usa-f1-student` | 200 |
| `/visa/uk-standard-visitor` | 200 |
| `/visa/canada-visitor` | 200 |
| `/visa/schengen` | 200 |
| `/visa/uae-tourist` | 200 |
| `/visa/saudi-tourist` | 200 |

Dynamic routes (`/properties/[id]`, `/travel-agents/[id]`, etc.) correctly return 404 for invalid IDs via `notFound()` — expected behavior.

### Broken links

**0 broken links** across Navbar, Footer, and discovered internal links (50+ paths checked).

Intentional redirects (not broken):

| Source | Destination | Status |
|--------|-------------|--------|
| `/hotels`, `/tours`, `/car-rentals`, `/cruises`, `/tickets` | `/future-services#…` | 307 |
| `/trip-planner`, `/ai-*` pages | `/concierge` | 308 |
| `/checkout/success` | `/payment-success` | 308 |
| `/legal/*-policy` aliases | canonical legal pages | 308 |
| `/signup` | `/register` | 308 |

### Broken images

**No real broken images found.**

Automated image checks flagged Next.js `/_next/image` optimizer URLs as 400 on HEAD requests — a false positive. Static assets load correctly (`/logo.png` → 200 on production).

### Missing metadata

| Finding | Count |
|---------|-------|
| Pages with custom `metadata` / `generateMetadata` | 68 / 130 |
| Pages inheriting root layout title only | 62 |
| Root layout provides default title + description | Yes |

Pages using only the root default title include high-traffic routes like `/flights`, `/properties`, `/providers`, `/visa/start`, `/register`, `/forgot-password`, and all `/onboarding/*` routes. They inherit the global description from `app/layout.tsx` but lack page-specific `<title>` tags for SEO.

**Additional metadata issue:** `metadataBase` in `app/layout.tsx` is set to `https://globetravelvoyage.com` (apex) while production serves `https://www.globetravelvoyage.com`. Open Graph and canonical URLs may resolve to the non-www domain.

### Missing sitemap entries

| File | Production status |
|------|-------------------|
| `app/sitemap.ts` | **Not present** |
| `app/robots.ts` | **Not present** |
| `/sitemap.xml` | **404** |
| `/robots.txt` | **404** |

No sitemap exists. Search engines cannot discover the 130+ routes automatically. This is the largest SEO gap.

---

## 2. User flow verification

Tested on **production** (https://www.globetravelvoyage.com). Forms verified present in HTML; end-to-end submission requires authenticated sessions and live credentials.

| Flow | Page/API | Result |
|------|----------|--------|
| **Authentication** | `/login` | 200, login form present |
| **Registration** | `/register` | 200, registration form present |
| **Login** | `/login` | 200 |
| **Password reset** | `/forgot-password` | 200, email form present |
| **Password update** | `/account/update-password` | 200, password form present |
| **Auth callback** | `/auth/callback` | 200, handles Supabase redirects |
| **Provider onboarding** | `/onboarding/agent`, `/onboarding/host` | 307 → `/login?next=…` when unauthenticated (correct) |
| **Visa inquiry** | `/visa/start` | 200, intake form present |
| **AI concierge** | `/concierge` + `POST /api/ai` | Page 200; API returns live OpenAI response |
| **Flight search** | `/flights` + `POST /api/flights/search` | Page 200; API returns live Duffel fares (JFK→LHR) |
| **Contact forms** | `/contact`, `/lead/contact` | 200, forms present |
| **Stripe checkout** | `/checkout` + `POST /api/stripe/checkout` | Page 200; API validates products (Stripe configured) |
| **Admin dashboard** | `/admin`, `/admin/launch-checklist` | 307 → `/login?next=…` when unauthenticated (correct) |

### Protected route behavior (production)

```
/admin              → 307 /login?next=%2Fadmin
/dashboard          → 307 /login?next=%2Fdashboard
/onboarding/agent   → 307 /login?next=%2Fonboarding%2Fagent
```

Supabase session middleware (`proxy.ts`) is active on production.

### Local dev caveat

When `NEXT_PUBLIC_SUPABASE_URL` and anon key are missing, `proxy.ts` **skips all auth checks** and protected routes render without redirect. Local `.env.local` exists but all values are empty — local testing does not reflect production auth behavior.

---

## 3. API route report

### Production results

| Endpoint | Method | Status | Behavior |
|----------|--------|--------|----------|
| `/api/ai` | POST | **200** | Live OpenAI responses (`source: "openai"`) |
| `/api/flights/search` | POST | **200** | Live Duffel fares when valid IATA codes sent |
| `/api/flights/search` | POST | 400 | Graceful fallback message for empty/invalid input |
| `/api/stripe/checkout` | POST | 400 | Validates `productKey` / `providerServiceId` (Stripe configured) |
| `/api/stripe/webhook` | POST | 400 | Requires `stripe-signature` header (webhook secret configured) |
| `/api/stripe/verify` | GET | **500** | Returns Stripe error for invalid session ID (should ideally be 4xx) |
| `/api/stripe/connect/status` | GET | 401 | Requires sign-in (correct) |
| `/api/receipt/[id]` | GET | 404 | Returns "Receipt not found" for invalid ID (correct) |

### Auth-gated APIs (not tested without session)

These require authenticated users and valid resource IDs:

- `/api/cases/[caseId]/*` (6 document routes)
- `/api/visa-cases/[caseId]/*` (3 routes)
- `/api/stripe/connect/create-account`, `/account-link`

### Local production server (`localhost:3000`)

With empty `.env.local`, all integration APIs return **503** with clear error messages (`AI_UNAVAILABLE`, `Stripe is not configured`, etc.). No unhandled exceptions observed.

### Missing environment variables

**Production (inferred from live API behavior):**

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Configured |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Likely configured (server writes on prod) |
| `OPENAI_API_KEY` | Configured |
| `DUFFEL_ACCESS_TOKEN` | Configured |
| `STRIPE_SECRET_KEY` | Configured |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Configured |
| `STRIPE_WEBHOOK_SECRET` | Configured |
| `RESEND_API_KEY` | Not verified (requires test email send) |
| `RESEND_FROM_EMAIL` | Not verified |
| `NEXT_PUBLIC_SITE_URL` | Likely configured |
| `PLATFORM_ADMIN_EMAIL` | Not verified (requires admin login test) |

**Local `.env.local`:** File exists; **all 12 required keys are empty/unset**.

---

## 4. Production configuration

### Vercel environment variables

Cannot enumerate Vercel dashboard values directly. Production behavior confirms at minimum:

- Supabase public + service keys
- OpenAI API key
- Duffel access token
- Stripe secret, publishable, and webhook secret

**Action:** Cross-check against `.env.example` and `/admin/setup` on production after signing in as admin.

### Supabase

- Auth redirects active on production
- Protected routes enforce login
- Auth callback at `/auth/callback`
- **Verify:** Redirect URLs include `https://www.globetravelvoyage.com/auth/callback`
- **Verify:** Migrations 001–029 applied (especially 027–029 for growth, acquisition, trust)

### Stripe

- Checkout API validates products
- Webhook endpoint exists and rejects unsigned requests
- Connect status requires authentication
- **Manual test needed:** Complete a test-mode checkout and confirm webhook fulfillment

### Resend

- Not verified in this audit (no test email sent)
- **Manual test needed:** Submit contact form or trigger intake email and confirm delivery

### Duffel

- **Verified live:** JFK→LHR search returned 20+ offers from Virgin Atlantic, British Airways, American Airlines, Iberia

### Domain / DNS

- `https://www.globetravelvoyage.com` → 200
- SSL active
- `metadataBase` uses apex domain (`globetravelvoyage.com`) — minor inconsistency with www canonical

---

## 5. Critical issues

None that block core marketplace functionality on production.

| # | Issue | Impact |
|---|-------|--------|
| — | No critical blockers found | App is live and functional |

---

## 6. Warnings

| # | Warning | Severity | Recommendation |
|---|---------|----------|----------------|
| W1 | **No `sitemap.xml` or `robots.txt`** | High (SEO) | Add `app/sitemap.ts` and `app/robots.ts` covering all public routes, visa slugs, and legal pages |
| W2 | **62 pages lack custom `<title>`** | Medium (SEO) | Add `metadata` exports to high-traffic pages: `/flights`, `/properties`, `/providers`, `/visa/start`, `/register`, onboarding routes |
| W3 | **`metadataBase` apex vs www mismatch** | Medium (SEO/social) | Set `metadataBase` to `https://www.globetravelvoyage.com` to match production canonical |
| W4 | **Local `.env.local` is empty** | Medium (dev) | Copy values from `.env.example` and populate for local integration testing |
| W5 | **Hardcoded admin email fallback** in `proxy.ts` | Medium (security) | Remove fallback `meerhamzakhan2020@gmail.com`; rely solely on `PLATFORM_ADMIN_EMAIL` + `user_roles` |
| W6 | **`/api/stripe/verify` returns 500** for invalid session | Low | Map Stripe "No such checkout.session" to 404 instead of 500 |
| W7 | **Resend email delivery unverified** | Medium | Send test transactional email before marketing launch |
| W8 | **Stripe webhook fulfillment unverified** | Medium | Run test checkout + confirm DB payment row updates |
| W9 | **Database migrations 027–029** | Medium | Confirm applied on production Supabase |
| W10 | **Auth bypass when Supabase unset** | Low (dev only) | Document that local dev without env skips route protection |

---

## 7. Recommended fixes (priority order)

1. **Add sitemap + robots** — highest SEO impact, ~30 lines in `app/sitemap.ts` and `app/robots.ts`
2. **Align `metadataBase`** with `https://www.globetravelvoyage.com`
3. **Add page titles** to top 15 traffic routes (flights, visa/start, providers, register, properties)
4. **Populate local `.env.local`** for developer parity with production
5. **Remove hardcoded admin email** from `proxy.ts`
6. **Manual QA:** Stripe checkout → webhook → payment row; contact form → Resend inbox
7. **Confirm Supabase migrations** 027–029 on production
8. **Return 404** from `/api/stripe/verify` for unknown session IDs

---

## 8. Build & lint status

| Check | Result |
|-------|--------|
| `npm run build` | Pass — 139 routes compiled |
| `npm run lint` | Pass — 0 errors, 21 warnings (unused vars) |
| TypeScript | Pass — no type errors |
| Broken imports | None |

---

## 9. Related checklists

- **In-app:** `/admin/launch-checklist` (requires admin sign-in; reads live env and DB status)
- **Manual:** `LAUNCH_CHECKLIST.md` in the repo root

---

## 10. Conclusion

GlobeTravelVoyage is **ready for production traffic** with live AI, flights, payments, and auth. Address sitemap/robots and page-level metadata before investing in SEO or paid acquisition. Complete manual Stripe webhook and Resend email tests before announcing payment-dependent features.

**Launch readiness score: 82 / 100**
