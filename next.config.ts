import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/checkout/success", destination: "/payment-success", permanent: true },
      { source: "/checkout/canceled", destination: "/payment-cancelled", permanent: true },
    ];
  },
};

export default nextConfig;
