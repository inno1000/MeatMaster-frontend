"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Separator from "@radix-ui/react-separator";
import { Menu, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { mainNavigation, type NavEntry } from "@/lib/nav-config";
import { filterNavigationByRole } from "@/lib/authz";
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
import { useAuthStore } from "@/lib/stores/auth-store";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

const navLinkClass = (active: boolean) =>
  cn(
    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm",
    active
      ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
  );

const renderNav = (
  entry: NavEntry,
  pathname: string,
  t: ReturnType<typeof useTranslations>,
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
    const active =
      pathname === entry.href || pathname.startsWith(`${entry.href}/`);
    return (
      <Link
        key={entry.href}
        href={entry.href}
        onClick={onNavigate}
        className={navLinkClass(active)}
      >
        <Icon className="size-5 shrink-0 sm:size-4" aria-hidden />
        {t(entry.titleKey)}
      </Link>
    );
  }

  const GroupIcon = entry.group.icon;
  return (
    <div key={entry.group.titleKey} className="space-y-1">
      <div
        className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold tracking-tight text-muted-foreground sm:text-sm"
        role="presentation"
      >
        <GroupIcon className="size-5 shrink-0 sm:size-4" aria-hidden />
        {t(entry.group.titleKey)}
      </div>
      <div className="space-y-0.5 pl-1 sm:pl-2">
        {entry.group.children.map((child) => {
          const ChildIcon = child.icon;
          const active =
            pathname === child.href || pathname.startsWith(`${child.href}/`);
          return (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm",
                active
                  ? "bg-primary/12 font-medium text-primary shadow-sm ring-1 ring-primary/15"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <ChildIcon
                className="size-4 shrink-0 opacity-70 sm:size-3.5"
                aria-hidden
              />
              {t(child.titleKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  const t = useTranslations();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navEntries = filterNavigationByRole(
    mainNavigation,
    user?.role ?? "butcher",
  );

  const sidebarNav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-y-contain px-2 py-4 pb-safe safe-pad-x">
      {navEntries.map((entry, i) =>
        renderNav(entry, pathname, t, () => setMobileOpen(false), `nav-${i}`),
      )}
      <div className="mt-auto border-t border-border pt-4 text-center">
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
          <header className="safe-pad-t sticky top-0 z-50 flex min-h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-card/90 px-3 shadow-sm shadow-black/[0.03] backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sm:gap-3 sm:px-4 md:px-6">
            <div className="flex shrink-0 md:hidden">
              <Dialog.Trigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="size-5" />
                </Button>
              </Dialog.Trigger>
            </div>
            <div className="flex min-w-0 flex-1 justify-center md:hidden">
              {brand}
            </div>
            <div className="hidden flex-1 md:block" aria-hidden />
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
                    <UserRound className="size-5" />
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
            <Dialog.Content className="fixed start-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(100vw,20rem)] flex-col border-e border-border/60 bg-card/95 shadow-float outline-none backdrop-blur-xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-right">
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

          <main className="safe-pad-x flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[1600px]"
            >
              {children}
            </motion.div>
          </main>

        </div>
      </Dialog.Root>
    </div>
  );
};
