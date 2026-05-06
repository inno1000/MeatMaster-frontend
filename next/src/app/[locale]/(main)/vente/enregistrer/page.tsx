"use client";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AudioRecorder } from "@/components/shared/audio-recorder";

const MEAT = [
  { name: "Bœuf", price: 2500, stock: 45 },
  { name: "Mouton", price: 3000, stock: 23 },
  { name: "Chèvre", price: 2800, stock: 12 },
  { name: "Poulet", price: 2000, stock: 67 },
];

const Schema = z
  .object({
    date: z.string().min(1),
    meatType: z.string().min(1),
    soldQty: z.coerce.number().positive(),
    unitPrice: z.coerce.number().nonnegative(),
  })
  .superRefine((data, ctx) => {
    const meat = MEAT.find((m) => m.name === data.meatType);
    if (meat && data.soldQty > meat.stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["soldQty"],
        message: "stock",
      });
    }
  });

type FormValues = z.infer<typeof Schema>;

export default function VenteEnregistrerPage() {
  const t = useTranslations("vente");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      meatType: "",
      soldQty: 0,
      unitPrice: 0,
    },
  });

  const meatType = useWatch({ control, name: "meatType" });
  const soldQty = useWatch({ control, name: "soldQty" });
  const unitPrice = useWatch({ control, name: "unitPrice" });

  const selected = useMemo(
    () => MEAT.find((m) => m.name === meatType),
    [meatType],
  );

  const total = useMemo(() => {
    if (!soldQty || !unitPrice) {
      return 0;
    }
    return soldQty * unitPrice;
  }, [soldQty, unitPrice]);

  const remaining =
    selected && soldQty ? Math.max(0, selected.stock - soldQty) : null;

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success(t("toastOk"));
  });

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("createSubtitle")}
        </p>
      </div>
      <ParentCard title={t("createTitle")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t("date")}</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date ? (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="meatType">{t("meatType")}</Label>
            <select
              id="meatType"
              className={nativeSelectClass}
              {...register("meatType", {
                onChange: (e) => {
                  const name = e.target.value;
                  const m = MEAT.find((x) => x.name === name);
                  if (m) {
                    setValue("unitPrice", m.price);
                  }
                },
              })}
            >
              <option value="">{t("meatType")}</option>
              {MEAT.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.stock} kg)
                </option>
              ))}
            </select>
            {errors.meatType ? (
              <p className="text-sm text-destructive">
                {errors.meatType.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="soldQty">{t("soldQty")}</Label>
            <Input
              id="soldQty"
              type="number"
              step="0.01"
              {...register("soldQty")}
            />
            {errors.soldQty ? (
              <p className="text-sm text-destructive">
                {errors.soldQty.message === "stock"
                  ? t("stockError")
                  : errors.soldQty.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPrice">{t("unitPrice")}</Label>
            <Input
              id="unitPrice"
              type="number"
              step="1"
              {...register("unitPrice")}
            />
          </div>
          {selected ? (
            <Alert>
              <AlertDescription>
                {t("total")}: {total.toLocaleString()} FCFA · {t("remaining")}:{" "}
                {remaining !== null ? `${remaining} kg` : "—"}
              </AlertDescription>
            </Alert>
          ) : null}
          <AudioRecorder />
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}
