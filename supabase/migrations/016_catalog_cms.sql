-- Globe Travel Voyage — CMS catalog (travel, visa, provider, SEO, pricing content)
-- Public read for published rows; writes via service role (seed/admin scripts).

CREATE TABLE IF NOT EXISTS catalog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection TEXT NOT NULL,
  item_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_entries_collection_item_key
  ON catalog_entries (collection, item_key)
  NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS idx_catalog_entries_collection_sort
  ON catalog_entries (collection, sort_order);

CREATE TABLE IF NOT EXISTS seo_pages (
  slug TEXT PRIMARY KEY,
  page_group TEXT NOT NULL CHECK (page_group IN ('visa', 'travel')),
  config JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_pages_group ON seo_pages (page_group);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_bundles (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: anonymous + authenticated read published content only
ALTER TABLE catalog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_commission_rates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'catalog_entries_public_read') THEN
    CREATE POLICY catalog_entries_public_read ON catalog_entries
      FOR SELECT USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seo_pages_public_read') THEN
    CREATE POLICY seo_pages_public_read ON seo_pages
      FOR SELECT USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pricing_plans_public_read') THEN
    CREATE POLICY pricing_plans_public_read ON pricing_plans
      FOR SELECT USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pricing_bundles_public_read') THEN
    CREATE POLICY pricing_bundles_public_read ON pricing_bundles
      FOR SELECT USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pricing_commission_rates_public_read') THEN
    CREATE POLICY pricing_commission_rates_public_read ON pricing_commission_rates
      FOR SELECT USING (is_published = true);
  END IF;
END $$;
