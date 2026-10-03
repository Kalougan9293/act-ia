"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/admin/types";

export default function RequireAuth({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, configured, user, profile, profileSettled } = useAuth();
  const rolesKey = useMemo(() => roles.join(","), [roles]);
  const allowed = !!profile && roles.includes(profile.role);
  const waiting = !ready || (!!user && !profileSettled);

  useEffect(() => {
    if (waiting) return;
    if (!configured || !user || !allowed) {
      const next = pathname && pathname !== "/connexion" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/connexion${next}`);
    }
  }, [waiting, configured, user, allowed, rolesKey, router, pathname]);

  if (waiting || !user || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Vérification de la session…
      </div>
    );
  }

  return <>{children}</>;
}
