import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/onboarding/",
          "/messages/",
          "/api/",
          "/auth/callback",
          "/account/update-password",
        ],
      },
    ],
    sitemap: `${PRODUCTION_SITE_URL}/sitemap.xml`,
  };
}
