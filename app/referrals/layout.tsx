import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Program",
  description:
    "Earn rewards by referring travelers and providers to Globe Travel Voyage. Share your link and track referrals.",
};

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
