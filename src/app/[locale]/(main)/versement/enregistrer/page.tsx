"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { formResolver } from "@/lib/form-resolver";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Wallet } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { nativeSelectClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSimpleMode } from "@/lib/hooks/use-simple-mode";
import { VersementSimpleFlow } from "@/components/simple/versement-simple-flow";
import { FormNumberInput } from "@/components/shared/form-number-input";
import { submitVersement } from "@/lib/versement/use-versement-submit";

function buildSchema(v: (key: string) => string) {
  return z.object({
    fournisseurUserId: z.string().min(1, v("supplierRequired")),
    amount: z.coerce.number().positive(v("positiveAmount")),
    method: z.string().min(1, v("required")),
    dateVersement: z.string().min(1, v("dateRequired")),
    reference: z.string().trim().min(1, v("referenceRequired")),
    notes: z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function VersementEnregistrerPage() {
  const simpleMode = useSimpleMode();
  const router = useRouter();
  const t = useTranslations("versement");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const tCommon = useTranslations("common");
  const schema = useMemo(
    () => buildSchema((k) => tCommon(`validation.${k}`)),
    [tCommon],
  );
  const authUser = useAuthStore((s) => s.user);
  const assignedSupplierId = authUser?.supplierUserId ?? "";
  const hasAssignedSupplier = assignedSupplierId.length > 0;
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: formResolver(schema),
    defaultValues: {
      fournisseurUserId: "",
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

  const supplierUsersQuery = useQuery({
    queryKey: ["users", "suppliers-for-versement"],
    queryFn: async () => unwrapDataArray(await boucherieV1.users.list()),
    enabled: !hasAssignedSupplier,
  });

  useEffect(() => {
    if (hasAssignedSupplier) {
      setValue("fournisseurUserId", assignedSupplierId, { shouldValidate: true });
    }
  }, [assignedSupplierId, hasAssignedSupplier, setValue]);

  const assignedSupplierLabel =
    authUser?.supplierName?.trim() || assignedSupplierId;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitVersement({
        fournisseurUserId: values.fournisseurUserId,
        amount: values.amount,
        method: values.method,
        dateVersement: values.dateVersement,
        reference: values.reference,
        notes: values.notes,
        audioBlobs,
      });
      toast.success(t("toastOk"));
      router.push("/versement/liste");
    } catch (error) {
      toast.error(formatError(error));
    }
  });

  if (simpleMode) {
    return <VersementSimpleFlow />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
        <p className="text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <ParentCard title={t("createTitle")} titleIcon={Wallet}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fournisseurUserId">{t("supplierUser")}</Label>
            {hasAssignedSupplier ? (
              <>
                <input type="hidden" {...register("fournisseurUserId")} />
                <p
                  id="fournisseurUserId"
                  className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium"
                >
                  {assignedSupplierLabel || assignedSupplierId}
                </p>
                <p className="text-xs text-muted-foreground">{t("assignedSupplierHint")}</p>
              </>
            ) : (
              <select
                id="fournisseurUserId"
                className={nativeSelectClass}
                {...register("fournisseurUserId")}
              >
                <option value="">—</option>
                {(supplierUsersQuery.data ?? [])
                  .filter((item) => {
                    const row = item as Record<string, unknown>;
                    const r = String(row.role ?? "").toLowerCase();
                    const roles = Array.isArray(row.roles)
                      ? (row.roles as unknown[]).map((x) => String(x).toLowerCase())
                      : [];
                    return (
                      r === "caissier" ||
                      r === "fournisseur" ||
                      roles.includes("caissier") ||
                      roles.includes("fournisseur")
                    );
                  })
                  .map((item) => {
                    const row = item as Record<string, unknown>;
                    const id = String(row.id ?? "");
                    const primary = String(row.name ?? row.email ?? "").trim();
                    const label = primary || tCommon("noLabel");
                    return (
                      <option key={id} value={id}>
                        {label}
                        {row.email && primary !== String(row.email).trim()
                          ? ` · ${String(row.email)}`
                          : ""}
                      </option>
                    );
                  })}
              </select>
            )}
            {errors.fournisseurUserId ? (
              <p className="text-sm text-destructive">
                {errors.fournisseurUserId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <FormNumberInput
              control={control}
              name="amount"
              id="amount"
              allowDecimals={false}
            />
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
              <option value="">—</option>
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
            {errors.method ? (
              <p className="text-sm text-destructive">{errors.method.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateVersement">{t("dateVersement")}</Label>
            <Input id="dateVersement" type="date" {...register("dateVersement")} />
            {errors.dateVersement ? (
              <p className="text-sm text-destructive">{errors.dateVersement.message}</p>
            ) : null}
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
            <Label htmlFor="notes">{tCommon("notes")}</Label>
            <Input id="notes" {...register("notes")} />
          </div>
          <AudioRecorder onBlobsChange={setAudioBlobs} />
          <Button type="submit" disabled={isSubmitting}>
            {t("submit")}
          </Button>
        </form>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(VersementEnregistrerPage);
