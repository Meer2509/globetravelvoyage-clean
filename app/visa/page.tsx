import type { Metadata } from "next";
import VisaPageClient from "./VisaPageClient";

export const metadata: Metadata = {
  title: "Visa Marketplace — AI Visa Assistant for Every Country",
  description:
    "AI visa guidance for every country. Find the right visa type, document checklist and step-by-step process, then connect with verified visa agents.",
};

export default function VisaPage() {
  return <VisaPageClient />;
}
