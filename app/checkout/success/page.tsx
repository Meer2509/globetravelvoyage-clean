import { redirect } from "next/navigation";

export default async function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; plan?: string; amount?: string }>;
}) {
  const params = await searchParams;
  if (params.session_id) {
    redirect(`/payment-success?session_id=${encodeURIComponent(params.session_id)}`);
  }
  redirect("/payment-success");
}
