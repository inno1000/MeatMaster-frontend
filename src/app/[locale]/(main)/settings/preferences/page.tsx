"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useTranslations } from "next-intl";
import { Settings2, Sparkles } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Label } from "@/components/ui/label";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { normalizeAppRole } from "@/lib/authz";
import { cn } from "@/lib/utils";

function SettingsPreferencesPage() {
  const t = useTranslations("settings.preferences");
  const tSimple = useTranslations("simple");
  const simpleMode = usePreferencesStore((s) => s.simpleMode);
  const setSimpleMode = usePreferencesStore((s) => s.setSimpleMode);
  const role = useAuthStore((s) => s.user?.role);
  const appRole = normalizeAppRole(role);
  const canUseSimpleMode = appRole === "butcher" || appRole === "supplier";

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      {canUseSimpleMode ? (
        <ParentCard title={t("simpleMode")} titleIcon={Sparkles}>
          <p className="mb-4 text-sm text-muted-foreground">{t("simpleModeHint")}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSimpleMode(false)}
              className={cn(
                "min-h-14 rounded-xl border-2 px-4 text-lg font-semibold transition-colors",
                !simpleMode
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border bg-card",
              )}
            >
              {t("simpleModeOff")}
            </button>
            <button
              type="button"
              onClick={() => setSimpleMode(true)}
              className={cn(
                "min-h-14 rounded-xl border-2 px-4 text-lg font-semibold transition-colors",
                simpleMode
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-border bg-card",
              )}
            >
              {t("simpleModeOn")}
            </button>
          </div>
          {simpleMode ? (
            <p className="mt-3 text-center text-sm font-medium text-primary">
              {tSimple("dashboardShortcuts")}
            </p>
          ) : null}
        </ParentCard>
      ) : null}

      <ParentCard title={t("title")} titleIcon={Settings2}>
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
