"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { SimpleStepLayout } from "@/components/simple/simple-step-layout";
import { SimpleChoiceGrid } from "@/components/simple/simple-choice-grid";
import { SimpleNumericPad } from "@/components/simple/simple-numeric-pad";
import { SimpleConfirmBar } from "@/components/simple/simple-confirm-bar";
import { AudioRecorder } from "@/components/shared/audio-recorder";
import { boucherieV1, isApiEnabled } from "@/lib/api";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { submitVente } from "@/lib/vente/use-vente-submit";
import { formatError } from "@/lib/format-error";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TOTAL_STEPS = 4;

export function VenteSimpleFlow() {
  const t = useTranslations("simple");
  const tVente = useTranslations("vente");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState("");
  const [qtyStr, setQtyStr] = useState("1");
  const [priceStr, setPriceStr] = useState("");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["produits", "for-sale-simple"],
    queryFn: async () => unwrapDataArray(await boucherieV1.produits.list()),
    enabled: isApiEnabled(),
  });

  const productOptions = useMemo(() => {
    return (productsQuery.data ?? []).map((item) => {
      const obj = item as {
        id?: unknown;
        nom?: unknown;
        name?: unknown;
        prix_unitaire?: unknown;
      };
      const id = String(obj.id ?? "");
      const label = String(obj.nom ?? obj.name ?? "").trim() || tCommon("noLabel");
      const price = Number(obj.prix_unitaire ?? 0);
      return { id, label, price };
    });
  }, [productsQuery.data, tCommon]);

  const selectedProduct = productOptions.find((p) => p.id === productId);
  const soldQty = Number(qtyStr) || 0;
  const unitPrice = Number(priceStr) || 0;
  const total = soldQty * unitPrice;

  const goNext = async () => {
    if (step === 0) {
      if (!productId) {
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (soldQty <= 0) {
        return;
      }
      if (!priceStr && selectedProduct?.price) {
        setPriceStr(String(selectedProduct.price));
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const finalPrice =
        unitPrice > 0 ? unitPrice : (selectedProduct?.price ?? 0);
      if (finalPrice <= 0) {
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setSubmitting(true);
      try {
        const finalPrice =
          unitPrice > 0 ? unitPrice : (selectedProduct?.price ?? 0);
        await submitVente({
          date: new Date().toISOString().slice(0, 10),
          typeVente: "comptoir",
          productId,
          soldQty,
          unitPrice: finalPrice,
          audioBlobs,
        });
        toast.success(tVente("toastOk"));
        router.replace("/vente/liste");
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
      icon={ShoppingCart}
      title={t("saleTitle")}
      step={step + 1}
      totalSteps={TOTAL_STEPS}
    >
      {!isApiEnabled() ? (
        <Alert>
          <AlertDescription>{tCommon("apiNotConfigured")}</AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <SimpleChoiceGrid
          options={productOptions.map((p) => ({
            id: p.id,
            label: p.label,
            selected: p.id === productId,
          }))}
          onSelect={(id) => {
            setProductId(id);
            const found = productOptions.find((x) => x.id === id);
            if (found?.price) {
              setPriceStr(String(found.price));
            }
          }}
          columns={2}
        />
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
        <SimpleNumericPad
          value={priceStr}
          onChange={setPriceStr}
          allowDecimal={false}
          suffix="FCFA"
        />
      ) : null}

      {step === 3 ? (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/8 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("totalLabel")}</p>
            <p className="text-4xl font-bold tabular-nums">
              {total.toLocaleString()} FCFA
            </p>
            <p className="mt-2 text-lg font-medium">{selectedProduct?.label}</p>
            <p className="text-muted-foreground">
              {soldQty} {t("kg")} × {unitPrice.toLocaleString()}
            </p>
          </div>
          <AudioRecorder onBlobsChange={setAudioBlobs} />
        </div>
      ) : null}

      <SimpleConfirmBar
        onBack={step > 0 ? goBack : undefined}
        onNext={goNext}
        backLabel={t("back")}
        nextLabel={step === TOTAL_STEPS - 1 ? t("finish") : t("next")}
        nextDisabled={
          (step === 0 && !productId) ||
          (step === 1 && soldQty <= 0) ||
          (step === 2 && unitPrice <= 0 && !(selectedProduct && selectedProduct.price > 0))
        }
        nextLoading={submitting}
      />
    </SimpleStepLayout>
  );
}
