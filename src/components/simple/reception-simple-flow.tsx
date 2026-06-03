"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { iconReception } from "@/lib/icons";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { SimpleChoiceGrid } from "@/components/simple/simple-choice-grid";
import { SimpleNumericPad } from "@/components/simple/simple-numeric-pad";
import { SimpleConfirmBar } from "@/components/simple/simple-confirm-bar";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import {
  expectedReceptionQuantity,
  filterDistributionsForReception,
  formatDistributionOptionLabel,
} from "@/lib/distributions/reception-options";
import { formatError } from "@/lib/format-error";

const TOTAL_STEPS = 3;

export function ReceptionSimpleFlow() {
  const t = useTranslations("simple");
  const tRec = useTranslations("stockReception");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [distributionId, setDistributionId] = useState("");
  const [qtyStr, setQtyStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const distributionsQuery = useQuery({
    queryKey: ["distributions", "for-reception-simple"],
    queryFn: async () =>
      unwrapDataArray(
        await boucherieV1.distributions.list({
          statut: "en_attente",
          limit: 20,
        }),
      ),
  });

  const pending = useMemo(
    () => filterDistributionsForReception(distributionsQuery.data ?? []),
    [distributionsQuery.data],
  );

  const options = useMemo(
    () =>
      pending.map((d) => ({
        id: String(d.id ?? ""),
        label: formatDistributionOptionLabel(d, tCommon("noLabel")),
        selected: String(d.id ?? "") === distributionId,
      })),
    [pending, distributionId, tCommon],
  );

  const selected = pending.find((d) => String(d.id ?? "") === distributionId);

  useEffect(() => {
    if (!selected) return;
    const qty = expectedReceptionQuantity(selected);
    if (qty > 0) setQtyStr(String(qty));
  }, [selected]);

  const qty = Number(qtyStr) || 0;
  const today = new Date().toISOString().slice(0, 10);

  const goNext = async () => {
    if (step === 0) {
      if (!distributionId) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (qty <= 0) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setSubmitting(true);
      try {
        await boucherieV1.receptions.create({
          distribution_id: distributionId,
          quantite_recue: qty,
          date_reception: today,
        });
        toast.success(tRec("toastOk"));
        router.replace("/dashboard");
      } catch (e) {
        toast.error(formatError(e));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <SimpleStepLayout
      icon={iconReception}
      title={tRec("title")}
      step={step + 1}
      totalSteps={TOTAL_STEPS}
    >
      {step === 0 ? (
        options.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {tRec("noPendingDistribution")}
          </p>
        ) : (
          <SimpleChoiceGrid
            options={options}
            onSelect={setDistributionId}
            columns={2}
          />
        )
      ) : null}
      {step === 1 ? (
        <SimpleNumericPad
          value={qtyStr}
          onChange={setQtyStr}
          allowDecimal
          suffix={t("kg")}
        />
      ) : null}
      {step === 2 ? (
        <p className="text-center text-4xl font-bold tabular-nums">
          {qty.toLocaleString()} {t("kg")}
        </p>
      ) : null}
      <SimpleConfirmBar
        onBack={step > 0 ? goBack : undefined}
        onNext={goNext}
        backLabel={t("back")}
        nextLabel={step === TOTAL_STEPS - 1 ? t("finish") : t("next")}
        nextDisabled={
          (step === 0 && (!distributionId || options.length === 0)) ||
          (step === 1 && qty <= 0)
        }
        nextLoading={submitting}
      />
    </SimpleStepLayout>
  );
}
