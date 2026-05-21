"use client";

import { useTranslations } from "next-intl";
import { ParentCard } from "@/components/shared/parent-card";
import type { AbattageDetailViewModel } from "@/lib/api/mappers/abattage-detail";
import { AttachmentAudioPlayer } from "@/components/shared/attachment-audio-player";
import { Beef, Mic, Share2 } from "lucide-react";

type Props = {
  detail: AbattageDetailViewModel;
};

export const AbattageDetailView = ({ detail }: Props) => {
  const t = useTranslations("abattage");

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(n);

  const rendement =
    detail.rendementPct ??
    (detail.animalPoidsVifKg && detail.animalPoidsVifKg > 0
      ? Math.round(
          (detail.poidsCarcasseKg / detail.animalPoidsVifKg) * 1000,
        ) / 10
      : null);

  const totalDistribue = detail.distributions.reduce(
    (acc, d) => acc + d.quantite,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("detailTitle")}</h1>
        <p className="text-muted-foreground">{t("detailSubtitle")}</p>
      </div>

      <ParentCard
        title={t("animal")}
        subtitle={`${detail.date || "—"} · ${detail.poidsCarcasseKg} kg carcasse`}
        titleIcon={Beef}
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t("animal")}</dt>
            <dd className="font-medium">{detail.animalEspece}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tag</dt>
            <dd className="font-medium">{detail.animalTag}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("meatWeight")}</dt>
            <dd className="font-medium">{detail.poidsCarcasseKg} kg</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Poids vif</dt>
            <dd className="font-medium">
              {detail.animalPoidsVifKg != null
                ? `${detail.animalPoidsVifKg} kg`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Prix achat</dt>
            <dd className="font-medium">
              {detail.animalPrixAchat != null
                ? fmtMoney(detail.animalPrixAchat)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("yieldMeat")}</dt>
            <dd className="font-medium">
              {rendement != null ? `${rendement}%` : "—"}
            </dd>
          </div>
          {detail.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="font-medium">{detail.notes}</dd>
            </div>
          ) : null}
        </dl>
      </ParentCard>

      {detail.attachments.length > 0 ? (
        <ParentCard title={t("audioNotes")} titleIcon={Mic}>
          <ul className="space-y-4">
            {detail.attachments.map((att) => (
              <li key={att.id || att.streamUrl}>
                <AttachmentAudioPlayer
                  streamUrl={att.streamUrl}
                  label={att.label}
                />
              </li>
            ))}
          </ul>
        </ParentCard>
      ) : null}

      <ParentCard title={t("distribution")} titleIcon={Share2}>
        <p className="mb-4 text-sm text-muted-foreground">
          {detail.distributions.length} lot(s) · {totalDistribue.toFixed(2)} kg
          distribués
        </p>
        {detail.distributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune distribution enregistrée pour cet abattage.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {detail.distributions.map((d) => (
              <div
                key={d.id || `${d.boucherieLabel}-${d.produitLabel}`}
                className="rounded-xl border border-border p-4"
              >
                <h3 className="font-semibold">{d.boucherieLabel}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {d.produitLabel}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {d.quantite.toFixed(2)} kg
                </p>
                <p className="mt-1 text-sm">
                  Statut : <span className="font-medium">{d.statut}</span>
                </p>
                {d.notes ? (
                  <p className="mt-2 text-sm text-muted-foreground">{d.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </ParentCard>
    </div>
  );
};
