"use client";

import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollRegion } from "@/components/ui/scroll-region";

const ROWS = [
  {
    date: "2024-01-15 10:30",
    type: "Réception",
    meat: "Bœuf",
    qty: 25,
    user: "Admin",
  },
  {
    date: "2024-01-15 11:15",
    type: "Vente",
    meat: "Mouton",
    qty: 8,
    user: "Caisse",
  },
];

export default function StockJournalPage() {
  const t = useTranslations("stockJournal");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </div>
      <ParentCard title={t("filters")}>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">{t("from")}</Label>
            <Input id="from" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">{t("to")}</Label>
            <Input id="to" type="date" />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline">
              {t("export")}
            </Button>
          </div>
        </div>
      </ParentCard>
      <ParentCard title={t("title")}>
        <ScrollRegion>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableType")}</th>
                <th className="p-3">{t("tableMeat")}</th>
                <th className="p-3">{t("tableQty")}</th>
                <th className="p-3">{t("tableUser")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.date} className="border-b border-border">
                  <td className="p-3">{row.date}</td>
                  <td className="p-3">{row.type}</td>
                  <td className="p-3">{row.meat}</td>
                  <td className="p-3">{row.qty}</td>
                  <td className="p-3">{row.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>
    </div>
  );
}
