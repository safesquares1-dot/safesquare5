/**
 * Auth context: Supabase Auth (email + Google + Microsoft) with localStorage fallback.
 * - When Supabase env vars are set, uses the real client.
 * - Otherwise, falls back to a localStorage-based demo session for instant previews.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "admin" | "practitioner" | "public";
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, full_name: string) => Promise<void>;
  signInOAuth: (provider: "google" | "azure") => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthCtx | null>(null);

const LS_KEY = "ssq_session";

function readLS(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; }
}
function writeLS(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(LS_KEY, JSON.stringify(u));
  else localStorage.removeItem(LS_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (isSupabaseConfigured()) {
        const sb = getSupabase()!;
        const { data } = await sb.auth.getUser();
        if (!mounted) return;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email!, role: (data.user.app_metadata?.role as any) || "public" });
        }
      } else {
        setUser(readLS());
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const signInEmail = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      const sb = getSupabase()!;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data } = await sb.auth.getUser();
      const u = data.user!;
      const next = { id: u.id, email: u.email!, role: (u.app_metadata?.role as any) || "public" } as AuthUser;
      setUser(next);
    } else {
      const res: any = await api.login({ email, password });
      const next: AuthUser = { id: res.user.id, email: res.user.email, full_name: res.user.full_name, role: res.user.role };
      setUser(next); writeLS(next);
    }
  };

  const signUpEmail = async (email: string, password: string, full_name: string) => {
    if (isSupabaseConfigured()) {
      const sb = getSupabase()!;
      const { error } = await sb.auth.signUp({
        email, password, options: { data: { full_name, role: "practitioner" } },
      });
      if (error) throw error;
    } else {
      const res: any = await api.register({ email, password, full_name, role: "practitioner" });
      const next: AuthUser = { id: res.user.id, email: res.user.email, full_name: res.user.full_name, role: "practitioner" };
      setUser(next); writeLS(next);
    }
  };

  const signInOAuth = async (provider: "google" | "azure") => {
    if (!isSupabaseConfigured()) {
      // Demo OAuth
      const next: AuthUser = { id: "demo-oauth", email: `${provider}-user@safesquare.app`, full_name: `${provider} user`, role: "practitioner" };
      setUser(next); writeLS(next);
      return;
    }
    const sb = getSupabase()!;
    await sb.auth.signInWithOAuth({ provider: provider === "azure" ? "azure" : "google", options: { redirectTo: `${location.origin}/dashboard` } });
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) await getSupabase()!.auth.signOut();
    setUser(null); writeLS(null);
    router.push("/");
  };

  return <Ctx.Provider value={{ user, loading, signInEmail, signUpEmail, signInOAuth, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
