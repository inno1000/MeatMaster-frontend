"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import type { SlaughterAnimal } from "@/lib/mock-data/slaughter";
import { Button } from "@/components/ui/button";
import { Beef, Home, MapPin, Pencil, Phone, Share2, Trash2 } from "lucide-react";

type Props = {
  animal: SlaughterAnimal;
};

export const AbattageDetailView = ({ animal }: Props) => {
  const t = useTranslations("abattage");

  const meatYield =
    animal.weight > 0
      ? Math.round((animal.meatWeight / animal.weight) * 1000) / 10
      : 0;
  const tripesYield =
    animal.weight > 0
      ? Math.round((animal.tripesWeight / animal.weight) * 1000) / 10
      : 0;
  const totalValue = animal.butchers.reduce(
    (acc, b) => acc + b.weight * b.price,
    0,
  );

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("detailTitle")}</h1>
        <p className="text-muted-foreground">{t("detailSubtitle")}</p>
      </div>

      <ParentCard
        title={t("animal")}
        subtitle={`${animal.date} · ${animal.weight} kg`}
        titleIcon={Beef}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-xl border border-border p-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/15">
                <Beef className="size-7 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {animal.weight} kg · {fmtMoney(animal.purchasePrice)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("meatWeight")}: {animal.meatWeight} kg · {t("tripes")}:{" "}
                  {animal.tripesWeight} kg
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">{t("distribution")}</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                {t("yieldMeat")}: {meatYield}%
              </li>
              <li>
                {t("yieldTripes")}: {tripesYield}%
              </li>
              <li>
                {t("totalValue")}: {fmtMoney(totalValue)}
              </li>
              <li>
                {t("butchersCount")}: {animal.butchers.length}
              </li>
            </ul>
          </div>
        </div>
      </ParentCard>

      <ParentCard title={t("distribution")} titleIcon={Share2}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {animal.butchers.map((b) => (
            <div
              key={`${b.name}-${b.phone}`}
              className="rounded-xl border border-border p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <Home className="size-5 text-accent" aria-hidden />
                <h3 className="font-semibold">{b.name}</h3>
              </div>
              <p className="text-lg font-bold">
                {b.weight} kg · {fmtMoney(b.price)}/kg
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Total portion: {fmtMoney(b.weight * b.price)}
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {b.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {b.phone}
                </p>
                <p className="text-muted-foreground">{b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </ParentCard>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => toast.info(t("editSoon"))}>
          <Pencil className="size-4" />
          {t("edit")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => toast.success(t("deletedOk"))}
        >
          <Trash2 className="size-4" />
          {t("delete")}
        </Button>
      </div>
    </div>
  );
};
