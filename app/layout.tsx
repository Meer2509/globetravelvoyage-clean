import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIAssistant } from "@/components/AIAssistant";
import { CatalogProvider } from "@/lib/catalog/context";
import { loadCatalogBundle } from "@/lib/catalog/load-bundle";
import { GrowthAttributionProvider } from "@/components/growth/GrowthAttributionProvider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#081C3A",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.globetravelvoyage.com"),
  title: {
    default: "Globe Travel Voyage — AI Powered Global Travel",
    template: "%s · Globe Travel Voyage",
  },
  description:
    "Globe Travel Voyage is your AI-first luxury travel marketplace. One AI concierge for planning, plus verified agents, properties, tours and visa experts.",
  keywords: [
    "AI travel marketplace",
    "visa assistant",
    "flight search",
    "hotel booking",
    "car rentals",
    "cruise booking",
    "local tours",
    "travel agents",
    "visa application",
    "trip planner AI",
    "Pakistan to USA visa",
    "Gulf to Pakistan flights",
    "travel agencies",
    "Globe Travel Voyage",
  ],
  authors: [{ name: "Globe Travel Voyage" }],
  creator: "Globe Travel Voyage",
  publisher: "Globe Travel Voyage",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.globetravelvoyage.com",
    siteName: "Globe Travel Voyage",
    title: "Globe Travel Voyage — AI Powered Global Travel",
    description:
      "Your AI Travel Command Center for Visas, Flights, Hotels, Tours & Global Journeys. Compare prices, apply for visas, and connect with verified travel experts — all powered by AI.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Globe Travel Voyage — AI Powered Global Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GlobeTravelVoyage",
    creator: "@GlobeTravelVoyage",
    title: "Globe Travel Voyage — AI Powered Global Travel",
    description:
      "AI-powered global travel marketplace. Visas, flights, hotels, tours, rentals and more. Verified experts. 190+ countries.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await loadCatalogBundle();

  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#081C3A" />
      </head>
      <body className="flex min-h-full flex-col bg-white">
        <CatalogProvider catalog={catalog}>
          <GrowthAttributionProvider />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AIAssistant />
        </CatalogProvider>
      </body>
    </html>
  );
}
