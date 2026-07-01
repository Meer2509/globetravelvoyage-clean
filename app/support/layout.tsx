import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Support",
  description:
    "Get help with bookings, visa cases, payments, and account questions. Contact Globe Travel Voyage support.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
