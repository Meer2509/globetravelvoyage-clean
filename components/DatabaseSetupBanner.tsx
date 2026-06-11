import Link from "next/link";

export function DatabaseSetupBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-charcoal/75">
      <p className="font-semibold text-navy">Database setup required</p>
      <p className="mt-1">{message}</p>
      <Link href="/admin/setup" className="mt-2 inline-block text-xs font-bold text-blue hover:underline">
        View setup guide →
      </Link>
    </div>
  );
}
