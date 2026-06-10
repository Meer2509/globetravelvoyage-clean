import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { Icon } from "./Icon";
import { stats } from "@/lib/data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-10 hidden text-7xl opacity-20 animate-float lg:block">
        ✈️
      </div>

      <div className="container-px relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold">
            <Icon name="sparkles" className="h-4 w-4" />
            AI-first global travel marketplace
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Your AI Travel Command Center for{" "}
            <span className="text-gold">Visas</span>,{" "}
            <span className="text-blue-light">Flights</span>, Tours, Rentals &{" "}
            Global Journeys.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Plan your trip, understand visa requirements, compare flights, find
            tours, rent cars, book cruises, discover stays, and connect with
            verified travel experts — all powered by AI.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <SearchBar />
        </div>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <span className="flex items-center gap-1.5">
            <Icon name="shield" className="h-4 w-4 text-gold" /> Verified providers
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="h-4 w-4 text-gold" /> No visa approval guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" className="h-4 w-4 text-gold" /> Clear disclaimers everywhere
          </span>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center"
            >
              <p className="text-2xl font-extrabold text-gold sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-white/60">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/visa/usa-from-pakistan" className="btn-gold px-6 py-3">
            Featured: USA Visa from Pakistan
          </Link>
          <Link
            href="/trip-planner"
            className="btn border border-white/20 px-6 py-3 text-white hover:bg-white/10"
          >
            Plan a trip by budget
          </Link>
        </div>
      </div>
    </section>
  );
}
