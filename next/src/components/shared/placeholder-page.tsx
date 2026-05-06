"use client";

import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";

export const PlaceholderPage = () => {
  const t = useTranslations("placeholder");
  return (
    <ParentCard title={t("title")} subtitle={t("body")}>
      <p className="leading-relaxed text-muted-foreground">{t("body")}</p>
    </ParentCard>
  );
};
