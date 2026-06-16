#!/usr/bin/env npx tsx
/**
 * Seed Supabase catalog tables from lib/data.ts, lib/pricing.ts, and lib/seo-pages.ts.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: npx tsx scripts/seed-catalog.ts
 */
import {
  buildCatalogSeedRows,
  buildPricingSeedRows,
  buildSeoSeedRows,
} from "../lib/catalog/static-bundle";
import {
  replaceCommissionRates,
  upsertCatalogEntries,
  upsertPricingBundles,
  upsertPricingPlans,
  upsertSeoPages,
} from "../lib/supabase/catalog-queries";

async function main() {
  const rows = buildCatalogSeedRows();
  const seoRows = buildSeoSeedRows();
  const pricing = buildPricingSeedRows();

  console.log(`Seeding ${rows.length} catalog entries…`);
  await upsertCatalogEntries(rows);

  console.log(`Seeding ${seoRows.length} SEO pages…`);
  await upsertSeoPages(seoRows);

  console.log(`Seeding ${pricing.plans.length} pricing plans…`);
  await upsertPricingPlans(pricing.plans);

  console.log(`Seeding ${pricing.bundles.length} pricing bundles…`);
  await upsertPricingBundles(pricing.bundles);

  console.log(`Seeding ${pricing.commissions.length} commission rates…`);
  await replaceCommissionRates(pricing.commissions);

  console.log("Catalog seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
