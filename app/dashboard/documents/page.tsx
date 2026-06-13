import { redirect } from "next/navigation";
import { customerDashboardPath } from "@/lib/dashboard-routes";

export default function DashboardDocumentsPage() {
  redirect(customerDashboardPath("documents"));
}
