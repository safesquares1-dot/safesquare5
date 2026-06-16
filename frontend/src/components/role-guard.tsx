"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

/**
 * Route guard. Use: <RoleGuard allow={["admin","practitioner"]}><Page/></RoleGuard>
 */
export function RoleGuard({ allow, children }: { allow: ("admin" | "practitioner" | "public")[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;
    if (!user) { router.replace(`/login?next=${encodeURIComponent(pathname)}`); return; }
    if (!allow.includes(user.role)) { router.replace("/"); }
  }, [user, loading, allow, router, pathname]);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-teal" />
      </div>
    );
  }
  if (!user || !allow.includes(user.role)) return null;
  return <>{children}</>;
}
