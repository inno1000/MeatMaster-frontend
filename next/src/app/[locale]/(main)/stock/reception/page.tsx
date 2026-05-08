"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { nativeSelectClass } from "@/lib/ui-classes";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

const Schema = z.object({
  distributionId: z.string().min(1),
  quantity: z.coerce.number().positive("Requis"),
  dateReception: z.string().min(1, "Requis"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

export default function StockReceptionPage() {
  const t = useTranslations("stockReception");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
    defaultValues: {
      distributionId: "",
      quantity: 0,
      dateReception: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const distributionsQuery = useQuery({
    queryKey: ["distributions", "for-reception"],
    queryFn: async () => unwrapDataArray(await boucherieV1.distributions.list()),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.receptions.create({
        distribution_id: values.distributionId,
        quantite_recue: values.quantity,
        date_reception: values.dateReception,
        notes: values.notes || undefined,
      });
      toast.success(t("toastOk"));
      reset();
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ParentCard title={t("title")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distributionId">Distribution</Label>
            <select
              id="distributionId"
              className={nativeSelectClass}
              {...register("distributionId")}
            >
              <option value="">—</option>
              {(distributionsQuery.data ?? []).map((item) => {
                const d = item as { id?: unknown; abattage_id?: unknown; quantite?: unknown };
                return (
                  <option key={String(d.id ?? "")} value={String(d.id ?? "")}>
                    #{String(d.id ?? "")} · abattage {String(d.abattage_id ?? "")} · {String(d.quantite ?? "")} kg
                  </option>
                );
              })}
            </select>
            {errors.distributionId ? (
              <p className="text-sm text-destructive">
                {errors.distributionId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input id="quantity" type="number" step="0.01" {...register("quantity")} />
            {errors.quantity ? (
              <p className="text-sm text-destructive">
                {errors.quantity.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateReception">Date réception</Label>
            <Input id="dateReception" type="date" {...register("dateReception")} />
            {errors.dateReception ? (
              <p className="text-sm text-destructive">{errors.dateReception.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <AudioRecorder />
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}
