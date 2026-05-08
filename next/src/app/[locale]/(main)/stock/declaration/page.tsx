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
import { nativeSelectClass } from "@/lib/ui-classes";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

const Schema = z.object({
  stockId: z.string().min(1),
  type: z.string().min(1),
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
    defaultValues: { stockId: "", type: "ajustement", declaredQty: 0, reason: "" },
  });

  const stocksQuery = useQuery({
    queryKey: ["stocks", "adjust-select"],
    queryFn: async () => unwrapDataArray(await boucherieV1.stocks.list()),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await boucherieV1.stocks.ajuster(values.stockId, {
        type: values.type,
        quantite: values.declaredQty,
        motif: values.reason,
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
            <Label htmlFor="stockId">Stock</Label>
            <select id="stockId" className={nativeSelectClass} {...register("stockId")}>
              <option value="">—</option>
              {(stocksQuery.data ?? []).map((item) => {
                const stock = item as { id?: unknown; produit?: unknown };
                const produit = (stock.produit ?? {}) as { nom?: unknown };
                return (
                  <option key={String(stock.id ?? "")} value={String(stock.id ?? "")}>
                    #{String(stock.id ?? "")} · {String(produit.nom ?? stock.id ?? "")}
                  </option>
                );
              })}
            </select>
            {errors.stockId ? (
              <p className="text-sm text-destructive">
                {errors.stockId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t("movementType")}</Label>
            <select id="type" className={nativeSelectClass} {...register("type")}>
              <option value="ajustement">Ajustement</option>
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </select>
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
