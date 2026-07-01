import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Account Type",
  description:
    "Select your Globe Travel Voyage account type — customer, travel agent, agency, guide, or property host.",
};

export default function AccountTypeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
