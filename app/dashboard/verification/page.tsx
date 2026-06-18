import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-server";
import { fetchMyVerificationProfiles } from "@/lib/trust/verification-actions";
import { ProviderVerificationCenter } from "@/components/trust/ProviderVerificationCenter";

const PROVIDER_ROLES = new Set(["visa_agent", "travel_agency", "tour_guide", "property_host", "admin"]);

export default async function DashboardVerificationPage() {
  const auth = await requireSession();
  if (!auth.ok) redirect("/login?next=/dashboard/verification");

  if (!PROVIDER_ROLES.has(auth.role)) {
    redirect("/dashboard/customer");
  }

  const result = await fetchMyVerificationProfiles();

  return (
    <div className="min-h-screen bg-soft">
      <div className="container-px py-10 max-w-3xl">
        <ProviderVerificationCenter
          initialProfiles={result.ok ? result.profiles : []}
          trustScore={result.ok ? result.trustScore : null}
        />
      </div>
    </div>
  );
}
