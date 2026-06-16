import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";

const TRAVEL_SERVICES = [
  {
    title: "Flights",
    description: "Compare routes and request verified quotes",
    href: "/flights",
    emoji: "✈️",
  },
  {
    title: "Hotels & Stays",
    description: "Luxury hotels, apartments and long-stay rentals",
    href: "/hotels",
    emoji: "🏨",
  },
  {
    title: "Tours",
    description: "Guided experiences and local day trips",
    href: "/tours",
    emoji: "🎯",
  },
  {
    title: "Cruises",
    description: "Gulf cruises, yachts and boat charters",
    href: "/cruises",
    emoji: "🚢",
  },
  {
    title: "Car Rentals",
    description: "Self-drive and chauffeur options worldwide",
    href: "/car-rentals",
    emoji: "🚗",
  },
  {
    title: "Properties",
    description: "Buy, rent and invest in global real estate",
    href: "/properties",
    emoji: "🏠",
  },
  {
    title: "Travel Guides",
    description: "Visa tips, destination insights and planning intel",
    href: "/guides",
    emoji: "📖",
  },
  {
    title: "Destinations",
    description: "Explore curated luxury destinations",
    href: "/destinations",
    emoji: "🌍",
  },
] as const;

export function HomeTravelServicesSection() {
  return (
    <section id="travel-services" className="section bg-soft/60">
      <div className="container-px">
        <SectionHeader
          eyebrow="Complete your journey"
          title="Flights, stays & experiences"
          subtitle="Everything beyond visa planning — browse, compare, and request verified quotes from our provider marketplace."
          center
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAVEL_SERVICES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card card-hover group flex flex-col p-5"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-xl transition-transform duration-300 group-hover:scale-105">
                {item.emoji}
              </span>
              <h3 className="text-sm font-bold text-navy">{item.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-charcoal/55">
                {item.description}
              </p>
              <span className="mt-4 text-xs font-semibold text-blue opacity-0 transition-opacity group-hover:opacity-100">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
