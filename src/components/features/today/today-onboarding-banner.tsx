"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/schemas/auth";

const STORAGE_KEY = "meatmaster-today-onboarding-dismissed";

export function TodayOnboardingBanner({ role }: { role: UserRole }) {
  const t = useTranslations("dashboard.today.onboarding");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const steps =
    role === "supplier"
      ? [t("step1Supplier"), t("step2Supplier"), t("step3Supplier")]
      : [t("step1Butcher"), t("step2Butcher"), t("step3Butcher")];

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-4 sm:px-5">
      <p className="font-bold text-foreground">{t("title")}</p>
      <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        {t("dismiss")}
      </Button>
    </div>
  );
}
