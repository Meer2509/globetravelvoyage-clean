import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Booking",
  description:
    "Request a flight, tour, property, or service booking quote from verified providers on Globe Travel Voyage.",
};

export default function BookingRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
