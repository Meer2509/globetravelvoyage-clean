-- Globe Travel Voyage — production DDL for property listing submissions
-- Used by: lib/supabase/actions.ts → submitPropertyListing()
-- Table: public.property_listings

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.property_listings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_type    text NOT NULL,
  property_type   text NOT NULL,
  title           text NOT NULL,
  city            text NOT NULL,
  country         text,
  address         text,
  price           numeric(12,2),
  price_period    text DEFAULT 'month',
  beds            int,
  baths           int,
  area_sqft       int,
  description     text,
  contact_name    text NOT NULL,
  contact_email   text NOT NULL,
  contact_phone   text,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz DEFAULT now(),
  admin_notes     text,
  rating          numeric(3,2) DEFAULT 0,
  review_count    int DEFAULT 0,
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_listings_status
  ON public.property_listings(status);

ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own property listings" ON public.property_listings;
CREATE POLICY "Users view own property listings"
  ON public.property_listings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read published property listings" ON public.property_listings;
CREATE POLICY "Public read published property listings"
  ON public.property_listings FOR SELECT
  USING (status IN ('active', 'approved', 'published'));

-- Only needed if inserts use the anon/authenticated client instead of service role.
-- submitPropertyListing() uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS.
DROP POLICY IF EXISTS "Service intake insert property listings" ON public.property_listings;
CREATE POLICY "Service intake insert property listings"
  ON public.property_listings FOR INSERT
  WITH CHECK (true);
