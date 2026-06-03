"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { materialIcon } from "@/lib/material-icon";
import { getMobileMoreLinks } from "@/lib/mobile-more-config";
import type { UserRole } from "@/lib/schemas/auth";
import { cn } from "@/lib/utils";

const CloseIcon = materialIcon("close");

type MobileMoreSheetProps = {
  role: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileMoreSheet({
  role,
  open,
  onOpenChange,
}: MobileMoreSheetProps) {
  const t = useTranslations("nav");
  const links = getMobileMoreLinks(role);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[min(85vh,32rem)] overflow-y-auto rounded-t-3xl border border-border bg-card p-4 shadow-lg",
            "pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <Dialog.Title className="text-lg font-bold">
              {t("mobileMoreTitle")}
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
              aria-label={t("mobileMoreClose")}
            >
              <CloseIcon className="text-xl" aria-hidden />
            </Dialog.Close>
          </div>
          <ul className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 font-medium hover:bg-muted/60"
                  >
                    <Icon className="text-xl text-primary" aria-hidden />
                    {t(
                      link.titleKey.startsWith("nav.")
                        ? link.titleKey.slice(4)
                        : link.titleKey,
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          {links.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("mobileMoreEmpty")}
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
