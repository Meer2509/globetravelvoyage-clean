import { redirect } from "next/navigation";
import { customerDashboardPath } from "@/lib/dashboard-routes";

export default function DashboardSupportPage() {
  redirect(customerDashboardPath("support"));
}
