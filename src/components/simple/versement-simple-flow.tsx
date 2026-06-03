"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { iconBanknote, iconPaymentsGroup, iconSmartphone } from "@/lib/icons";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { SimpleChoiceGrid } from "@/components/simple/simple-choice-grid";
import { SimpleNumericPad } from "@/components/simple/simple-numeric-pad";
import { SimpleConfirmBar } from "@/components/simple/simple-confirm-bar";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { submitVersement } from "@/lib/versement/use-versement-submit";
import { formatError } from "@/lib/format-error";
import { useAuthStore } from "@/lib/stores/auth-store";

const TOTAL_STEPS = 3;

export function VersementSimpleFlow() {
  const t = useTranslations("simple");
  const tVersement = useTranslations("versement");
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const assignedSupplierId = authUser?.supplierUserId ?? "";
  const [step, setStep] = useState(0);
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [fournisseurUserId, setFournisseurUserId] = useState("");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const modePaiementQuery = useQuery({
    queryKey: ["referentiels", "mode_paiement", "simple"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("mode_paiement")),
  });

  const supplierUsersQuery = useQuery({
    queryKey: ["users", "suppliers-for-versement-simple"],
    queryFn: async () => unwrapDataArray(await boucherieV1.users.list()),
    enabled: !assignedSupplierId,
  });

  useEffect(() => {
    if (assignedSupplierId) {
      setFournisseurUserId(assignedSupplierId);
    }
  }, [assignedSupplierId]);

  useEffect(() => {
    if (!fournisseurUserId && supplierUsersQuery.data?.length) {
      const first = supplierUsersQuery.data.find((item) => {
        const row = item as Record<string, unknown>;
        const r = String(row.role ?? "").toLowerCase();
        return r === "fournisseur" || r === "caissier";
      }) as Record<string, unknown> | undefined;
      if (first) {
        setFournisseurUserId(String(first.id ?? ""));
      }
    }
  }, [supplierUsersQuery.data, fournisseurUserId]);

  const methodOptions = useMemo(() => {
    const refs = modePaiementQuery.data ?? [];
    if (refs.length === 0) {
      return [
        { id: "mobile_money", label: "Mobile", icon: iconSmartphone },
        { id: "especes", label: "Espèces", icon: iconBanknote },
      ];
    }
    return refs.map((item) => {
      const ref = item as { valeur?: unknown; libelle?: unknown };
      const id = String(ref.valeur ?? "");
      const label = String(ref.libelle ?? id).trim() || id;
      return {
        id,
        label: label.length > 12 ? `${label.slice(0, 10)}…` : label,
        icon: id.includes("mobile") ? iconSmartphone : iconBanknote,
      };
    });
  }, [modePaiementQuery.data]);

  const amount = Number(amountStr) || 0;

  const goNext = async () => {
    if (step === 0 && amount <= 0) {
      return;
    }
    if (step === 1 && !method) {
      return;
    }
    if (step === 2) {
      if (!fournisseurUserId) {
        toast.error(tVersement("supplierUser"));
        return;
      }
      setSubmitting(true);
      try {
        const ref = `V-${Date.now().toString(36).toUpperCase()}`;
        await submitVersement({
          fournisseurUserId,
          amount,
          method,
          dateVersement: new Date().toISOString().slice(0, 10),
          reference: ref,
          audioBlobs,
        });
        toast.success(tVersement("toastOk"));
        router.replace("/versement/liste");
      } catch (e) {
        toast.error(formatError(e));
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <SimpleStepLayout
      icon={iconPaymentsGroup}
      title={t("paymentTitle")}
      step={step + 1}
      totalSteps={TOTAL_STEPS}
    >
      {step === 0 ? (
        <SimpleNumericPad
          value={amountStr}
          onChange={setAmountStr}
          allowDecimal={false}
          suffix="FCFA"
        />
      ) : null}

      {step === 1 ? (
        <SimpleChoiceGrid
          options={methodOptions.map((m) => ({
            id: m.id,
            label: m.label,
            icon: m.icon,
            selected: method === m.id,
          }))}
          onSelect={setMethod}
          columns={2}
        />
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/8 p-6 text-center">
            <p className="text-4xl font-bold tabular-nums">
              {t("amountBig", { amount: amount.toLocaleString() })}
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              {methodOptions.find((m) => m.id === method)?.label ?? method}
            </p>
            <p className="text-sm text-muted-foreground">{t("referenceAuto")}</p>
          </div>
          <AudioRecorder onBlobsChange={setAudioBlobs} />
        </div>
      ) : null}

      <SimpleConfirmBar
        onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
        onNext={goNext}
        backLabel={t("back")}
        nextLabel={step === TOTAL_STEPS - 1 ? t("finish") : t("next")}
        nextDisabled={
          (step === 0 && amount <= 0) || (step === 1 && !method)
        }
        nextLoading={submitting}
      />
    </SimpleStepLayout>
  );
}
