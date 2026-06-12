import Link from "next/link";

const TRUST_ITEMS = [
  {
    icon: "🔒",
    title: "Secure checkout powered by Stripe",
    text: "Premium services use Stripe Checkout. Clear pricing before you pay.",
  },
  {
    icon: "✓",
    title: "Provider profiles reviewed by Globe Travel Voyage",
    text: "We review provider listings. Verified badges require admin approval.",
  },
  {
    icon: "🛂",
    title: "Visa approval is never guaranteed",
    text: "Embassies and consulates make all visa decisions. We offer preparation support only.",
  },
  {
    icon: "📁",
    title: "Document privacy matters",
    text: "Your documents are stored securely. We do not share files without your consent.",
  },
  {
    icon: "📋",
    title: "Case tracking for paid services",
    text: "After purchase, track your visa case, checklist, and status in your dashboard.",
  },
  {
    icon: "💬",
    title: "Support through your dashboard",
    text: "Message support and upload documents from your account — no hidden fees.",
  },
];

export function TrustSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "py-8" : "section bg-soft/50"}>
      <div className="container-px">
        <div className="text-center mb-8">
          <span className="eyebrow">Trust & transparency</span>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
            Built for honest premium travel
          </h2>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted">
            Globe Travel Voyage is an independent marketplace — not a government agency, embassy, or immigration lawyer.
          </p>
        </div>
        <div className={`grid gap-4 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="card p-5 border border-soft-200">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="mt-3 text-sm font-bold text-navy">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Questions?{" "}
          <Link href="/support" className="font-semibold text-blue hover:underline">
            Contact support
          </Link>
          {" "}·{" "}
          <Link href="/legal/disclaimer" className="font-semibold text-blue hover:underline">
            Full disclaimer
          </Link>
        </p>
      </div>
    </section>
  );
}
