"use server";

import { trackGrowthEvent } from "@/lib/growth/track-event";
import type { ProviderAcquisitionRole } from "./types";

export async function trackProviderLandingView(slug: string, role: ProviderAcquisitionRole): Promise<void> {
  trackGrowthEvent({
    eventType: "provider_landing_view",
    metadata: { slug, role },
    context: { source_path: `/providers/${slug}` },
  });
}

export async function trackProviderSignup(role: ProviderAcquisitionRole, userId?: string, email?: string): Promise<void> {
  trackGrowthEvent({
    eventType: "provider_signup",
    userId,
    email,
    metadata: { role },
  });
}
