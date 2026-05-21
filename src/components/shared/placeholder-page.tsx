"use client";

import { useTranslations } from "next-intl";
import { Construction } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";

export const PlaceholderPage = () => {
  const t = useTranslations("placeholder");
  return (
    <ParentCard title={t("title")} subtitle={t("body")} titleIcon={Construction}>
      <p className="leading-relaxed text-muted-foreground">{t("body")}</p>
    </ParentCard>
  );
};
