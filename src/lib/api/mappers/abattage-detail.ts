import { unwrapDataArray, unwrapDataObject } from "@/lib/api/unwrap";
import { pickDisplayLabel } from "@/lib/display/reference-label";

export type AbattageDistributionRow = {
  id: string;
  boucherieLabel: string;
  produitLabel: string;
  quantite: number;
  statut: string;
  notes: string;
};

export type AbattageAttachmentRow = {
  id: string;
  label: string;
  streamUrl: string;
};

export type AbattageDetailViewModel = {
  id: string;
  date: string;
  poidsCarcasseKg: number;
  rendementPct: number | null;
  notes: string;
  animalEspece: string;
  animalPoidsVifKg: number | null;
  animalPrixAchat: number | null;
  animalTag: string;
  distributions: AbattageDistributionRow[];
  attachments: AbattageAttachmentRow[];
};

export function mapAbattageDetailFromApi(raw: unknown): AbattageDetailViewModel {
  const ab = unwrapDataObject(raw);
  const animal =
    ab.animal && typeof ab.animal === "object"
      ? (ab.animal as Record<string, unknown>)
      : {};

  const distributions = unwrapDataArray(ab.distributions).map((item) => {
    const d = item as Record<string, unknown>;
    const boucherie =
      d.boucherie && typeof d.boucherie === "object"
        ? (d.boucherie as Record<string, unknown>)
        : {};
    const produit =
      d.produit && typeof d.produit === "object"
        ? (d.produit as Record<string, unknown>)
        : {};

    return {
      id: String(d.id ?? ""),
      boucherieLabel: pickDisplayLabel(boucherie) || String(d.boucherie_id ?? "—"),
      produitLabel: pickDisplayLabel(produit) || String(d.produit_id ?? "—"),
      quantite: Number(d.quantite ?? 0),
      statut: String(d.statut ?? "—"),
      notes: String(d.notes ?? ""),
    };
  });

  const attachments = unwrapDataArray(ab.attachments).map((item, index) => {
    const a = item as Record<string, unknown>;
    return {
      id: String(a.id ?? ""),
      label: String(a.original_name ?? `Audio ${index + 1}`),
      streamUrl: String(a.stream_url ?? ""),
    };
  });

  return {
    id: String(ab.id ?? ""),
    date: String(ab.date_abattage ?? ""),
    poidsCarcasseKg: Number(ab.poids_carcasse_kg ?? 0),
    rendementPct:
      ab.rendement_pct !== undefined && ab.rendement_pct !== null
        ? Number(ab.rendement_pct)
        : null,
    notes: String(ab.notes ?? ""),
    animalEspece: String(animal.espece ?? "—"),
    animalPoidsVifKg:
      animal.poids_vif_kg !== undefined && animal.poids_vif_kg !== null
        ? Number(animal.poids_vif_kg)
        : null,
    animalPrixAchat:
      animal.prix_achat !== undefined && animal.prix_achat !== null
        ? Number(animal.prix_achat)
        : null,
    animalTag: String(animal.numero_tag ?? "—"),
    distributions,
    attachments,
  };
}
