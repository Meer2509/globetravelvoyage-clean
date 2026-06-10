import Link from "next/link";
import { Icon } from "./Icon";

export function CTASection({
  title = "Start your journey with your AI travel command center",
  subtitle = "Create a free account to plan trips, track visa applications, compare flights and connect with verified experts.",
  primary = { label: "Create free account", href: "/register" },
  secondary = { label: "Try the AI planner", href: "/trip-planner" },
}: {
  title?: string;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="section">
      <div className="container-px">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold">
              <Icon name="sparkles" className="h-4 w-4" /> Powered by AI
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-white/70">{subtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primary.href} className="btn-gold w-full px-7 py-3.5 sm:w-auto">
                {primary.label}
              </Link>
              <Link
                href={secondary.href}
                className="btn w-full border border-white/20 px-7 py-3.5 text-white hover:bg-white/10 sm:w-auto"
              >
                {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
