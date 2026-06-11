"use client";

import { useState } from "react";
import Link from "next/link";
import { isStripeConfigured } from "@/lib/stripe";
import type { CheckoutProductKey } from "@/lib/stripe/products";

export function StripeCheckoutButton({
  productKey,
  label,
  className = "btn-primary px-5 py-2.5 text-sm",
  fullWidth = false,
}: {
  productKey: CheckoutProductKey;
  label: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!isStripeConfigured) {
    return (
      <div className="space-y-2">
        <button type="button" disabled className={`${className} opacity-60 cursor-not-allowed ${fullWidth ? "w-full" : ""}`}>
          {label}
        </button>
        <p className="text-xs text-charcoal/55">
          Stripe is not configured.{" "}
          <Link href="/admin/setup" className="font-semibold text-blue hover:underline">
            Add keys in setup →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {error && (
        <p className="mb-2 text-xs text-red-600">{error}</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={handleCheckout}
        className={`${className} disabled:opacity-60 ${fullWidth ? "w-full" : ""}`}
      >
        {loading ? "Redirecting to Stripe…" : label}
      </button>
    </div>
  );
}
