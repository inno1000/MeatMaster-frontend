"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { canAccessPath, getDefaultPathForRole } from "@/lib/authz";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const setReturnUrl = useAuthStore((s) => s.setReturnUrl);
  const pathname = usePathname();
  const router = useRouter();

  /** Anciennes sessions JSON : `caissier` → `supplier` avant contrôle d’accès. */
  useLayoutEffect(() => {
    if (!user?.token) {
      return;
    }
    if ((user.role as string) === "caissier") {
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
    if (!canAccessPath(user.role, pathname)) {
      router.replace(getDefaultPathForRole(user.role));
    }
  }, [user, router, pathname, setReturnUrl]);

  if (!user?.token) {
    return null;
  }

  return <>{children}</>;
};
