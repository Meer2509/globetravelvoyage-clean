import { PRICE_ESTIMATE_LABEL } from "@/lib/launch-trust";

export function PriceEstimateLabel({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-snug text-charcoal/45 ${className}`}>
      {PRICE_ESTIMATE_LABEL}
    </p>
  );
}

export function SamplePrice({
  value,
  className = "font-extrabold text-navy",
  size = "sm",
}: {
  value: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-sm";
  return (
    <div>
      <p className={`${sizeClass} ${className}`}>{value}</p>
      <PriceEstimateLabel />
    </div>
  );
}
