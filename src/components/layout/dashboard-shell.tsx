"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { iconChevronDown, iconMenu, iconUserMenu } from "@/lib/icons";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { mainNavigation, type NavEntry } from "@/lib/nav-config";
import { getSimpleNavigation } from "@/lib/simple-nav-config";
import { filterNavigationByRole, normalizeAppRole } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLogo } from "@/components/shared/app-logo";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  useCallback,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";

const navRootLinkBase =
  "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm";

const navChildLinkBase =
  "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm";

const navLinkActiveClass =
  "bg-primary/12 font-medium text-primary ring-1 ring-primary/15 shadow-none";

const pathMatchesNavHref = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const ChevronIcon = iconChevronDown;
const MenuIcon = iconMenu;
const UserMenuIcon = iconUserMenu;

/** Groupe dont une entrée enfant correspond à la page courante (pour ouvrir un seul bloc). */
const getActiveGroupTitleKey = (
  entries: NavEntry[],
  pathname: string,
): string | null => {
  for (const entry of entries) {
    if (entry.type !== "group") continue;
    for (const child of entry.group.children) {
      if (pathMatchesNavHref(child.href, pathname)) {
        return entry.group.titleKey;
      }
    }
  }
  return null;
};

const renderNav = (
  entry: NavEntry,
  pathname: string,
  t: ReturnType<typeof useTranslations>,
  expandedGroupKeys: Set<string>,
  toggleGroup: (groupTitleKey: string) => void,
  onNavigate?: () => void,
  keyPrefix = "",
) => {
  if (entry.type === "divider") {
    return (
      <Separator.Root
        key={`${keyPrefix}-div`}
        className="my-2 h-px bg-border"
      />
    );
  }

  if (entry.type === "link") {
    const Icon = entry.icon;
    const active = pathMatchesNavHref(entry.href, pathname);
    return (
      <Link
        key={entry.href}
        href={entry.href}
        onClick={onNavigate}
        className={cn(
          navRootLinkBase,
          active
            ? navLinkActiveClass
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "shrink-0 text-xl sm:text-lg",
            active ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden
        />
        {t(entry.titleKey)}
      </Link>
    );
  }

  const GroupIcon = entry.group.icon;
  const groupKey = entry.group.titleKey;
  const isExpanded = expandedGroupKeys.has(groupKey);

  return (
    <div key={groupKey} className="space-y-1">
      <button
        type="button"
        onClick={() => toggleGroup(groupKey)}
        aria-expanded={isExpanded}
        className={cn(
          "flex w-full min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-muted/35 px-3 py-2.5 text-start text-base font-semibold tracking-tight text-foreground transition-colors hover:bg-muted/55 sm:text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <GroupIcon
          className="shrink-0 text-xl text-muted-foreground sm:text-lg"
          aria-hidden
        />
        <span className="min-w-0 flex-1 leading-snug">
          {t(entry.group.titleKey)}
        </span>
        <ChevronIcon
          className={cn(
            "shrink-0 text-lg opacity-70 transition-transform duration-200",
            isExpanded ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>
      {isExpanded ? (
        <div className="space-y-0.5 pl-1 sm:pl-2">
          {entry.group.children.map((child) => {
            const ChildIcon = child.icon;
            const active = pathMatchesNavHref(child.href, pathname);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  navChildLinkBase,
                  active
                    ? navLinkActiveClass
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <ChildIcon
                  className={cn(
                    "shrink-0 text-lg opacity-70 sm:text-base",
                    active ? "text-primary opacity-100" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                {t(child.titleKey)}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const appRole = normalizeAppRole(user?.role);
  const useSimplifiedNav = appRole !== "admin";

  const navEntries = useSimplifiedNav
    ? getSimpleNavigation(appRole)
    : filterNavigationByRole(mainNavigation, appRole);

  /** À chaque changement de route ou de rôle : un seul bloc ouvert, celui de la page courante. */
  useLayoutEffect(() => {
    const entries = useSimplifiedNav
      ? getSimpleNavigation(appRole)
      : filterNavigationByRole(mainNavigation, appRole);
    const key = getActiveGroupTitleKey(entries, pathname);
    setExpandedGroupKeys(key ? new Set([key]) : new Set());
  }, [pathname, appRole, useSimplifiedNav]);

  const toggleGroup = useCallback((groupTitleKey: string) => {
    setExpandedGroupKeys((prev) => {
      if (prev.has(groupTitleKey)) {
        return new Set();
      }
      return new Set([groupTitleKey]);
    });
  }, []);

  const sidebarNav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-y-contain px-3 py-4 safe-pad-x">
      <div className="flex flex-col gap-1">
        {navEntries.map((entry, i) =>
          renderNav(
            entry,
            pathname,
            t,
            expandedGroupKeys,
            toggleGroup,
            () => setMobileOpen(false),
            `nav-${i}`,
          ),
        )}
      </div>
      <div className="mt-auto border-t border-border/60 px-1 pt-4 pb-2 text-center">
        <span className="text-xs text-muted-foreground">
          {t("common.appName")} {t("common.version")}
        </span>
      </div>
    </nav>
  );

  const brand = (
    <div className="flex min-h-11 min-w-0 items-center">
      <AppLogo variant="sidebar" alt="" />
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-app">
      <aside className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-e border-border/60 bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 md:flex">
        <div className="flex min-h-14 items-center border-b border-border/60 px-4">
          {brand}
        </div>
        {sidebarNav}
      </aside>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex min-h-dvh min-w-0 min-h-0 flex-1 flex-col">
          <header className="safe-pad-t sticky top-0 z-50 flex min-h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-card/95 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/85 sm:gap-3 sm:px-4 md:px-6">
            <div className="flex shrink-0 items-center gap-2">
              <div className="md:hidden">
                <Dialog.Trigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("nav.openMenu")}
                  >
                    <MenuIcon className="text-xl" />
                  </Button>
                </Dialog.Trigger>
              </div>
            </div>
            <div className="min-w-0 flex-1" aria-hidden />
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LocaleSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label={t("nav.userMenu")}
                  >
                    <UserMenuIcon className="text-xl" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      {t("nav.settingsProfile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => logout()}
                  >
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
            <Dialog.Content className="fixed start-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(100vw,20rem)] flex-col border-e border-border/60 bg-card/95 outline-none backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-right">
              <Dialog.Title className="sr-only">{t("nav.openMenu")}</Dialog.Title>
              <Dialog.Description className="sr-only">
                {t("common.appName")}
              </Dialog.Description>
              <div className="safe-pad-t flex min-h-14 shrink-0 items-center border-b border-border/60 px-4">
                {brand}
              </div>
              {sidebarNav}
            </Dialog.Content>
          </Dialog.Portal>

          <main className="safe-pad-x flex-1 overflow-y-auto overflow-x-hidden px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-4 sm:pt-6 md:px-8 md:pb-10 md:pt-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[1600px]"
            >
              {children}
            </motion.div>
          </main>

          <MobileTabBar role={appRole} />
        </div>
      </Dialog.Root>
    </div>
  );
};
