import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Globe Travel Voyage account to manage bookings, visa cases, and saved trips.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
