"use client";

import { useCallback, useEffect, useState } from "react";
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
  setupMessage: string | null;
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
  setupMessage: null,
};

function buildState(
  result: DashboardUserResult | null,
  refresh: () => void,
  loading = false
): DashboardUserState {
  if (!result?.ok) {
    return {
      ...FALLBACK,
      loading,
      result,
      refresh,
      setupMessage:
        result?.reason === "table_missing" || result?.reason === "not_configured"
          ? result.message
          : null,
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
    setupMessage: null,
    refresh,
  };
}

export function useDashboardUser(): DashboardUserState {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const [state, setState] = useState<DashboardUserState>(() =>
    buildState(null, refresh, true)
  );

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    fetchDashboardUser().then((result) => {
      if (cancelled) return;
      setState(buildState(result, refresh));
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, refresh]);

  return state;
}
