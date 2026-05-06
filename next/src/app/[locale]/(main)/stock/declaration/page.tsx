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

const Schema = z.object({
  meatType: z.string().min(1),
  declaredQty: z.coerce.number().positive(),
  reason: z.string().min(1),
});

type FormValues = z.infer<typeof Schema>;

export default function StockDeclarationPage() {
  const t = useTranslations("stockDeclaration");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
    defaultValues: { meatType: "", declaredQty: 0, reason: "" },
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
            <Label htmlFor="meatType">{t("meatType")}</Label>
            <Input id="meatType" {...register("meatType")} />
            {errors.meatType ? (
              <p className="text-sm text-destructive">
                {errors.meatType.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="declaredQty">{t("declaredQty")}</Label>
            <Input
              id="declaredQty"
              type="number"
              step="0.01"
              {...register("declaredQty")}
            />
            {errors.declaredQty ? (
              <p className="text-sm text-destructive">
                {errors.declaredQty.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Input id="reason" {...register("reason")} />
            {errors.reason ? (
              <p className="text-sm text-destructive">
                {errors.reason.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}
