"use client";

import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";

export default function AdminPlatformPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("platformTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("platformSubtitle")}
        </p>
      </div>
      <ParentCard title={t("coordinationTitle")}>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{t("coordinationPoint1")}</li>
          <li>{t("coordinationPoint2")}</li>
          <li>{t("coordinationPoint3")}</li>
        </ul>
      </ParentCard>
      <ParentCard title={t("configTitle")}>
        <p className="text-sm text-muted-foreground">{t("configBody")}</p>
      </ParentCard>
    </div>
  );
}
