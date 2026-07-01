import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Destinations & Services",
  description:
    "Search Globe Travel Voyage for visas, flights, properties, tours, travel agents, and destinations worldwide.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
