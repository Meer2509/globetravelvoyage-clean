export function DashboardEmpty({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card py-12 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="font-semibold text-navy">{title}</p>
      <p className="mt-1 text-sm text-charcoal/50 max-w-md mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
