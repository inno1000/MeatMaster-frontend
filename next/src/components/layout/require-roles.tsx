"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { getDefaultPathForRole, normalizeAppRole } from "@/lib/authz";
import type { UserRole } from "@/lib/schemas/auth";
import { useRouter } from "@/i18n/navigation";
import { useEffect, type ReactNode } from "react";

/** Redirige si le rôle courant n’est pas autorisé (garde complémentaire à `AuthGuard`). */
export const RequireRoles = ({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) => {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const appRole = normalizeAppRole(user?.role);

  useEffect(() => {
    if (!user?.token) {
      return;
    }
    if (!roles.includes(appRole)) {
      router.replace(getDefaultPathForRole(appRole));
    }
  }, [user?.token, appRole, roles, router]);

  if (!user?.token || !roles.includes(appRole)) {
    return null;
  }

  return <>{children}</>;
};
