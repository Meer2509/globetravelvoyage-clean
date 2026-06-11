import { redirect } from "next/navigation";

export default function CheckoutCanceledRedirect() {
  redirect("/payment-cancelled");
}
