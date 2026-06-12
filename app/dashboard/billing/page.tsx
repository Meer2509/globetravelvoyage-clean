import { redirect } from "next/navigation";

export default function DashboardBillingPage() {
  redirect("/dashboard/customer?tab=billing");
}
