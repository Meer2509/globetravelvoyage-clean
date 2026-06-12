import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout — Globe Travel Voyage",
  description: "Secure Stripe checkout for visa services, AI trip plans, and marketplace listings.",
};

export default function CheckoutHubPage() {
  redirect("/services");
}
