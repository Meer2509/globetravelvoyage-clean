import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Provider Terms — Globe Travel Voyage",
};

export default function ProviderTermsPage() {
  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="container-px max-w-3xl">
        <Link href="/legal/terms" className="text-sm text-charcoal/50 hover:text-navy">← Terms</Link>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Provider Terms</h1>
        <div className="mt-6 space-y-4 text-sm text-charcoal/70 leading-relaxed">
          <p>Providers (visa experts, agencies, guides, hosts) must supply accurate profile information, honor quoted services, and comply with applicable laws in their jurisdiction.</p>
          <p>Verification badges indicate identity checks completed on the platform — not endorsement of service quality or outcomes.</p>
          <p>Payouts to providers via Stripe Connect will be subject to additional terms when enabled. Until then, the platform may collect customer payments directly.</p>
          <p>Providers must not misrepresent visa approval chances, government affiliation, or guaranteed travel outcomes.</p>
        </div>
      </div>
    </div>
  );
}
