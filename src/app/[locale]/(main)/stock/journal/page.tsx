"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ScrollText, SlidersHorizontal } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollRegion } from "@/components/ui/scroll-region";
import {
  DesktopDataTable,
  MobileCardList,
  MobileDataCard,
  MobileDataRow,
} from "@/components/shared/mobile-data-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { pickDisplayLabel } from "@/lib/display/reference-label";

function StockJournalPage() {
  const t = useTranslations("stockJournal");
  const tCommon = useTranslations("common");
  const [stockId, setStockId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const stocksQuery = useQuery({
    queryKey: ["stocks", "journal-select"],
    queryFn: async () => unwrapDataArray(await boucherieV1.stocks.list()),
  });
  const mouvementsQuery = useQuery({
    queryKey: ["stocks", "mouvements", stockId],
    queryFn: async () => unwrapDataArray(await boucherieV1.stocks.mouvements(stockId)),
    enabled: Boolean(stockId),
  });

  const rows = useMemo(() => {
    return (mouvementsQuery.data ?? [])
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: String(row.id ?? ""),
          date: String(row.created_at ?? ""),
          type: String(row.type ?? ""),
          qty: Number(row.quantite ?? 0),
          user: pickDisplayLabel(row.user as Record<string, unknown> | undefined, [
            "name",
            "nom",
            "email",
          ]) || "—",
          motif: String(row.motif ?? ""),
        };
      })
      .filter((r) => (from ? r.date.slice(0, 10) >= from : true))
      .filter((r) => (to ? r.date.slice(0, 10) <= to : true));
  }, [mouvementsQuery.data, from, to]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </div>
      <ParentCard title={t("filters")} titleIcon={SlidersHorizontal}>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">{tCommon("stock")}</Label>
            <select
              id="stock"
              className={nativeSelectClass}
              value={stockId}
              onChange={(e) => setStockId(e.target.value)}
            >
              <option value="">—</option>
              {(stocksQuery.data ?? []).map((item) => {
                const stock = item as { id?: unknown; produit?: unknown };
                const produit = (stock.produit ?? {}) as Record<string, unknown>;
                const label = pickDisplayLabel(produit) || tCommon("noLabel");
                return (
                  <option key={String(stock.id ?? "")} value={String(stock.id ?? "")}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from">{t("from")}</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">{t("to")}</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline">
              {t("export")}
            </Button>
          </div>
        </div>
      </ParentCard>
      <ParentCard title={t("title")} titleIcon={ScrollText}>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{tCommon("noData")}</p>
        ) : (
          <>
            <MobileCardList>
              {rows.map((row) => (
                <MobileDataCard key={row.id}>
                  <MobileDataRow label={t("tableMeat")} value={row.motif} emphasize />
                  <MobileDataRow label={t("tableQty")} value={row.qty} emphasize />
                  <MobileDataRow label={t("tableDate")} value={row.date} />
                  <MobileDataRow label={t("tableType")} value={row.type} />
                  <MobileDataRow label={t("tableUser")} value={row.user} />
                </MobileDataCard>
              ))}
            </MobileCardList>
            <DesktopDataTable>
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
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="p-3">{row.date}</td>
                        <td className="p-3">{row.type}</td>
                        <td className="p-3">{row.motif}</td>
                        <td className="p-3">{row.qty}</td>
                        <td className="p-3">{row.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollRegion>
            </DesktopDataTable>
          </>
        )}
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(StockJournalPage);
