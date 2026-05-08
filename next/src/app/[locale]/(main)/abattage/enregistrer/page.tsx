"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

const FormSchema = z.object({
  abattageId: z.string().min(1, "Requis"),
  boucherieId: z.string().min(1, "Requis"),
  produitId: z.string().min(1, "Requis"),
  quantite: z.coerce.number().positive("Requis"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function AbattageEnregistrerPage() {
  const t = useTranslations("abattage");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(FormSchema),
    defaultValues: {
      abattageId: "",
      boucherieId: "",
      produitId: "",
      quantite: 0,
      notes: "",
    },
  });

  const abattagesQuery = useQuery({
    queryKey: ["abattages", "for-distributions"],
    queryFn: async () => unwrapDataArray(await boucherieV1.abattages.list()),
  });
  const boucheriesQuery = useQuery({
    queryKey: ["boucheries", "for-distributions"],
    queryFn: async () => unwrapDataArray(await boucherieV1.boucheries.list()),
  });
  const produitsQuery = useQuery({
    queryKey: ["produits", "for-distributions"],
    queryFn: async () => unwrapDataArray(await boucherieV1.produits.list()),
  });

  const abattageCount = useMemo(
    () => (abattagesQuery.data ?? []).length,
    [abattagesQuery.data],
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.distributions.create({
        abattage_id: values.abattageId,
        boucherie_id: values.boucherieId,
        produit_id: values.produitId,
        quantite: values.quantite,
        notes: values.notes || undefined,
      });
      toast.success(t("toastOk"));
      reset();
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("distribution")}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Abattages disponibles</p>
        <p className="text-2xl font-semibold">{abattageCount}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <ParentCard title={t("distribution")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="abattageId">Abattage</Label>
              <select id="abattageId" className={nativeSelectClass} {...register("abattageId")}>
                <option value="">—</option>
                {(abattagesQuery.data ?? []).map((item) => {
                  const a = item as { id?: unknown; date_abattage?: unknown };
                  return (
                    <option key={String(a.id ?? "")} value={String(a.id ?? "")}>
                      #{String(a.id ?? "")} · {String(a.date_abattage ?? "")}
                    </option>
                  );
                })}
              </select>
              {errors.abattageId ? (
                <p className="text-sm text-destructive">{errors.abattageId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="boucherieId">Boucherie</Label>
              <select id="boucherieId" className={nativeSelectClass} {...register("boucherieId")}>
                <option value="">—</option>
                {(boucheriesQuery.data ?? []).map((item) => {
                  const b = item as { id?: unknown; nom?: unknown; ville?: unknown };
                  return (
                    <option key={String(b.id ?? "")} value={String(b.id ?? "")}>
                      {String(b.nom ?? b.id ?? "")} · {String(b.ville ?? "")}
                    </option>
                  );
                })}
              </select>
              {errors.boucherieId ? (
                <p className="text-sm text-destructive">{errors.boucherieId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="produitId">Produit</Label>
              <select id="produitId" className={nativeSelectClass} {...register("produitId")}>
                <option value="">—</option>
                {(produitsQuery.data ?? []).map((item) => {
                  const p = item as { id?: unknown; nom?: unknown };
                  return (
                    <option key={String(p.id ?? "")} value={String(p.id ?? "")}>
                      {String(p.nom ?? p.id ?? "")}
                    </option>
                  );
                })}
              </select>
              {errors.produitId ? (
                <p className="text-sm text-destructive">{errors.produitId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantite">{t("distributedWeight")} (kg)</Label>
              <Input id="quantite" type="number" step="0.01" {...register("quantite")} />
              {errors.quantite ? (
                <p className="text-sm text-destructive">{errors.quantite.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register("notes")} />
            </div>
          </div>
        </ParentCard>
        <AudioRecorder />
        <Button type="submit" disabled={isSubmitting}>
          {t("submit")}
        </Button>
      </form>
    </div>
  );
}
