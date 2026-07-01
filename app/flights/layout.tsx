import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flight Search & Live Quotes",
  description:
    "Search live flight fares worldwide. Compare airlines, routes, and prices — then request a secure booking quote on Globe Travel Voyage.",
};

export default function FlightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
