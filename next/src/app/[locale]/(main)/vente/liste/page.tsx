"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ParentCard } from "@/components/shared/parent-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { ScrollRegion } from "@/components/ui/scroll-region";

const SALES = [
  {
    id: 1,
    date: "2024-01-15",
    meatType: "Bœuf",
    quantity: 25,
    unitPrice: 2500,
    totalAmount: 62500,
    customer: "Client A",
  },
  {
    id: 2,
    date: "2024-01-15",
    meatType: "Mouton",
    quantity: 15,
    unitPrice: 3000,
    totalAmount: 45000,
    customer: "Client B",
  },
  {
    id: 3,
    date: "2024-01-14",
    meatType: "Poulet",
    quantity: 30,
    unitPrice: 2000,
    totalAmount: 60000,
    customer: "Client C",
  },
];

export default function VenteListePage() {
  const t = useTranslations("vente");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [meat, setMeat] = useState("");

  const rows = useMemo(() => {
    return SALES.filter((s) => {
      if (from && s.date < from) {
        return false;
      }
      if (to && s.date > to) {
        return false;
      }
      if (meat && s.meatType !== meat) {
        return false;
      }
      return true;
    });
  }, [from, to, meat]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("listTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("listSubtitle")}
        </p>
      </div>
      <ParentCard title={t("listTitle")}>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("date")} (from)</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("date")} (to)</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("meatType")}</Label>
            <select
              className={nativeSelectClass}
              value={meat}
              onChange={(e) => setMeat(e.target.value)}
            >
              <option value="">—</option>
              {["Bœuf", "Mouton", "Chèvre", "Poulet"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ScrollRegion>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableMeat")}</th>
                <th className="p-3">{t("tableQty")}</th>
                <th className="p-3">{t("unitPrice")}</th>
                <th className="p-3">{t("total")}</th>
                <th className="p-3">{t("tableCustomer")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-border">
                  <td className="p-3">{s.date}</td>
                  <td className="p-3">{s.meatType}</td>
                  <td className="p-3">{s.quantity}</td>
                  <td className="p-3">{s.unitPrice.toLocaleString()}</td>
                  <td className="p-3">{s.totalAmount.toLocaleString()}</td>
                  <td className="p-3">{s.customer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </ParentCard>
    </div>
  );
}
