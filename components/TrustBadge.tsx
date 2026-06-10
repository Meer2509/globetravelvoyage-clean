import { Icon } from "./Icon";
import type { IconName } from "@/lib/data";

export function TrustBadge({
  icon,
  emoji,
  title,
  text,
}: {
  icon: IconName;
  emoji?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card flex flex-col gap-4 p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-navy">
        {emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : (
          <Icon name={icon} className="h-6 w-6" />
        )}
      </span>
      <div>
        <h3 className="text-base font-bold text-navy">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">{text}</p>
      </div>
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
