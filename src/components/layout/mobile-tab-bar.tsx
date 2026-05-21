"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/schemas/auth";
import { getMobileDockTabs } from "@/lib/mobile-tab-bar-config";

type MobileTabBarProps = {
  role: UserRole;
};

export function MobileTabBar({ role }: MobileTabBarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tabs = getMobileDockTabs(role);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-border/60 bg-card/85 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75",
        "pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1",
        "tap-highlight-transparent",
      )}
      aria-label={t("mobileDockLabel")}
    >
      <div className="mx-auto flex w-full max-w-2xl items-end justify-around gap-0 px-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={`${tab.titleKey}-${tab.href}`}
              href={tab.href}
              className={cn(
                "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors duration-150",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl transition-colors",
                  active ? "bg-primary/14 text-primary" : "bg-transparent",
                )}
              >
                <Icon className="size-[1.35rem] shrink-0 stroke-[1.75]" aria-hidden />
              </span>
              <span
                className={cn(
                  "max-w-full truncate px-0.5 text-[0.65rem] font-medium leading-none tracking-tight",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {t(tab.titleKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
