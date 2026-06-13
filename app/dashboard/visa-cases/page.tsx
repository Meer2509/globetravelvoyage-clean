import Link from "next/link";
import { fetchCustomerVisaCases } from "@/lib/supabase/visa-case-queries";
import { VisaCasesList } from "@/components/VisaCasesList";
import { customerDashboardPath } from "@/lib/dashboard-routes";

export default async function VisaCasesIndexPage() {
  const cases = await fetchCustomerVisaCases();
  return (
    <>
      <VisaCasesList cases={cases} />
      {cases.length > 0 && (
        <div className="container-px pb-10 max-w-3xl mx-auto">
          <Link href={customerDashboardPath("visa-cases")} className="text-sm font-semibold text-blue hover:underline">
            View in dashboard →
          </Link>
        </div>
      )}
    </>
  );
}
