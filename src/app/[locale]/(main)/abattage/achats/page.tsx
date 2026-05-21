"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { formResolver } from "@/lib/form-resolver";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

const Schema = z.object({
  dateAchat: z.string().min(1, "Requis"),
  montantTotal: z.coerce.number().positive("Requis"),
  notes: z.string().optional(),
  especeValeur: z.string().min(1, "Requis"),
  poidsVifKg: z.coerce.number().positive("Requis"),
  prixAchat: z.coerce.number().positive("Requis"),
  numeroTag: z.string().trim().min(1, "Requis"),
});

type FormValues = z.infer<typeof Schema>;

function AbattageAchatsPage() {
  const t = useTranslations("achatsFournisseur");
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
    defaultValues: {
      dateAchat: new Date().toISOString().slice(0, 10),
      montantTotal: 0,
      notes: "",
      especeValeur: "",
      poidsVifKg: 0,
      prixAchat: 0,
      numeroTag: "",
    },
  });

  const especesQuery = useQuery({
    queryKey: ["referentiels", "espece_animal", "achats-form"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("espece_animal")),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.achatsFournisseurs.create({
        date_achat: values.dateAchat,
        montant_total: values.montantTotal,
        notes: values.notes || undefined,
        animaux: [
          {
            espece: values.especeValeur,
            poids_vif_kg: values.poidsVifKg,
            prix_achat: values.prixAchat,
            numero_tag: values.numeroTag,
          },
        ],
      });
      toast.success(t("toastOk"));
      reset({
        dateAchat: new Date().toISOString().slice(0, 10),
        montantTotal: 0,
        notes: "",
        especeValeur: "",
        poidsVifKg: 0,
        prixAchat: 0,
        numeroTag: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["animaux"] });
      await queryClient.invalidateQueries({ queryKey: ["achats-fournisseurs"] });
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>
      <ParentCard title={t("title")} titleIcon={ShoppingBag}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateAchat">{t("dateAchat")}</Label>
              <Input id="dateAchat" type="date" {...register("dateAchat")} />
              {errors.dateAchat ? (
                <p className="text-sm text-destructive">{errors.dateAchat.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantTotal">{t("montantTotal")}</Label>
              <Input id="montantTotal" type="number" step="0.01" {...register("montantTotal")} />
              {errors.montantTotal ? (
                <p className="text-sm text-destructive">{errors.montantTotal.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="especeValeur">{t("espece")}</Label>
            <select
              id="especeValeur"
              className={nativeSelectClass}
              {...register("especeValeur")}
            >
              <option value="">—</option>
              {(especesQuery.data ?? []).map((item) => {
                const ref = item as { valeur?: unknown; libelle?: unknown };
                const val = String(ref.valeur ?? "");
                return (
                  <option key={val} value={val}>
                    {String(ref.libelle ?? val)}
                  </option>
                );
              })}
            </select>
            {errors.especeValeur ? (
              <p className="text-sm text-destructive">{errors.especeValeur.message}</p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="poidsVifKg">{t("poidsVif")}</Label>
              <Input id="poidsVifKg" type="number" step="0.01" {...register("poidsVifKg")} />
              {errors.poidsVifKg ? (
                <p className="text-sm text-destructive">{errors.poidsVifKg.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prixAchat">{t("prixAchat")}</Label>
              <Input id="prixAchat" type="number" step="0.01" {...register("prixAchat")} />
              {errors.prixAchat ? (
                <p className="text-sm text-destructive">{errors.prixAchat.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroTag">{t("numeroTag")}</Label>
            <Input id="numeroTag" {...register("numeroTag")} />
            {errors.numeroTag ? (
              <p className="text-sm text-destructive">{errors.numeroTag.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AbattageAchatsPage);
