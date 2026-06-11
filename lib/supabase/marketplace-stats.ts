"use server";

import { createAdminClient } from "./admin";

export interface MarketplaceStats {
  verifiedProviders: number;
  visaExperts: number;
  agencies: number;
  guides: number;
  hosts: number;
  completedBookings: number;
  totalBookings: number;
  reviews: number;
  leads: number;
  payments: number;
  isLive: boolean;
}

const EMPTY: MarketplaceStats = {
  verifiedProviders: 0,
  visaExperts: 0,
  agencies: 0,
  guides: 0,
  hosts: 0,
  completedBookings: 0,
  totalBookings: 0,
  reviews: 0,
  leads: 0,
  payments: 0,
  isLive: false,
};

async function countTable(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  filter?: { column: string; value: string | boolean }
): Promise<number> {
  if (!admin) return 0;
  let q = admin.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count } = await q;
  return count ?? 0;
}

export async function fetchMarketplaceStats(): Promise<MarketplaceStats> {
  const admin = createAdminClient();
  if (!admin) return EMPTY;

  const [
    visaExperts,
    verifiedExperts,
    agencies,
    verifiedAgencies,
    guides,
    verifiedGuides,
    hosts,
    verifiedHosts,
    totalBookings,
    completedBookings,
    reviews,
    leads,
    payments,
  ] = await Promise.all([
    countTable(admin, "visa_experts", { column: "is_active", value: true }),
    countTable(admin, "visa_experts", { column: "is_verified", value: true }),
    countTable(admin, "agencies", { column: "is_active", value: true }),
    countTable(admin, "agencies", { column: "is_verified", value: true }),
    countTable(admin, "tour_guides", { column: "is_active", value: true }),
    countTable(admin, "tour_guides", { column: "is_verified", value: true }),
    countTable(admin, "property_hosts", { column: "is_active", value: true }),
    countTable(admin, "property_hosts", { column: "is_verified", value: true }),
    countTable(admin, "booking_requests"),
    countTable(admin, "booking_requests", { column: "status", value: "confirmed" }),
    countTable(admin, "reviews"),
    countTable(admin, "lead_requests"),
    countTable(admin, "payments", { column: "status", value: "paid" }),
  ]);

  const verifiedProviders = verifiedExperts + verifiedAgencies + verifiedGuides + verifiedHosts;

  return {
    verifiedProviders,
    visaExperts,
    agencies,
    guides,
    hosts,
    completedBookings,
    totalBookings,
    reviews,
    leads,
    payments,
    isLive: true,
  };
}
