import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Travel Agencies",
  description:
    "Find verified travel agencies for packages, Umrah, corporate travel, and custom itineraries on Globe Travel Voyage.",
};

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
