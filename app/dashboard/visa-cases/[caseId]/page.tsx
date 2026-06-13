import { Suspense } from "react";
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
    redirect("/dashboard/customer?tab=visa-cases");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-soft flex items-center justify-center"><div className="skeleton h-64 w-full max-w-4xl rounded-2xl" /></div>}>
      <VisaCaseWorkspace
        initialCase={workspace.case}
        storageReady={workspace.storageReady}
      />
    </Suspense>
  );
}
