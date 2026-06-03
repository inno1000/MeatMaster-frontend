"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/schemas/auth";
import { getMobileDockTabs } from "@/lib/mobile-tab-bar-config";
import { getSimpleMobileDockTabs } from "@/lib/simple-nav-config";
import { MobileMoreSheet } from "@/components/layout/mobile-more-sheet";
import { materialIcon } from "@/lib/material-icon";

const MoreIcon = materialIcon("apps");

type MobileTabBarProps = {
  role: UserRole;
};

export function MobileTabBar({ role }: MobileTabBarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const tNav = useTranslations("nav");
  const tabs =
    role === "admin" ? getMobileDockTabs(role) : getSimpleMobileDockTabs(role);

  return (
    <>
      <nav
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden",
          "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
        )}
        aria-label={tNav("mobileDockLabel")}
      >
        <div
          className={cn(
            "pointer-events-auto mx-3 flex items-center justify-evenly gap-0.5 rounded-2xl px-1.5 py-2",
            "glass-bar shadow-card",
          )}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const label = tNav(tab.titleKey);
            return (
              <Link
                key={`${tab.titleKey}-${tab.href}`}
                href={tab.href}
                className={cn(
                  "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "shrink-0 text-xl",
                    active ? "text-primary-foreground" : "",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "mt-0.5 w-full max-w-[4.25rem] truncate text-center text-[0.625rem] font-semibold leading-tight",
                    active ? "text-primary-foreground" : "",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-muted-foreground hover:text-foreground"
            aria-label={tNav("mobileMore")}
          >
            <MoreIcon className="text-xl" aria-hidden />
            <span className="mt-0.5 w-full max-w-[4.25rem] truncate text-center text-[0.625rem] font-semibold leading-tight">
              {tNav("mobileMore")}
            </span>
          </button>
        </div>
      </nav>
      <MobileMoreSheet
        role={role}
        open={moreOpen}
        onOpenChange={setMoreOpen}
      />
    </>
  );
}
