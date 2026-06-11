import { getCheckoutProduct } from "@/lib/stripe/products";

export function formatPaymentAmount(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount));
}

export function formatPaymentDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function paymentServiceLabel(serviceType: string | null, description: string | null): string {
  if (description) return description;
  if (!serviceType) return "Payment";
  const product = getCheckoutProduct(serviceType);
  return product?.name ?? serviceType.replace(/_/g, " ");
}
