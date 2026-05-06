"use client";

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

const Schema = z.object({
  supplier: z.string().min(1),
  meatType: z.string().min(1),
  quantity: z.coerce.number().positive(),
  batch: z.string().min(1),
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
      supplier: "",
      meatType: "",
      quantity: 0,
      batch: "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(t("toastOk"));
    reset();
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
            <Label htmlFor="supplier">{t("supplier")}</Label>
            <Input id="supplier" {...register("supplier")} />
            {errors.supplier ? (
              <p className="text-sm text-destructive">
                {errors.supplier.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="meatType">{t("meatType")}</Label>
            <Input id="meatType" {...register("meatType")} />
            {errors.meatType ? (
              <p className="text-sm text-destructive">
                {errors.meatType.message}
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
            <Label htmlFor="batch">{t("batch")}</Label>
            <Input id="batch" {...register("batch")} />
            {errors.batch ? (
              <p className="text-sm text-destructive">{errors.batch.message}</p>
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
