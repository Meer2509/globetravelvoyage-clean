import { Icon } from "./Icon";

export function Stars({
  rating,
  reviews,
  className = "",
}: {
  rating: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <Icon name="star" className="h-4 w-4 fill-gold text-gold" />
      <span className="font-semibold text-navy">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-navy/45">({reviews.toLocaleString()})</span>
      )}
    </span>
  );
}
