import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/supabase/types";

/** Service-role role sync for trusted server paths (auth callback, onboarding). */
export async function applyUserRole(userId: string, role: UserRole): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase is not configured." };

  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  if (metaError) return { ok: false, error: metaError.message };

  await admin.from("user_roles").delete().eq("user_id", userId).eq("is_primary", true);

  const { error: roleError } = await admin.from("user_roles").upsert(
    { user_id: userId, role, is_primary: true },
    { onConflict: "user_id,role" }
  );
  if (roleError) return { ok: false, error: roleError.message };

  return { ok: true };
}
