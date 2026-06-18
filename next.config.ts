import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
  async redirects() {
    return [
      { source: "/checkout/success", destination: "/payment-success", permanent: true },
      { source: "/checkout/canceled", destination: "/payment-cancelled", permanent: true },
      { source: "/legal/refund-policy", destination: "/legal/refund", permanent: true },
      { source: "/legal/cancellation-policy", destination: "/legal/cancellation", permanent: true },
      { source: "/legal/cookie-policy", destination: "/legal/cookies", permanent: true },
      { source: "/signup", destination: "/register", permanent: true },
      { source: "/ai-planner", destination: "/concierge", permanent: true },
      { source: "/trip-planner", destination: "/concierge", permanent: true },
      { source: "/ai-travel-assistant", destination: "/concierge", permanent: true },
      { source: "/ai-visa-assistant", destination: "/concierge?topic=visa", permanent: true },
      { source: "/ai-trip-planner", destination: "/concierge?topic=trip", permanent: true },
      { source: "/ai-flight-finder", destination: "/concierge?topic=flights", permanent: true },
      { source: "/ai-document-checker", destination: "/concierge?topic=documents", permanent: true },
    ];
  },
};

export default nextConfig;
