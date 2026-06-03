"use client";

import { iconLanguage } from "@/lib/icons";

const LanguageIcon = iconLanguage;
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LABELS: Record<(typeof routing.locales)[number], string> = {
  fr: "FR",
  en: "EN",
  ar: "العربية",
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("switchLanguage")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1",
        className,
      )}
    >
      <span
        className="hidden size-9 shrink-0 items-center justify-center sm:inline-flex"
        aria-hidden
      >
        <LanguageIcon className="text-lg leading-none text-muted-foreground" />
      </span>
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          type="button"
          variant={locale === loc ? "primary" : "ghost"}
          size="default"
          className={cn(
            "h-9 min-h-9 rounded-full px-2.5 text-xs font-semibold sm:px-3.5 sm:text-sm",
            loc === "ar" && "min-w-[4.5rem] font-medium",
            locale !== loc && "hover:bg-background/80",
          )}
          onClick={() => {
            router.replace(pathname, { locale: loc });
          }}
          aria-current={locale === loc ? "true" : undefined}
          aria-pressed={locale === loc}
        >
          {LABELS[loc]}
        </Button>
      ))}
    </div>
  );
}
