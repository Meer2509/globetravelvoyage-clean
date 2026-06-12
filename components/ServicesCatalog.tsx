import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import {
  SERVICE_CATEGORIES,
  getProductsByCategory,
  type CheckoutProductKey,
} from "@/lib/stripe/products";

const CATEGORY_ANCHOR: Record<string, string> = {
  "Visa Services": "visa",
  "AI Travel": "ai-travel",
  "Provider Services": "providers",
  "Travel Requests": "travel-requests",
};

export function ServicesCatalog({ keys }: { keys?: CheckoutProductKey[] }) {
  if (keys?.length) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keys.map((key) => (
          <ServiceCard key={key} productKey={key} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {SERVICE_CATEGORIES.map((category) => {
        const products = getProductsByCategory(category);
        const anchor = CATEGORY_ANCHOR[category] ?? category.toLowerCase();
        return (
          <section key={category} id={anchor} className="scroll-mt-28">
            <h2 className="mb-4 text-xl font-extrabold text-navy">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ServiceCard key={p.key} productKey={p.key} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function StripeTrustBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-center text-sm text-navy ${className}`}>
      <span className="font-semibold">🔒 Secure checkout powered by Stripe.</span>
      {" "}Card payments are processed by Stripe — we never store your card details.
    </div>
  );
}

export function ServicesPageHeader() {
  return (
    <div className="bg-hero-gradient py-14">
      <div className="container-px">
        <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-white transition-colors">
          ← Home
        </Link>
        <span className="eyebrow-white mb-3">Paid services</span>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Book a real service today</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-dark">
          Visa consultations, AI travel plans, provider listings, and travel requests — pay securely and get instant confirmation.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((c) => (
            <a
              key={c}
              href={`#${CATEGORY_ANCHOR[c]}`}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:border-gold hover:bg-white/15 transition-colors"
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
