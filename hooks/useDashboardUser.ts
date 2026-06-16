"use client";

import { useCallback, useEffect, useState } from "react";
import { checkDatabaseHealth, type DatabaseHealthResult } from "@/lib/supabase/database-health";
import { fetchDashboardUser, type DashboardUserResult } from "@/lib/supabase/queries";
import { getInitials } from "@/lib/supabase/profile-utils";
import { getRoleLabel } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

export interface DashboardUserState {
  loading: boolean;
  result: DashboardUserResult | null;
  displayName: string;
  email: string;
  initials: string;
  roleLabel: string;
  role: UserRole;
  completion: number;
  missingFields: string[];
  verified: boolean;
  databaseHealth: DatabaseHealthResult | null;
  dbLive: boolean;
  refresh: () => void;
}

const FALLBACK = {
  loading: false,
  result: null,
  displayName: "Your Account",
  email: "",
  initials: "GT",
  roleLabel: "Traveler",
  role: "customer" as UserRole,
  completion: 0,
  missingFields: [] as string[],
  verified: false,
  databaseHealth: null as DatabaseHealthResult | null,
  dbLive: false,
};

function buildState(
  result: DashboardUserResult | null,
  health: DatabaseHealthResult | null,
  refresh: () => void,
  loading = false
): DashboardUserState {
  const dbLive = Boolean(
    health?.tables.profiles && health?.tables.user_roles && health?.tables.visa_experts
  );

  if (!result?.ok) {
    return {
      ...FALLBACK,
      loading,
      result,
      databaseHealth: health,
      dbLive,
      refresh,
    };
  }

  const name = result.profile.full_name?.trim() || "Your Account";
  return {
    loading,
    result,
    displayName: name,
    email: result.profile.email,
    initials: getInitials(name),
    roleLabel: getRoleLabel(result.role),
    role: result.role,
    completion: result.completion,
    missingFields: result.missingFields,
    verified: result.visaExpert?.verification_status === "verified",
    databaseHealth: health,
    dbLive,
    refresh,
  };
}

export function useDashboardUser(): DashboardUserState {
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<DashboardUserState>(() =>
    buildState(null, null, () => {}, true)
  );
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setState((prev) => ({ ...prev, loading: true }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchDashboardUser(), checkDatabaseHealth()]).then(([result, health]) => {
      if (cancelled) return;
      setState(buildState(result, health, refresh));
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey, refresh]);

  return state;
}
