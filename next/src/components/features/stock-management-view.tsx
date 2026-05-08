"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";
import { ScrollRegion } from "@/components/ui/scroll-region";
import { cn } from "@/lib/utils";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";

export const StockManagementView = () => {
  const t = useTranslations("stockManagement");
  const [meatFilter, setMeatFilter] = useState("");
  const [movFilter, setMovFilter] = useState("");

  const stocksQuery = useQuery({
    queryKey: ["stocks", "management"],
    queryFn: async () => unwrapDataArray(await boucherieV1.stocks.list()),
  });

  const totalValue = useMemo(
    () => {
      return (stocksQuery.data ?? []).reduce<number>((acc, item) => {
        const row = item as { quantite?: unknown; produit?: unknown };
        const produit = (row.produit ?? {}) as { prix_unitaire?: unknown };
        return acc + Number(row.quantite ?? 0) * Number(produit.prix_unitaire ?? 0);
      }, 0);
    },
    [stocksQuery.data],
  );

  const rows = useMemo(
    () =>
      (stocksQuery.data ?? [])
        .map((item) => {
          const row = item as Record<string, unknown>;
          const produit = (row.produit ?? {}) as Record<string, unknown>;
          const qty = Number(row.quantite ?? 0);
          const seuil = Number(row.seuil_alerte ?? 0);
          const enAlerte = Boolean(row.en_alerte ?? (seuil > 0 && qty <= seuil));
          return {
            id: String(row.id ?? ""),
            name: String(produit.nom ?? row.produit_id ?? ""),
            currentStock: qty,
            minThreshold: seuil,
            unit: String(produit.unite ?? "kg"),
            price: Number(produit.prix_unitaire ?? 0),
            lastUpdated: String(row.updated_at ?? ""),
            status: (enAlerte ? "critical" : "normal") as "critical" | "normal",
            movementType: String(row.type_mouvement ?? ""),
          };
        })
        .filter((r) =>
          meatFilter
            ? r.name.toLowerCase().includes(meatFilter.toLowerCase())
            : true,
        )
        .filter((r) => (movFilter ? r.movementType === movFilter : true)),
    [stocksQuery.data, meatFilter, movFilter],
  );

  const lowCount = rows.filter((m) => m.status !== "normal").length;

  const filteredHistory = rows;

  const statusBadge = (status: "normal" | "critical") => {
    const map = {
      normal: "bg-emerald-500/15 text-emerald-900",
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
            {rows.filter((m) => m.status === "critical").length}
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
              <option value="ajustement">Ajustement</option>
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
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">
                    {row.currentStock} {row.unit}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.minThreshold}
                  </td>
                  <td className="p-3">{row.price.toLocaleString()}</td>
                  <td className="p-3">
                    <span
                    className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        statusBadge(row.status as "critical" | "normal"),
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.lastUpdated.slice(0, 10)}
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
                    {row.lastUpdated}
                  </td>
                  <td className="p-3 capitalize">{row.movementType || "—"}</td>
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.currentStock} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>
    </div>
  );
};
