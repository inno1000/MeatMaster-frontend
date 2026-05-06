"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { cn } from "@/lib/utils";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STOCK_DATA = [
  {
    id: 1,
    name: "Bœuf",
    currentStock: 45,
    minThreshold: 20,
    maxThreshold: 100,
    unit: "kg",
    price: 2500,
    lastUpdated: "2024-01-15",
    status: "normal" as const,
  },
  {
    id: 2,
    name: "Mouton",
    currentStock: 15,
    minThreshold: 20,
    maxThreshold: 80,
    unit: "kg",
    price: 3000,
    lastUpdated: "2024-01-14",
    status: "low" as const,
  },
  {
    id: 3,
    name: "Chèvre",
    currentStock: 8,
    minThreshold: 15,
    maxThreshold: 60,
    unit: "kg",
    price: 2800,
    lastUpdated: "2024-01-13",
    status: "critical" as const,
  },
  {
    id: 4,
    name: "Poulet",
    currentStock: 67,
    minThreshold: 30,
    maxThreshold: 120,
    unit: "kg",
    price: 2000,
    lastUpdated: "2024-01-15",
    status: "normal" as const,
  },
];

const HISTORY = [
  {
    id: 1,
    type: "reception",
    meatType: "Bœuf",
    quantity: 25,
    date: "2024-01-15",
    time: "10:30",
    user: "Boucher A",
  },
  {
    id: 2,
    type: "vente",
    meatType: "Mouton",
    quantity: 8,
    date: "2024-01-15",
    time: "11:15",
    user: "Boucher B",
  },
];

export const StockManagementView = () => {
  const t = useTranslations("stockManagement");
  const [meatFilter, setMeatFilter] = useState("");
  const [movFilter, setMovFilter] = useState<string | "">("");

  const totalValue = useMemo(
    () =>
      STOCK_DATA.reduce((acc, m) => acc + m.currentStock * m.price, 0),
    [],
  );

  const lowCount = STOCK_DATA.filter(
    (m) => m.status === "low" || m.status === "critical",
  ).length;

  const filteredHistory = useMemo(() => {
    let rows = HISTORY;
    if (meatFilter) {
      rows = rows.filter((r) =>
        r.meatType.toLowerCase().includes(meatFilter.toLowerCase()),
      );
    }
    if (movFilter) {
      rows = rows.filter((r) => r.type === movFilter);
    }
    return rows;
  }, [meatFilter, movFilter]);

  const statusBadge = (status: (typeof STOCK_DATA)[number]["status"]) => {
    const map = {
      normal: "bg-emerald-500/15 text-emerald-900",
      low: "bg-amber-500/15 text-amber-900",
      critical: "bg-red-500/15 text-red-900",
    };
    return map[status];
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("totalValue")}</p>
          <p className="text-2xl font-semibold">
            {totalValue.toLocaleString()} FCFA
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("lowStock")}</p>
          <p className="text-2xl font-semibold text-amber-700">{lowCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("criticalStock")}</p>
          <p className="text-2xl font-semibold text-red-700">
            {STOCK_DATA.filter((m) => m.status === "critical").length}
          </p>
        </div>
      </div>

      <ParentCard title={t("filters")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meat">{t("meatType")}</Label>
            <Input
              id="meat"
              value={meatFilter}
              onChange={(e) => setMeatFilter(e.target.value)}
              placeholder={t("meatType")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mov">{t("movementType")}</Label>
            <select
              id="mov"
              value={movFilter}
              onChange={(e) => setMovFilter(e.target.value)}
              className={nativeSelectClass}
            >
              <option value="">{t("all")}</option>
              <option value="reception">Réception</option>
              <option value="vente">Vente</option>
            </select>
          </div>
        </div>
      </ParentCard>

      <ParentCard title={t("title")}>
        <ScrollRegion>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 font-medium">{t("tableMeat")}</th>
                <th className="p-3 font-medium">{t("tableStock")}</th>
                <th className="p-3 font-medium">{t("tableThreshold")}</th>
                <th className="p-3 font-medium">{t("tablePrice")}</th>
                <th className="p-3 font-medium">{t("tableStatus")}</th>
                <th className="p-3 font-medium">{t("tableDate")}</th>
              </tr>
            </thead>
            <tbody>
              {STOCK_DATA.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">
                    {row.currentStock} {row.unit}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.minThreshold}–{row.maxThreshold}
                  </td>
                  <td className="p-3">{row.price.toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        statusBadge(row.status),
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>

      <ParentCard title={t("history")}>
        <ScrollRegion>
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("movementType")}</th>
                <th className="p-3">{t("tableMeat")}</th>
                <th className="p-3">{t("tableQty")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="p-3">
                    {row.date} {row.time}
                  </td>
                  <td className="p-3 capitalize">{row.type}</td>
                  <td className="p-3">{row.meatType}</td>
                  <td className="p-3">{row.quantity} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>
    </div>
  );
};
