"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useTranslations } from "next-intl";
import { iconSettingsGroup } from "@/lib/icons";
import { ParentCard } from "@/components/shared/parent-card";
import { Label } from "@/components/ui/label";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

function SettingsPreferencesPage() {
  const t = useTranslations("settings.preferences");

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      <ParentCard title={t("title")} titleIcon={iconSettingsGroup}>
        <div className="space-y-3">
          <Label>{t("language")}</Label>
          <p className="text-sm text-muted-foreground">{t("languageHint")}</p>
          <LocaleSwitcher />
        </div>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(SettingsPreferencesPage);
