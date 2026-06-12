import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/checkout/success", destination: "/payment-success", permanent: true },
      { source: "/checkout/canceled", destination: "/payment-cancelled", permanent: true },
      { source: "/legal/refund-policy", destination: "/legal/refund", permanent: true },
      { source: "/legal/cancellation-policy", destination: "/legal/cancellation", permanent: true },
      { source: "/legal/cookie-policy", destination: "/legal/cookies", permanent: true },
    ];
  },
};

export default nextConfig;
