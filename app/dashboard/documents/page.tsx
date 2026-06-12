import { redirect } from "next/navigation";
import { fetchLatestVisaCaseId } from "@/lib/supabase/visa-case-queries";

export default async function DashboardDocumentsPage() {
  const caseId = await fetchLatestVisaCaseId();
  if (caseId) {
    redirect(`/dashboard/visa-cases/${caseId}#documents`);
  }
  redirect("/dashboard/customer?tab=documents");
}
