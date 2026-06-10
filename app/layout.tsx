import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://globetravelvoyage.com"),
  title: {
    default: "Globe Travel Voyage — AI Travel Command Center",
    template: "%s · Globe Travel Voyage",
  },
  description:
    "Your AI Travel Command Center for Visas, Flights, Tours, Rentals & Global Journeys. Plan trips, understand visa requirements, compare flights, and connect with verified travel experts.",
  keywords: [
    "AI travel",
    "visa assistant",
    "flights",
    "hotels",
    "car rentals",
    "cruises",
    "tours",
    "travel marketplace",
  ],
  openGraph: {
    title: "Globe Travel Voyage — AI Travel Command Center",
    description:
      "Plan your trip, understand visa requirements, compare flights, find tours, rent cars, book cruises, and connect with verified travel experts — all powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <AIAssistant />
      </body>
    </html>
  );
}
