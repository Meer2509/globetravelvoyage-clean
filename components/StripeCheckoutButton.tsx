"use client";

import { useState } from "react";
import Link from "next/link";
import { isStripeConfigured } from "@/lib/stripe";
import type { CheckoutProductKey } from "@/lib/stripe/products";

export interface CheckoutMeta {
  agentId?: string;
  listingId?: string;
  listingTitle?: string;
  listingType?: string;
  providerUserId?: string;
}

export function StripeCheckoutButton({
  productKey,
  providerServiceId,
  checkoutMeta,
  label,
  className = "btn-primary px-5 py-2.5 text-sm",
  fullWidth = false,
}: {
  productKey?: CheckoutProductKey;
  providerServiceId?: string;
  checkoutMeta?: CheckoutMeta;
  label: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!providerServiceId && !productKey) {
      setError("No product selected.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = providerServiceId
        ? { providerServiceId }
        : {
            productKey,
            agentId: checkoutMeta?.agentId,
            listingId: checkoutMeta?.listingId,
            listingTitle: checkoutMeta?.listingTitle,
            listingType: checkoutMeta?.listingType,
            providerUserId: checkoutMeta?.providerUserId,
          };

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { url?: string; error?: string; paymentRecordSaved?: boolean };
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
        <p className="text-xs text-muted">
          Premium checkout is temporarily unavailable. Please try again later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
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
