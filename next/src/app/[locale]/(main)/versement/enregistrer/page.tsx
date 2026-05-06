"use client";

/** Versement = **paiement** backend : à poster sur `POST /api/v1/ventes/{vente}/paiements` une fois la vente connue. */

import { useForm } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "@/components/shared/audio-recorder";

const Schema = z.object({
  amount: z.coerce.number().positive(),
  method: z.string().min(1),
  reference: z.string().min(1),
});

type FormValues = z.infer<typeof Schema>;

export default function VersementEnregistrerPage() {
  const t = useTranslations("versement");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
    defaultValues: { amount: 0, method: "mobile", reference: "" },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(t("toastOk"));
    reset();
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <ParentCard title={t("createTitle")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input id="amount" type="number" {...register("amount")} />
            {errors.amount ? (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">{t("method")}</Label>
            <select
              id="method"
              className={nativeSelectClass}
              {...register("method")}
            >
              <option value="mobile">Mobile money</option>
              <option value="cash">Espèces</option>
              <option value="bank">Virement</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">{t("reference")}</Label>
            <Input id="reference" {...register("reference")} />
            {errors.reference ? (
              <p className="text-sm text-destructive">
                {errors.reference.message}
              </p>
            ) : null}
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
