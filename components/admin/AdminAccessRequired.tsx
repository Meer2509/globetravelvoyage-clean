import Link from "next/link";

export function AdminAccessRequired({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-5">
      <div className="card max-w-md p-8 text-center">
        <p className="text-4xl mb-4">🔐</p>
        <h1 className="text-xl font-extrabold text-navy">Administrator access required</h1>
        <p className="mt-2 text-sm text-charcoal/55">{message}</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex px-6 py-3 text-sm">
          Sign in
        </Link>
      </div>
    </div>
  );
}
