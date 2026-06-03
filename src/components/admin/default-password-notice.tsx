"use client";

import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDefaultNewUserPassword } from "@/lib/default-password";

/** Rappel visible du mot de passe provisoire attribué à la création d’un compte admin. */
export function DefaultPasswordNotice() {
  const t = useTranslations("admin");
  const password = getDefaultNewUserPassword();

  return (
    <Alert className="mb-4 border-primary/25 bg-primary/5">
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="font-semibold leading-snug">{t("defaultPasswordTitle")}</p>
          <AlertDescription className="text-muted-foreground">
            {t("defaultPasswordHint")}
          </AlertDescription>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("defaultPasswordValueLabel")}</p>
            <p className="break-all font-mono text-base font-semibold tracking-tight">
              {password}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{t("defaultPasswordFirstLogin")}</p>
        </div>
      </div>
    </Alert>
  );
}
