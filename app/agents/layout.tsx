import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Visa Experts",
  description:
    "Browse verified visa agents and experts on Globe Travel Voyage. Compare specialties, countries served, and request a consultation.",
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
