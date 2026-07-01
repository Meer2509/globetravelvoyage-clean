import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Property Listing",
  description:
    "List your rental property on Globe Travel Voyage. Reach global travelers and manage inquiries from your host dashboard.",
};

export default function PropertyPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
