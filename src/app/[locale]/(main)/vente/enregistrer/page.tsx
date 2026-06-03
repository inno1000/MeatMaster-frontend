"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1, isApiEnabled } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { enumLabel } from "@/lib/i18n/enum-label";
import { useSimpleMode } from "@/lib/hooks/use-simple-mode";
import { VenteSimpleFlow } from "@/components/simple/vente-simple-flow";
import { FormNumberInput } from "@/components/shared/form-number-input";
import { submitVente } from "@/lib/vente/use-vente-submit";

function buildSchema(v: (key: string) => string) {
  return z
    .object({
      date: z.string().min(1, v("dateRequired")),
      typeVente: z.string().min(1, v("saleTypeRequired")),
      clientId: z.string().optional(),
      productId: z.string().min(1, v("productRequired")),
      soldQty: z.coerce.number().positive(v("qtyRequired")),
      unitPrice: z.coerce.number().positive(v("unitPriceRequired")),
      notes: z.string().optional(),
      deliveryAddress: z.string().optional(),
      deliveryDate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.typeVente === "livraison" && !data.deliveryAddress?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryAddress"],
          message: v("deliveryAddressRequired"),
        });
      }
      if (data.typeVente === "livraison" && !data.deliveryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryDate"],
          message: v("deliveryDateRequired"),
        });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function VenteEnregistrerPage() {
  const simpleMode = useSimpleMode();
  const router = useRouter();
  const t = useTranslations("vente");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      typeVente: "comptoir",
      clientId: "",
      productId: "",
      soldQty: 1,
      unitPrice: 0,
      notes: "",
      deliveryAddress: "",
      deliveryDate: new Date().toISOString().slice(0, 10),
    },
  });

  const productId = useWatch({ control, name: "productId" });
  const typeVente = useWatch({ control, name: "typeVente" });
  const soldQty = useWatch({ control, name: "soldQty" });
  const unitPrice = useWatch({ control, name: "unitPrice" });

  const productsQuery = useQuery({
    queryKey: ["produits", "for-sale"],
    queryFn: async () => unwrapDataArray(await boucherieV1.produits.list()),
    enabled: isApiEnabled(),
  });
  const clientsQuery = useQuery({
    queryKey: ["clients", "for-sale"],
    queryFn: async () => unwrapDataArray(await boucherieV1.clients.list()),
    enabled: isApiEnabled(),
  });
  const typeVenteQuery = useQuery({
    queryKey: ["referentiels", "type_vente"],
    queryFn: async () => unwrapDataArray(await boucherieV1.referentiels.list("type_vente")),
    enabled: isApiEnabled(),
  });

  useEffect(() => {
    if (!productId || productsQuery.data === undefined) {
      return;
    }
    const found = productsQuery.data.find(
      (item) =>
        String((item as { id?: unknown }).id ?? "") === productId,
    ) as { prix_unitaire?: unknown } | undefined;
    const unit = Number(found?.prix_unitaire ?? 0);
    if (Number.isFinite(unit) && unit > 0) {
      setValue("unitPrice", unit, { shouldValidate: true, shouldDirty: true });
    }
  }, [productId, productsQuery.data, setValue]);

  const total = soldQty && unitPrice ? soldQty * unitPrice : 0;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitVente({
        date: values.date,
        typeVente: values.typeVente,
        clientId: values.clientId,
        productId: values.productId,
        soldQty: values.soldQty,
        unitPrice: values.unitPrice,
        notes: values.notes,
        deliveryAddress: values.deliveryAddress,
        deliveryDate: values.deliveryDate,
        audioBlobs,
      });
      toast.success(t("toastOk"));
      router.push("/vente/liste");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  if (simpleMode) {
    return <VenteSimpleFlow />;
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("createTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("createSubtitle")}
        </p>
      </div>
      <ParentCard title={t("createTitle")} titleIcon={ShoppingCart}>
        {!isApiEnabled() ? (
          <Alert className="mb-4">
            <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t("date")}</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date ? (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="typeVente">{t("saleType")}</Label>
            <select
              id="typeVente"
              className={nativeSelectClass}
              {...register("typeVente")}
            >
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(typeVenteQuery.data ?? []).map((item) => {
                const ref = item as { valeur?: unknown; libelle?: unknown };
                const value = String(ref.valeur ?? "");
                const label = String(ref.libelle ?? "").trim();
                return (
                  <option key={value} value={value}>
                    {label || enumLabel(tCommon, value)}
                  </option>
                );
              })}
            </select>
            {errors.typeVente ? (
              <p className="text-sm text-destructive">
                {errors.typeVente.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">{t("client")}</Label>
            <select
              id="clientId"
              className={nativeSelectClass}
              {...register("clientId")}
            >
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(clientsQuery.data ?? []).map((item) => {
                const obj = item as { id?: unknown; nom?: unknown; name?: unknown };
                return (
                  <option key={String(obj.id ?? "")} value={String(obj.id ?? "")}>
                    {String(obj.nom ?? obj.name ?? "").trim() || tCommon("noLabel")}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="productId">{t("product")}</Label>
            <select
              id="productId"
              className={nativeSelectClass}
              {...register("productId")}
            >
              <option value="">{tCommon("selectPlaceholder")}</option>
              {(productsQuery.data ?? []).map((item) => {
                const obj = item as {
                  id?: unknown;
                  nom?: unknown;
                  name?: unknown;
                  prix_unitaire?: unknown;
                };
                return (
                  <option key={String(obj.id ?? "")} value={String(obj.id ?? "")}>
                    {String(obj.nom ?? obj.name ?? "").trim() || tCommon("noLabel")}
                    {" · "}
                    {Number(obj.prix_unitaire ?? 0).toLocaleString()} FCFA
                  </option>
                );
              })}
            </select>
            {errors.productId ? (
              <p className="text-sm text-destructive">
                {errors.productId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="soldQty">{t("soldQty")}</Label>
            <FormNumberInput control={control} name="soldQty" id="soldQty" />
            {errors.soldQty ? (
              <p className="text-sm text-destructive">
                {errors.soldQty.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPrice">{t("unitPrice")}</Label>
            <FormNumberInput
              control={control}
              name="unitPrice"
              id="unitPrice"
              allowDecimals={false}
            />
              {errors.unitPrice ? (
                <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
              ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          {typeVente === "livraison" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">{t("deliveryAddress")}</Label>
                <Input id="deliveryAddress" {...register("deliveryAddress")} />
                {errors.deliveryAddress ? (
                  <p className="text-sm text-destructive">{errors.deliveryAddress.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">{t("deliveryDate")}</Label>
                <Input id="deliveryDate" type="date" {...register("deliveryDate")} />
                {errors.deliveryDate ? (
                  <p className="text-sm text-destructive">{errors.deliveryDate.message}</p>
                ) : null}
              </div>
            </>
          ) : null}
          {total > 0 ? (
            <Alert>
              <AlertDescription>
                {t("total")}: {total.toLocaleString()} FCFA
              </AlertDescription>
            </Alert>
          ) : null}
          <AudioRecorder onBlobsChange={setAudioBlobs} />
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(VenteEnregistrerPage);
