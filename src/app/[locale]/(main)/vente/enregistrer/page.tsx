"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1, isApiEnabled, uploadAudioBlobs } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray, unwrapDataObject } from "@/lib/api/unwrap";

const Schema = z
  .object({
    date: z.string().min(1, "Date requise"),
    typeVente: z.string().min(1, "Type de vente requis"),
    clientId: z.string().optional(),
    productId: z.string().min(1, "Produit requis"),
    soldQty: z.coerce.number().positive("Requis"),
    unitPrice: z.coerce.number().positive("Prix unitaire requis"),
    notes: z.string().optional(),
    deliveryAddress: z.string().optional(),
    deliveryDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeVente === "livraison" && !data.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Adresse de livraison requise",
      });
    }
    if (data.typeVente === "livraison" && !data.deliveryDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryDate"],
        message: "Date prévue requise",
      });
    }
  });

type FormValues = z.infer<typeof Schema>;

function VenteEnregistrerPage() {
  const t = useTranslations("vente");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const tCommon = useTranslations("common");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(Schema),
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
      const attachmentIds = await uploadAudioBlobs(audioBlobs);
      const createdRaw = await boucherieV1.ventes.create({
        type_vente: values.typeVente,
        client_id: values.clientId || undefined,
        notes: values.notes || undefined,
        date_vente: values.date,
        ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
        lignes: [
          {
            produit_id: values.productId,
            quantite: values.soldQty,
            prix_unitaire: values.unitPrice,
          },
        ],
      });
      const created = unwrapDataObject(createdRaw);
      const saleId = String(created.id ?? "");
      if (values.typeVente === "livraison" && saleId) {
        await boucherieV1.ventes.createLivraison(saleId, {
          adresse_livraison: values.deliveryAddress,
          statut: "en_attente",
          date_prevue: values.deliveryDate,
        });
      }
      toast.success(t("toastOk"));
    } catch (error) {
      toast.error(formatError(error));
    }
  });

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
            <Label htmlFor="typeVente">Type de vente</Label>
            <select
              id="typeVente"
              className={nativeSelectClass}
              {...register("typeVente")}
            >
              <option value="">—</option>
              {(typeVenteQuery.data ?? []).map((item) => {
                const ref = item as { valeur?: unknown; libelle?: unknown };
                const value = String(ref.valeur ?? "");
                return (
                  <option key={value} value={value}>
                    {String(ref.libelle ?? value)}
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
            <Label htmlFor="clientId">{t("tableCustomer")}</Label>
            <select
              id="clientId"
              className={nativeSelectClass}
              {...register("clientId")}
            >
              <option value="">—</option>
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
            <Label htmlFor="productId">{t("meatType")}</Label>
            <select
              id="productId"
              className={nativeSelectClass}
              {...register("productId")}
            >
              <option value="">—</option>
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
            <Input
              id="soldQty"
              type="number"
              step="0.01"
                min="0.01"
              {...register("soldQty")}
            />
            {errors.soldQty ? (
              <p className="text-sm text-destructive">
                {errors.soldQty.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitPrice">{t("unitPrice")}</Label>
            <Input
              id="unitPrice"
              type="number"
              step="1"
                min="1"
              {...register("unitPrice")}
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
                <Label htmlFor="deliveryAddress">Adresse livraison</Label>
                <Input id="deliveryAddress" {...register("deliveryAddress")} />
                {errors.deliveryAddress ? (
                  <p className="text-sm text-destructive">{errors.deliveryAddress.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Date prévue</Label>
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
