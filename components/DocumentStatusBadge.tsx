export function DocumentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-soft text-muted border-soft-200",
    "prepared-only": "bg-gold/10 text-navy border-gold/30",
    prepared: "bg-gold/10 text-navy border-gold/30",
    uploaded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    reviewed: "bg-navy/5 text-navy border-navy/15",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    "prepared-only": "Prepared only",
    prepared: "Prepared only",
    uploaded: "Uploaded",
    reviewed: "Reviewed",
  };

  const key = labels[status] ? status : "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${styles[key]}`}
    >
      {labels[key]}
    </span>
  );
}
