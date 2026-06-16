"use client";

import { createContext, useContext } from "react";
import type { CatalogBundle } from "@/lib/catalog/static-bundle";
import { buildStaticCatalogBundle } from "@/lib/catalog/static-bundle";

const CatalogContext = createContext<CatalogBundle | null>(null);

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: CatalogBundle;
  children: React.ReactNode;
}) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogBundle {
  const ctx = useContext(CatalogContext);
  return ctx ?? buildStaticCatalogBundle();
}

export function useCatalogPlan(planId: string) {
  const { pricingPlans, pricingBundles } = useCatalog();
  return (
    pricingPlans.find((plan) => plan.id === planId) ??
    pricingBundles.find((bundle) => bundle.id === planId)
  );
}
