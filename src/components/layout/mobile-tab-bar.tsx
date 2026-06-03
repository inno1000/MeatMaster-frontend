"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/schemas/auth";
import { getMobileDockTabs } from "@/lib/mobile-tab-bar-config";
import { getSimpleMobileDockTabs } from "@/lib/simple-nav-config";
import { useSimpleMode } from "@/lib/hooks/use-simple-mode";

type MobileTabBarProps = {
  role: UserRole;
};

export function MobileTabBar({ role }: MobileTabBarProps) {
  const pathname = usePathname();
  const simpleMode = useSimpleMode();
  const tNav = useTranslations("nav");
  const tRoot = useTranslations();
  const tabs = simpleMode ? getSimpleMobileDockTabs(role) : getMobileDockTabs(role);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/85",
        "tap-highlight-transparent",
        "pb-[env(safe-area-inset-bottom,0px)]",
      )}
      aria-label={tNav("mobileDockLabel")}
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-evenly gap-1 px-3 py-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={`${tab.titleKey}-${tab.href}`}
              href={tab.href}
              className={cn(
                "flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition-colors duration-150",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-primary/14 text-primary" : "bg-transparent",
                )}
              >
                <Icon className="size-5 shrink-0 stroke-[1.75]" aria-hidden />
              </span>
              <span
                className={cn(
                  "w-full max-w-[4.5rem] truncate text-center text-[0.6875rem] font-medium leading-tight",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {simpleMode ? tRoot(tab.titleKey) : tNav(tab.titleKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
