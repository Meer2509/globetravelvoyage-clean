"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  createClient,
  getDashboardUrl,
  isSupabaseConfigured,
  resolveUserRole,
} from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

export interface AuthSessionState {
  loading: boolean;
  isLoggedIn: boolean;
  email: string | null;
  role: UserRole | null;
  dashboardUrl: string;
}

const GUEST: AuthSessionState = {
  loading: true,
  isLoggedIn: false,
  email: null,
  role: null,
  dashboardUrl: "/dashboard",
};

export function useAuthSession(): AuthSessionState {
  const pathname = usePathname();
  const [state, setState] = useState<AuthSessionState>(() =>
    isSupabaseConfigured ? GUEST : { ...GUEST, loading: false }
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    if (!supabase) return;

    const client = supabase;
    let cancelled = false;

    async function load() {
      const { data: { user } } = await client.auth.getUser();
      if (cancelled) return;

      if (!user) {
        setState({ ...GUEST, loading: false });
        return;
      }

      const role = await resolveUserRole(user);
      setState({
        loading: false,
        isLoggedIn: true,
        email: user.email ?? null,
        role,
        dashboardUrl: getDashboardUrl(role),
      });
    }

    load();

    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname]);

  return state;
}
