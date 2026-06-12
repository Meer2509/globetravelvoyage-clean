import { redirect } from "next/navigation";
import { fetchLatestVisaCaseId } from "@/lib/supabase/visa-case-queries";

export default async function VisaCasesIndexPage() {
  const latestId = await fetchLatestVisaCaseId();
  if (latestId) {
    redirect(`/dashboard/visa-cases/${latestId}`);
  }
  redirect("/dashboard/customer?tab=visa-case");
}
