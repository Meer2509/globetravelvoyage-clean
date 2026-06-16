import { createPublicSupabaseClient } from "./public-server";
import { createAdminClient } from "./admin";
import type { CatalogCollectionKey } from "@/lib/catalog/collections";

export interface CatalogEntryRow {
  collection: string;
  item_key: string | null;
  sort_order: number;
  payload: unknown;
}

export interface SeoPageRow {
  slug: string;
  page_group: "visa" | "travel";
  config: unknown;
}

export interface PricingRow {
  id?: string;
  sort_order: number;
  payload: unknown;
}

export async function fetchCatalogEntriesGrouped(): Promise<Map<string, unknown[]> | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("catalog_entries")
    .select("collection, item_key, sort_order, payload")
    .eq("is_published", true)
    .order("collection")
    .order("sort_order");

  if (error || !data?.length) return null;

  const grouped = new Map<string, unknown[]>();
  for (const row of data as CatalogEntryRow[]) {
    const list = grouped.get(row.collection) ?? [];
    list.push(row.payload);
    grouped.set(row.collection, list);
  }
  return grouped;
}

export async function fetchCatalogCollectionFromDb<T>(
  collection: CatalogCollectionKey
): Promise<T[] | null> {
  const grouped = await fetchCatalogEntriesGrouped();
  if (!grouped) return null;
  const rows = grouped.get(collection);
  return rows?.length ? (rows as T[]) : null;
}

export async function fetchSiteConstantFromDb<T>(itemKey: string): Promise<T | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("catalog_entries")
    .select("payload")
    .eq("collection", "site_constants")
    .eq("item_key", itemKey)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { payload: unknown }).payload as T;
}

export async function fetchSeoPagesFromDb(): Promise<{
  visa: Record<string, unknown>;
  travel: Record<string, unknown>;
} | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("seo_pages")
    .select("slug, page_group, config")
    .eq("is_published", true);

  if (error || !data?.length) return null;

  const visa: Record<string, unknown> = {};
  const travel: Record<string, unknown> = {};
  for (const row of data as SeoPageRow[]) {
    if (row.page_group === "visa") visa[row.slug] = row.config;
    else travel[row.slug] = row.config;
  }
  return { visa, travel };
}

export async function fetchPricingPlansFromDb<T>(): Promise<T[] | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pricing_plans")
    .select("sort_order, payload")
    .eq("is_published", true)
    .order("sort_order");

  if (error || !data?.length) return null;
  return (data as PricingRow[]).map((row) => row.payload as T);
}

export async function fetchPricingBundlesFromDb<T>(): Promise<T[] | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pricing_bundles")
    .select("sort_order, payload")
    .eq("is_published", true)
    .order("sort_order");

  if (error || !data?.length) return null;
  return (data as PricingRow[]).map((row) => row.payload as T);
}

export async function fetchCommissionRatesFromDb<T>(): Promise<T[] | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pricing_commission_rates")
    .select("sort_order, payload")
    .eq("is_published", true)
    .order("sort_order");

  if (error || !data?.length) return null;
  return (data as PricingRow[]).map((row) => row.payload as T);
}

/** Service-role upsert helpers for seed scripts. */
export async function upsertCatalogEntries(
  rows: Array<{
    collection: string;
    item_key: string | null;
    sort_order: number;
    payload: unknown;
  }>
) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("catalog_entries").upsert(
    rows.map((row) => ({
      ...row,
      is_published: true,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "collection,item_key" }
  );
  if (error) throw error;
}

export async function upsertSeoPages(
  rows: Array<{ slug: string; page_group: "visa" | "travel"; config: unknown }>
) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("seo_pages").upsert(
    rows.map((row) => ({
      ...row,
      is_published: true,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "slug" }
  );
  if (error) throw error;
}

export async function upsertPricingPlans(rows: Array<{ id: string; sort_order: number; payload: unknown }>) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("pricing_plans").upsert(
    rows.map((row) => ({ ...row, is_published: true, updated_at: new Date().toISOString() })),
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function upsertPricingBundles(rows: Array<{ id: string; sort_order: number; payload: unknown }>) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("pricing_bundles").upsert(
    rows.map((row) => ({ ...row, is_published: true, updated_at: new Date().toISOString() })),
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function replaceCommissionRates(rows: Array<{ sort_order: number; payload: unknown }>) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  await admin.from("pricing_commission_rates").delete().gte("sort_order", 0);

  const { error } = await admin.from("pricing_commission_rates").insert(
    rows.map((row) => ({
      ...row,
      is_published: true,
      updated_at: new Date().toISOString(),
    }))
  );
  if (error) throw error;
}
