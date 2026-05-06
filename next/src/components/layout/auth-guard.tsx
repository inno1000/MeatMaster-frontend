"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccessPath, getDefaultPathForRole } from "@/lib/authz";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const setReturnUrl = useAuthStore((s) => s.setReturnUrl);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (!user?.token) {
      setReturnUrl(pathname);
      router.replace("/auth/login");
      return;
    }
    if (!canAccessPath(user.role, pathname)) {
      router.replace(getDefaultPathForRole(user.role));
    }
  }, [mounted, user, router, pathname, setReturnUrl]);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh flex-col gap-4 bg-background p-6">
        <Skeleton className="h-14 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user?.token) {
    return null;
  }

  return <>{children}</>;
};
