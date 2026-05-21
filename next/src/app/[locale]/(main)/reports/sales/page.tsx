"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PieChart, Receipt } from "lucide-react";
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
  {
    id: 4,
    date: "2024-01-14",
    meatType: "Chèvre",
    quantity: 12,
    unitPrice: 2800,
    totalAmount: 33600,
    customer: "Client D",
  },
];

export default function ReportsSalesPage() {
  const t = useTranslations("reports");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [meat, setMeat] = useState("");

  const filtered = useMemo(() => {
    let rows = [...SALES];
    if (from) {
      rows = rows.filter((s) => s.date >= from);
    }
    if (to) {
      rows = rows.filter((s) => s.date <= to);
    }
    if (meat) {
      rows = rows.filter((s) => s.meatType === meat);
    }
    return rows;
  }, [from, to, meat]);

  const totalSales = filtered.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalQty = filtered.reduce((acc, s) => acc + s.quantity, 0);
  const avg =
    filtered.length > 0 ? Math.round(totalSales / filtered.length) : 0;

  const byMeat = useMemo(() => {
    const map: Record<string, { quantity: number; amount: number }> = {};
    for (const s of filtered) {
      if (!map[s.meatType]) {
        map[s.meatType] = { quantity: 0, amount: 0 };
      }
      map[s.meatType].quantity += s.quantity;
      map[s.meatType].amount += s.totalAmount;
    }
    return Object.entries(map);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("salesTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("salesSubtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("totalAmount")}</p>
          <p className="text-xl font-semibold">{totalSales.toLocaleString()} FCFA</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("totalQty")}</p>
          <p className="text-xl font-semibold">{totalQty}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("avgSale")}</p>
          <p className="text-xl font-semibold">{avg.toLocaleString()} FCFA</p>
        </div>
      </div>

      <ParentCard title={t("salesTitle")} titleIcon={Receipt}>
        <div className="mb-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("dateFrom")}</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("dateTo")}</Label>
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3">{t("tableDate")}</th>
                <th className="p-3">{t("tableMeat")}</th>
                <th className="p-3">{t("tableQty")}</th>
                <th className="p-3">{t("tableUnit")}</th>
                <th className="p-3">{t("tableTotal")}</th>
                <th className="p-3">{t("tableCustomer")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
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

      <ParentCard title={t("byMeat")} titleIcon={PieChart}>
        <ul className="space-y-2 text-sm">
          {byMeat.map(([name, v]) => (
            <li key={name} className="flex justify-between border-b border-border py-2">
              <span>{name}</span>
              <span>
                {v.quantity} kg · {v.amount.toLocaleString()} FCFA
              </span>
            </li>
          ))}
        </ul>
      </ParentCard>
    </div>
  );
}
