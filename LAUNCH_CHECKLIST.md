# Globe Travel Voyage — Production Launch Checklist

Use this checklist before pointing production traffic at **globetravelvoyage.com**. The in-app admin view at `/admin/launch` reads live env and database status from `lib/launch-checklist.ts`.

---

## 1. Database migrations

Apply all Supabase migrations on the **production** project (001–029):

```bash
# Link to production (one-time)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push pending migrations
npx supabase db push
```

Or apply SQL files manually in order under `supabase/migrations/`.

**Latest migrations (verify applied):**

| Migration | Purpose |
|-----------|---------|
| `027_growth_conversion.sql` | Growth events, attribution, abandoned inquiries |
| `028_provider_acquisition.sql` | Provider referrals, onboarding progress |
| `029_trust_reputation.sql` | Verification profiles, trust scores, fraud flags |

**Post-migration:**

- [ ] Confirm RLS policies are enabled on new tables
- [ ] Grant platform admin role in `user_roles` for `PLATFORM_ADMIN_EMAIL`
- [ ] Smoke-test auth sign-up and profile creation

---

## 2. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, set these for **Production** (and Preview if needed):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only — never expose client-side |
| `OPENAI_API_KEY` | Yes | AI Concierge |
| `DUFFEL_ACCESS_TOKEN` | Yes | Live flight search on `/flights` |
| `STRIPE_SECRET_KEY` | Yes | Checkout & payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Checkout UI |
| `STRIPE_WEBHOOK_SECRET` | Yes | Payment fulfillment webhook |
| `RESEND_API_KEY` | Yes | Transactional email |
| `RESEND_FROM_EMAIL` | Yes | Verified sender in Resend |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://globetravelvoyage.com` (no trailing slash) |
| `PLATFORM_ADMIN_EMAIL` | Yes | Operator inbox for `/admin` access |

Copy the full template from `.env.example`. Redeploy after changing env vars.

- [ ] All required variables set in Production
- [ ] `npm run build` passes locally with production-like env
- [ ] No secrets committed to git

---

## 3. Stripe webhook setup

1. **Stripe Dashboard → Developers → Webhooks → Add endpoint**
   - URL: `https://globetravelvoyage.com/api/stripe/webhook`
   - Events (minimum): `checkout.session.completed`, `payment_intent.succeeded`, `account.updated` (if using Connect)

2. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel.

3. **Local testing:**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

- [ ] Webhook endpoint returns 200 on test event
- [ ] Test checkout completes and booking/payment row updates in Supabase
- [ ] Webhook secret matches Production env

---

## 4. Supabase auth redirect URLs

In **Supabase → Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://globetravelvoyage.com` |
| Redirect URLs | `https://globetravelvoyage.com/auth/callback` |
| | `http://localhost:3000/auth/callback` (for local dev) |

Also enable desired providers (Email, Google, etc.) under **Authentication → Providers**.

- [ ] Site URL set to production domain
- [ ] `/auth/callback` in redirect allow list
- [ ] Email templates reviewed (confirm signup, reset password)
- [ ] `PLATFORM_ADMIN_EMAIL` user can sign in and reach `/admin`

---

## 5. Domain DNS

Point your domain to Vercel:

1. **Vercel → Project → Settings → Domains** — add `globetravelvoyage.com` and `www.globetravelvoyage.com`
2. At your registrar, add the DNS records Vercel provides (usually `A` / `CNAME`)
3. Enable HTTPS (automatic once DNS propagates)

**Email (Resend):**

- [ ] Domain verified in Resend (SPF, DKIM records)
- [ ] `RESEND_FROM_EMAIL` uses verified domain

- [ ] Apex + www resolve to Vercel
- [ ] SSL certificate active
- [ ] `NEXT_PUBLIC_SITE_URL` matches live domain

---

## 6. Test booking flow

End-to-end as a **customer**:

1. Browse listings (tours, properties, or travel agents)
2. Submit a booking or inquiry form
3. Complete Stripe checkout (use test mode first, then live)
4. Confirm confirmation email (Resend) and dashboard entry

- [ ] Form submission persists to Supabase
- [ ] Checkout redirects back to site correctly
- [ ] Webhook fulfills payment / booking status
- [ ] Customer sees booking in `/dashboard`

---

## 7. Test visa inquiry flow

1. Visit visa services / expert intake page
2. Submit inquiry with valid fields
3. Confirm admin sees intake in `/admin`
4. Confirm customer receives acknowledgment email (if configured)

- [ ] Inquiry saved with correct attribution
- [ ] Admin can view and update status
- [ ] No client-side errors in browser console

---

## 8. Test provider registration

1. Visit `/providers` and a role landing page (e.g. `/providers/travel-agent`)
2. Register with `?ref=GTV-TEST` referral code (optional)
3. Complete onboarding wizard
4. Confirm provider dashboard loads (`/dashboard/agent`, `/dashboard/verification`, etc.)

- [ ] New provider profile created
- [ ] Referral tracked (if ref param used)
- [ ] Provider can edit profile and services
- [ ] Verification center shows pending status

---

## 9. Test AI concierge

1. Visit `/ai-trip-planner` (or AI concierge route)
2. Send a message — confirm OpenAI response (not fallback stub)
3. Save a trip and verify it appears in dashboard saved trips

- [ ] `OPENAI_API_KEY` active in Production
- [ ] Responses stream or load without 500 errors
- [ ] Saved trips persist for signed-in user

---

## 10. Test admin dashboard

Sign in as the user matching `PLATFORM_ADMIN_EMAIL`:

| Area | Path |
|------|------|
| Launch readiness | `/admin/launch` |
| Growth | `/admin/growth` |
| Provider acquisition | `/admin/acquisition` |
| Verification & trust | `/admin/verification` |
| Intakes / bookings | `/admin` (and sub-routes) |

- [ ] Admin role enforced (non-admin blocked)
- [ ] Launch checklist shows green on required env
- [ ] Database audit shows no critical missing tables
- [ ] Can verify/suspend providers in verification admin

---

## Pre-deploy commands

Run locally before every production deploy:

```bash
npm ci
npm run lint
npm run build
```

---

## Rollback plan

- Revert to previous Vercel deployment via **Deployments → … → Promote to Production**
- Do not roll back database migrations without a tested down migration
- Pause Stripe webhook or switch to test keys if payments misbehave

---

*Last updated for migrations 001–029. See `.env.example` for the canonical environment variable list.*
