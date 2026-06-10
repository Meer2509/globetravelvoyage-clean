import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  linkHref,
  linkLabel,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        center ? "sm:flex-col sm:items-center sm:text-center" : ""
      }`}
    >
      <div className={center ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="h-section mt-3">{title}</h2>
        {subtitle && <p className="mt-3 text-base text-navy/60">{subtitle}</p>}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="shrink-0 text-sm font-semibold text-blue hover:text-navy"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
