import type { MetadataRoute } from "next";
import { getStaticVisaSlugs } from "@/lib/catalog/load-bundle";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import { PUBLIC_SITEMAP_PATHS } from "@/lib/seo/sitemap-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = PRODUCTION_SITE_URL;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/visa") || path === "/concierge" ? 0.9 : 0.7,
  }));

  const visaSlugs = await getStaticVisaSlugs();
  const visaEntries: MetadataRoute.Sitemap = visaSlugs.map(({ slug }) => ({
    url: `${base}/visa/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...visaEntries];
}
