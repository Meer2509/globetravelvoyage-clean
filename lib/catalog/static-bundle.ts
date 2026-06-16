import type { SeoPageConfig } from "@/components/SeoLandingPage";
import type {
  Agency,
  Agent,
  CarRental,
  Country,
  Cruise,
  Destination,
  Faq,
  Flight,
  MarketplaceProvider,
  Property,
  PropertyListing,
  ReferralTier,
  Review,
  Role,
  Route,
  Service,
  Stat,
  Stay,
  Ticket,
  TicketRoute,
  Tour,
  TrustItem,
  VacationPackage,
  Visa,
  VisaHubCard,
  TravelGuide,
} from "@/lib/data";
import {
  agencies,
  agents,
  aiPrompts,
  cars,
  cheapRoutes,
  cruises,
  destinations,
  DISCLAIMER_SHORT,
  faqs,
  flights,
  marketplaceProviders,
  packages,
  properties,
  propertyListings,
  referralTiers,
  reviews,
  roles,
  services,
  stats,
  stays,
  ticketRoutes,
  tickets,
  tours,
  travelGuides,
  trustItems,
  usaRoutes,
  visaCountries,
  visaHubCards,
  visas,
} from "@/lib/data";
import {
  commissionRates,
  pricingBundles,
  pricingPlans,
  type CommissionRate,
  type PricingBundle,
  type PricingPlan,
} from "@/lib/pricing";
import { SEO_TRAVEL_PAGES, SEO_VISA_PAGES } from "@/lib/seo-pages";

export interface CatalogBundle {
  services: Service[];
  visas: Visa[];
  visaCountries: Country[];
  cheapRoutes: Route[];
  usaRoutes: Route[];
  flights: Flight[];
  stays: Stay[];
  cars: CarRental[];
  cruises: Cruise[];
  tours: Tour[];
  tickets: Ticket[];
  properties: Property[];
  agents: Agent[];
  agencies: Agency[];
  packages: VacationPackage[];
  destinations: Destination[];
  reviews: Review[];
  referralTiers: ReferralTier[];
  trustItems: TrustItem[];
  stats: Stat[];
  roles: Role[];
  faqs: Faq[];
  travelGuides: TravelGuide[];
  visaHubCards: VisaHubCard[];
  ticketRoutes: TicketRoute[];
  propertyListings: PropertyListing[];
  marketplaceProviders: MarketplaceProvider[];
  aiPrompts: string[];
  disclaimerShort: string;
  seoVisaPages: Record<string, SeoPageConfig>;
  seoTravelPages: Record<string, SeoPageConfig>;
  pricingPlans: PricingPlan[];
  pricingBundles: PricingBundle[];
  commissionRates: CommissionRate[];
}

export function buildStaticCatalogBundle(): CatalogBundle {
  return {
    services,
    visas,
    visaCountries,
    cheapRoutes,
    usaRoutes,
    flights,
    stays,
    cars,
    cruises,
    tours,
    tickets,
    properties,
    agents,
    agencies,
    packages,
    destinations,
    reviews,
    referralTiers,
    trustItems,
    stats,
    roles,
    faqs,
    travelGuides,
    visaHubCards,
    ticketRoutes,
    propertyListings,
    marketplaceProviders,
    aiPrompts,
    disclaimerShort: DISCLAIMER_SHORT,
    seoVisaPages: SEO_VISA_PAGES,
    seoTravelPages: SEO_TRAVEL_PAGES,
    pricingPlans,
    pricingBundles,
    commissionRates,
  };
}

function itemKeyFromPayload(payload: Record<string, unknown>, index: number): string {
  if (typeof payload.slug === "string") return payload.slug;
  if (typeof payload.id === "string") return payload.id;
  return String(index);
}

export function buildCatalogSeedRows(): Array<{
  collection: string;
  item_key: string | null;
  sort_order: number;
  payload: unknown;
}> {
  const bundle = buildStaticCatalogBundle();
  const rows: Array<{
    collection: string;
    item_key: string | null;
    sort_order: number;
    payload: unknown;
  }> = [];

  const pushArray = (collection: string, items: unknown[]) => {
    items.forEach((payload, index) => {
      const key =
        typeof payload === "string"
          ? String(index)
          : itemKeyFromPayload(payload as Record<string, unknown>, index);
      rows.push({ collection, item_key: key, sort_order: index, payload });
    });
  };

  pushArray("services", bundle.services);
  pushArray("visas", bundle.visas);
  pushArray("visa_countries", bundle.visaCountries);
  pushArray("cheap_routes", bundle.cheapRoutes);
  pushArray("usa_routes", bundle.usaRoutes);
  pushArray("flights", bundle.flights);
  pushArray("stays", bundle.stays);
  pushArray("cars", bundle.cars);
  pushArray("cruises", bundle.cruises);
  pushArray("tours", bundle.tours);
  pushArray("tickets", bundle.tickets);
  pushArray("properties", bundle.properties);
  pushArray("agents", bundle.agents);
  pushArray("agencies", bundle.agencies);
  pushArray("packages", bundle.packages);
  pushArray("destinations", bundle.destinations);
  pushArray("reviews", bundle.reviews);
  pushArray("referral_tiers", bundle.referralTiers);
  pushArray("trust_items", bundle.trustItems);
  pushArray("stats", bundle.stats);
  pushArray("roles", bundle.roles);
  pushArray("faqs", bundle.faqs);
  pushArray("travel_guides", bundle.travelGuides);
  pushArray("visa_hub_cards", bundle.visaHubCards);
  pushArray("ticket_routes", bundle.ticketRoutes);
  pushArray("property_listings", bundle.propertyListings);
  pushArray("marketplace_providers", bundle.marketplaceProviders);
  pushArray("ai_prompts", bundle.aiPrompts);

  rows.push({
    collection: "site_constants",
    item_key: "disclaimer_short",
    sort_order: 0,
    payload: { text: bundle.disclaimerShort },
  });

  return rows;
}

export function buildSeoSeedRows() {
  const bundle = buildStaticCatalogBundle();
  return [
    ...Object.entries(bundle.seoVisaPages).map(([slug, config]) => ({
      slug,
      page_group: "visa" as const,
      config,
    })),
    ...Object.entries(bundle.seoTravelPages).map(([slug, config]) => ({
      slug,
      page_group: "travel" as const,
      config,
    })),
  ];
}

export function buildPricingSeedRows() {
  const bundle = buildStaticCatalogBundle();
  return {
    plans: bundle.pricingPlans.map((plan, index) => ({
      id: plan.id,
      sort_order: index,
      payload: plan,
    })),
    bundles: bundle.pricingBundles.map((bundleRow, index) => ({
      id: bundleRow.id,
      sort_order: index,
      payload: bundleRow,
    })),
    commissions: bundle.commissionRates.map((rate, index) => ({
      sort_order: index,
      payload: rate,
    })),
  };
}
