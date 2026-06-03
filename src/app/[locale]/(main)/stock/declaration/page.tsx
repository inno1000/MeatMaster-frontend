"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { ClipboardPenLine } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/lib/ui-classes";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { pickDisplayLabel } from "@/lib/display/reference-label";
import { enumLabel } from "@/lib/i18n/enum-label";
import { FormNumberInput } from "@/components/shared/form-number-input";

function buildSchema(v: (key: string) => string) {
  return z.object({
    stockId: z.string().min(1, v("stockRequired")),
    type: z.string().min(1, v("movementTypeRequired")),
    declaredQty: z.coerce.number().positive(v("qtyRequired")),
    reason: z.string().trim().min(1, v("reasonRequired")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function StockDeclarationPage() {
  const t = useTranslations("stockDeclaration");
  const router = useRouter();
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
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
      router.push("/stock/management");
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
      <ParentCard title={t("title")} titleIcon={ClipboardPenLine}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stockId">{t("stockLabel")}</Label>
            <select id="stockId" className={nativeSelectClass} {...register("stockId")}>
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(stocksQuery.data ?? []).map((item) => {
                const stock = item as { id?: unknown; produit?: unknown };
                const produit = (stock.produit ?? {}) as Record<string, unknown>;
                const label = pickDisplayLabel(produit) || tCommon("noLabel");
                return (
                  <option key={String(stock.id ?? "")} value={String(stock.id ?? "")}>
                    {label}
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
              {(["ajustement", "entree", "sortie"] as const).map((code) => (
                <option key={code} value={code}>
                  {enumLabel(tCommon, code)}
                </option>
              ))}
            </select>
            {errors.type ? (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="declaredQty">{t("declaredQty")}</Label>
            <FormNumberInput
              control={control}
              name="declaredQty"
              id="declaredQty"
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

export default withLocaleParams(StockDeclarationPage);
