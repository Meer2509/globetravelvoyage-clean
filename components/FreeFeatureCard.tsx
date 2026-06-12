import Link from "next/link";
import { TierBadge } from "@/components/TierBadge";
import type { LaunchFeature } from "@/lib/launch-pricing";

export function FreeFeatureCard({
  feature,
  compact = false,
}: {
  feature: LaunchFeature;
  compact?: boolean;
}) {
  return (
    <div className={`card flex flex-col ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={compact ? "text-2xl" : "text-3xl"}>{feature.emoji}</span>
        <TierBadge tier="free" />
      </div>
      <div className="mt-3 min-w-0 flex-1">
        <p className={`font-bold text-navy ${compact ? "text-sm" : "text-base"}`}>{feature.title}</p>
        {!compact && (
          <p className="mt-1 text-sm leading-relaxed text-muted">{feature.description}</p>
        )}
      </div>
      <div className={`mt-auto border-t border-soft-200 ${compact ? "pt-3 mt-3" : "pt-4 mt-4"}`}>
        <Link
          href={feature.href}
          className={`btn-outline inline-flex w-full justify-center ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}`}
        >
          Get started free
        </Link>
      </div>
    </div>
  );
}
