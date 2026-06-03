"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { iconShoppingBag } from "@/lib/icons";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { SimpleChoiceGrid } from "@/components/simple/simple-choice-grid";
import { SimpleNumericPad } from "@/components/simple/simple-numeric-pad";
import { SimpleConfirmBar } from "@/components/simple/simple-confirm-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { formatError } from "@/lib/format-error";
import { enumLabel } from "@/lib/i18n/enum-label";

const TOTAL_STEPS = 4;

export function AchatSimpleFlow() {
  const t = useTranslations("simple");
  const tAchat = useTranslations("achatsFournisseur");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [espece, setEspece] = useState("");
  const [poidsStr, setPoidsStr] = useState("");
  const [prixStr, setPrixStr] = useState("");
  const [numeroTag, setNumeroTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const especesQuery = useQuery({
    queryKey: ["referentiels", "espece_animal", "achat-simple"],
    queryFn: async () =>
      unwrapDataArray(await boucherieV1.referentiels.list("espece_animal")),
  });

  const especeOptions = useMemo(
    () =>
      (especesQuery.data ?? []).map((item) => {
        const ref = item as { valeur?: unknown; libelle?: unknown };
        const id = String(ref.valeur ?? "");
        const label = enumLabel(
          tCommon,
          id,
          String(ref.libelle ?? ""),
        );
        return { id, label, selected: id === espece };
      }),
    [especesQuery.data, espece, tCommon],
  );

  const poids = Number(poidsStr) || 0;
  const prix = Number(prixStr) || 0;
  const today = new Date().toISOString().slice(0, 10);

  const goNext = async () => {
    if (step === 0) {
      if (!espece) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (poids <= 0) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (prix <= 0) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!numeroTag.trim()) return;
      setSubmitting(true);
      try {
        await boucherieV1.achatsFournisseurs.create({
          date_achat: today,
          animaux: [
            {
              espece,
              poids_vif_kg: poids,
              prix_achat: prix,
              numero_tag: numeroTag.trim(),
            },
          ],
        });
        toast.success(tAchat("toastOk"));
        await queryClient.invalidateQueries({ queryKey: ["animaux"] });
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
      icon={iconShoppingBag}
      title={tAchat("title")}
      step={step + 1}
      totalSteps={TOTAL_STEPS}
    >
      {step === 0 ? (
        <SimpleChoiceGrid
          options={especeOptions}
          onSelect={setEspece}
          columns={2}
        />
      ) : null}
      {step === 1 ? (
        <SimpleNumericPad
          value={poidsStr}
          onChange={setPoidsStr}
          allowDecimal
          suffix={t("kg")}
        />
      ) : null}
      {step === 2 ? (
        <SimpleNumericPad
          value={prixStr}
          onChange={setPrixStr}
          allowDecimal={false}
          suffix="FCFA"
        />
      ) : null}
      {step === 3 ? (
        <div className="space-y-2">
          <Label htmlFor="tag-simple">{tAchat("numeroTag")}</Label>
          <Input
            id="tag-simple"
            value={numeroTag}
            onChange={(e) => setNumeroTag(e.target.value)}
          />
        </div>
      ) : null}
      <SimpleConfirmBar
        onBack={step > 0 ? goBack : undefined}
        onNext={goNext}
        backLabel={t("back")}
        nextLabel={step === TOTAL_STEPS - 1 ? t("finish") : t("next")}
        nextDisabled={
          (step === 0 && !espece) ||
          (step === 1 && poids <= 0) ||
          (step === 2 && prix <= 0) ||
          (step === 3 && !numeroTag.trim())
        }
        nextLoading={submitting}
      />
    </SimpleStepLayout>
  );
}
