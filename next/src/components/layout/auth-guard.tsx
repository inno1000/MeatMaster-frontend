"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";
import {
  canAccessPath,
  getDefaultPathForRole,
  normalizeAppRole,
} from "@/lib/authz";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const setReturnUrl = useAuthStore((s) => s.setReturnUrl);
  const pathname = usePathname();
  const router = useRouter();

  /** Anciennes sessions persistées avec un rôle API brut (`caissier` / `fournisseur`) → `supplier`. */
  useLayoutEffect(() => {
    if (!user?.token) {
      return;
    }
    const raw = user.role as string;
    if (raw === "caissier" || raw === "fournisseur") {
      useAuthStore.setState({
        user: { ...user, role: "supplier" },
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.token) {
      setReturnUrl(pathname);
      router.replace("/auth/login");
      return;
    }
    if (user.mustChangePassword === true) {
      const onFirstPassword =
        pathname === "/settings/first-password" ||
        pathname.startsWith("/settings/first-password/");
      if (!onFirstPassword) {
        router.replace("/settings/first-password");
      }
      return;
    }
    const appRole = normalizeAppRole(user.role);
    if (!canAccessPath(appRole, pathname)) {
      router.replace(getDefaultPathForRole(appRole));
    }
  }, [user, router, pathname, setReturnUrl]);

  if (!user?.token) {
    return null;
  }

  return <>{children}</>;
};
