import { cache } from "react";
import type { SeoPageConfig } from "@/components/SeoLandingPage";
import { CATALOG_COLLECTIONS } from "@/lib/catalog/collections";
import {
  buildStaticCatalogBundle,
  type CatalogBundle,
} from "@/lib/catalog/static-bundle";
import type { CommissionRate, PricingBundle, PricingPlan } from "@/lib/pricing";
import {
  fetchCatalogEntriesGrouped,
  fetchCommissionRatesFromDb,
  fetchPricingBundlesFromDb,
  fetchPricingPlansFromDb,
  fetchSeoPagesFromDb,
} from "@/lib/supabase/catalog-queries";

function pick<T>(fromDb: T[] | null | undefined, fallback: T[]): T[] {
  return fromDb?.length ? fromDb : fallback;
}

function pickRecord<T extends Record<string, SeoPageConfig>>(
  fromDb: Record<string, unknown> | undefined,
  fallback: T
): T {
  if (!fromDb || !Object.keys(fromDb).length) return fallback;
  return fromDb as T;
}

function pickAiPrompts(fromDb: unknown[] | undefined, fallback: string[]): string[] {
  if (!fromDb?.length) return fallback;
  if (fromDb.every((item) => typeof item === "string")) return fromDb as string[];
  return fallback;
}

export const loadCatalogBundle = cache(async (): Promise<CatalogBundle> => {
  const staticBundle = buildStaticCatalogBundle();

  const [grouped, seoPages, pricingPlans, pricingBundles, commissionRates] = await Promise.all([
    fetchCatalogEntriesGrouped(),
    fetchSeoPagesFromDb(),
    fetchPricingPlansFromDb<PricingPlan>(),
    fetchPricingBundlesFromDb<PricingBundle>(),
    fetchCommissionRatesFromDb<CommissionRate>(),
  ] as const) as [
    Awaited<ReturnType<typeof fetchCatalogEntriesGrouped>>,
    Awaited<ReturnType<typeof fetchSeoPagesFromDb>>,
    PricingPlan[] | null,
    PricingBundle[] | null,
    CommissionRate[] | null,
  ];

  const get = <T>(collection: string, fallback: T[]): T[] =>
    pick(grouped?.get(collection) as T[] | undefined, fallback);

  let disclaimerShort = staticBundle.disclaimerShort;
  const siteConstants = grouped?.get(CATALOG_COLLECTIONS.siteConstants) as
    | Array<{ text?: string }>
    | undefined;
  if (siteConstants?.[0]?.text) disclaimerShort = siteConstants[0].text;

  return {
    services: get(CATALOG_COLLECTIONS.services, staticBundle.services),
    visas: get(CATALOG_COLLECTIONS.visas, staticBundle.visas),
    visaCountries: get(CATALOG_COLLECTIONS.visaCountries, staticBundle.visaCountries),
    cheapRoutes: get(CATALOG_COLLECTIONS.cheapRoutes, staticBundle.cheapRoutes),
    usaRoutes: get(CATALOG_COLLECTIONS.usaRoutes, staticBundle.usaRoutes),
    flights: get(CATALOG_COLLECTIONS.flights, staticBundle.flights),
    stays: get(CATALOG_COLLECTIONS.stays, staticBundle.stays),
    cars: get(CATALOG_COLLECTIONS.cars, staticBundle.cars),
    cruises: get(CATALOG_COLLECTIONS.cruises, staticBundle.cruises),
    tours: get(CATALOG_COLLECTIONS.tours, staticBundle.tours),
    tickets: get(CATALOG_COLLECTIONS.tickets, staticBundle.tickets),
    properties: get(CATALOG_COLLECTIONS.properties, staticBundle.properties),
    agents: get(CATALOG_COLLECTIONS.agents, staticBundle.agents),
    agencies: get(CATALOG_COLLECTIONS.agencies, staticBundle.agencies),
    packages: get(CATALOG_COLLECTIONS.packages, staticBundle.packages),
    destinations: get(CATALOG_COLLECTIONS.destinations, staticBundle.destinations),
    reviews: get(CATALOG_COLLECTIONS.reviews, staticBundle.reviews),
    referralTiers: get(CATALOG_COLLECTIONS.referralTiers, staticBundle.referralTiers),
    trustItems: get(CATALOG_COLLECTIONS.trustItems, staticBundle.trustItems),
    stats: get(CATALOG_COLLECTIONS.stats, staticBundle.stats),
    roles: get(CATALOG_COLLECTIONS.roles, staticBundle.roles),
    faqs: get(CATALOG_COLLECTIONS.faqs, staticBundle.faqs),
    travelGuides: get(CATALOG_COLLECTIONS.travelGuides, staticBundle.travelGuides),
    visaHubCards: get(CATALOG_COLLECTIONS.visaHubCards, staticBundle.visaHubCards),
    ticketRoutes: get(CATALOG_COLLECTIONS.ticketRoutes, staticBundle.ticketRoutes),
    propertyListings: get(CATALOG_COLLECTIONS.propertyListings, staticBundle.propertyListings),
    marketplaceProviders: get(
      CATALOG_COLLECTIONS.marketplaceProviders,
      staticBundle.marketplaceProviders
    ),
    aiPrompts: pickAiPrompts(grouped?.get(CATALOG_COLLECTIONS.aiPrompts), staticBundle.aiPrompts),
    disclaimerShort,
    seoVisaPages: pickRecord(seoPages?.visa, staticBundle.seoVisaPages),
    seoTravelPages: pickRecord(seoPages?.travel, staticBundle.seoTravelPages),
    pricingPlans: pick(pricingPlans, staticBundle.pricingPlans),
    pricingBundles: pick(pricingBundles, staticBundle.pricingBundles),
    commissionRates: pick(commissionRates, staticBundle.commissionRates),
  };
});

export async function getCatalogVisas() {
  return (await loadCatalogBundle()).visas;
}

export async function getSeoVisaPage(slug: string): Promise<SeoPageConfig | undefined> {
  const bundle = await loadCatalogBundle();
  return bundle.seoVisaPages[slug];
}

export async function getSeoTravelPage(slug: string): Promise<SeoPageConfig | undefined> {
  const bundle = await loadCatalogBundle();
  return bundle.seoTravelPages[slug];
}

export async function getPricingPlanById(planId: string) {
  const bundle = await loadCatalogBundle();
  return (
    bundle.pricingPlans.find((plan) => plan.id === planId) ??
    bundle.pricingBundles.find((bundleRow) => bundleRow.id === planId)
  );
}

export async function getAllPricingPlanIds() {
  const bundle = await loadCatalogBundle();
  return [...bundle.pricingPlans.map((p) => p.id), ...bundle.pricingBundles.map((b) => b.id)];
}
