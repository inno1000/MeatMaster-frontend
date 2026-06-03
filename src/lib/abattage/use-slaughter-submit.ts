"use client";

import { boucherieV1, uploadAudioBlobs } from "@/lib/api";
import { unwrapDataObject } from "@/lib/api/unwrap";
import { coerceApiScalarId } from "@/lib/api/coerce-id";
import { buildLignesFromCategoryWeights } from "@/lib/produits/slaughter-form";

export type CategoryWeightInput = {
  categorieValeur: string;
  poidsKg: number | "";
};

export type DistributionLigneInput = {
  categorieValeur: string;
  quantite: number | "";
  prixVente?: number | "";
};

export type DistributionInput = {
  boucherieId: string;
  lignes: DistributionLigneInput[];
};

export type SlaughterSubmitInput = {
  animalId: string;
  dateAbattage: string;
  categoryWeights: CategoryWeightInput[];
  notes?: string;
  distributions: DistributionInput[];
  audioBlobs?: Blob[];
};

export async function submitSlaughter(values: SlaughterSubmitInput): Promise<string> {
  const abattageLignes = buildLignesFromCategoryWeights(values.categoryWeights);
  if (abattageLignes.length === 0) {
    throw new Error("atLeastOneCategory");
  }

  const poidsCarcasse = abattageLignes.reduce((sum, l) => sum + l.poids_kg, 0);
  const attachmentIds = await uploadAudioBlobs(values.audioBlobs ?? []);

  const abattageBody: Record<string, unknown> = {
    animal_id: coerceApiScalarId(values.animalId),
    date_abattage: values.dateAbattage,
    poids_carcasse_kg: poidsCarcasse,
    lignes: abattageLignes,
    notes: values.notes || undefined,
    ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
  };

  const abRaw = await boucherieV1.abattages.create(abattageBody);
  const abattageId = String(unwrapDataObject(abRaw).id ?? "");
  if (!abattageId) {
    throw new Error("missingSlaughterIdInResponse");
  }

  for (const dist of values.distributions) {
    const distLignes: {
      categorie: string;
      poids_kg: number;
      prix_par_kg?: number;
    }[] = [];

    for (const ligne of dist.lignes) {
      const kg = Number(ligne.quantite) || 0;
      if (kg <= 0) {
        continue;
      }
      const prix =
        ligne.prixVente !== "" && ligne.prixVente !== undefined
          ? Number(ligne.prixVente)
          : undefined;
      distLignes.push({
        categorie: ligne.categorieValeur,
        poids_kg: kg,
        ...(prix !== undefined && Number.isFinite(prix)
          ? { prix_par_kg: prix }
          : {}),
      });
    }

    if (distLignes.length === 0) {
      continue;
    }

    await boucherieV1.distributions.create({
      abattage_id: abattageId,
      boucherie_id: coerceApiScalarId(dist.boucherieId),
      lignes: distLignes,
    });
  }

  return abattageId;
}
