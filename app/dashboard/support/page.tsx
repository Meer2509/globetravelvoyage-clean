import { redirect } from "next/navigation";

export default function DashboardSupportPage() {
  redirect("/dashboard/customer?tab=support");
}
