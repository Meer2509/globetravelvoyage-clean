import { Icon } from "./Icon";
import type { IconName } from "@/lib/data";

export function TrustBadge({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="text-base font-bold text-navy">{title}</h3>
      <p className="text-sm leading-relaxed text-navy/60">{text}</p>
    </div>
  );
}

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue ${className}`}
    >
      <Icon name="check" className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}
