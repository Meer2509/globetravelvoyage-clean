import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Globe Travel Voyage",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/privacy" className="text-sm text-charcoal/50 hover:text-navy">← Privacy</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Cookie Policy</h1>
        <div className="mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>We use essential cookies for authentication (Supabase session) and optional analytics cookies when configured.</p>
          <p>Stripe Checkout may set cookies during payment. See Stripe&apos;s privacy policy for details.</p>
          <p>You can disable non-essential cookies in your browser settings. Essential auth cookies are required to use signed-in features.</p>
        </div>
      </div>
    </div>
  );
}
