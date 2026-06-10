import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-soft-200 bg-navy text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-px relative py-14 sm:py-16">
        {breadcrumbs && (
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/55">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {b.href ? (
                  <Link href={b.href} className="hover:text-gold">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
