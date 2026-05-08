"use client";

import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
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
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

const Schema = z.object({
  fournisseurUserId: z.coerce.number().positive(),
  amount: z.coerce.number().positive("Requis"),
  method: z.string().min(1, "Requis"),
  dateVersement: z.string().min(1, "Requis"),
  reference: z.string().min(1, "Requis"),
  notes: z.string().optional(),
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
    defaultValues: {
      fournisseurUserId: 0,
      amount: 0,
      method: "mobile_money",
      dateVersement: new Date().toISOString().slice(0, 10),
      reference: "",
      notes: "",
    },
  });
  const modePaiementQuery = useQuery({
    queryKey: ["referentiels", "mode_paiement"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("mode_paiement")),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.versements.create({
        fournisseur_user_id: values.fournisseurUserId,
        montant: values.amount,
        mode_paiement: values.method,
        date_versement: values.dateVersement,
        reference: values.reference,
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
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <ParentCard title={t("createTitle")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fournisseurUserId">ID fournisseur</Label>
            <Input
              id="fournisseurUserId"
              type="number"
              {...register("fournisseurUserId")}
            />
            {errors.fournisseurUserId ? (
              <p className="text-sm text-destructive">
                {errors.fournisseurUserId.message}
              </p>
            ) : null}
          </div>
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
              {(modePaiementQuery.data ?? []).map((item) => {
                const ref = item as { valeur?: unknown; libelle?: unknown };
                const value = String(ref.valeur ?? "");
                return (
                  <option key={value} value={value}>
                    {String(ref.libelle ?? value)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateVersement">Date</Label>
            <Input id="dateVersement" type="date" {...register("dateVersement")} />
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
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
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
