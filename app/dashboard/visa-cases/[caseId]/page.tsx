import { redirect } from "next/navigation";
import { VisaCaseWorkspace } from "@/components/VisaCaseWorkspace";
import { loadVisaCaseWorkspace } from "@/lib/supabase/visa-case-queries";

export default async function VisaCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const workspace = await loadVisaCaseWorkspace(caseId);

  if (!workspace) {
    const { fetchLatestVisaCaseId } = await import("@/lib/supabase/visa-case-queries");
    const latestId = await fetchLatestVisaCaseId();
    if (latestId && latestId !== caseId) {
      redirect(`/dashboard/visa-cases/${latestId}`);
    }
    redirect("/dashboard/customer?tab=visa-case");
  }

  return (
    <VisaCaseWorkspace
      initialCase={workspace.case}
      storageReady={workspace.storageReady}
    />
  );
}
