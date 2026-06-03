import { pickDisplayLabel } from "@/lib/display/reference-label";
import { enumLabel } from "@/lib/i18n/enum-label";

export type DistributionListRow = {
  id: string;
  abattageId: string;
  abattageLabel: string;
  boucherieLabel: string;
  summaryLabel: string;
  quantite: number;
  statut: string;
  dateIso: string;
  canCancel: boolean;
};

export function formatDistributionListDate(
  iso: string,
  locale: string,
): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 10) || "—";
  }
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAbattageLabel(
  abattage: Record<string, unknown> | undefined,
  locale: string,
  noLabel: string,
): string {
  if (!abattage) {
    return noLabel;
  }
  const date = String(abattage.date_abattage ?? "").trim();
  if (date) {
    return formatDistributionListDate(
      date.includes("T") ? date : `${date}T12:00:00`,
      locale,
    );
  }
  return pickDisplayLabel(abattage, ["reference", "nom", "name"]) || noLabel;
}

export function distributionCategoriesSummary(
  row: Record<string, unknown>,
  tCommon: (key: string) => string,
): string {
  const lignes = Array.isArray(row.lignes)
    ? (row.lignes as Record<string, unknown>[])
    : [];
  if (lignes.length > 0) {
    const parts = lignes
      .map((l) => {
        const code = String(l.categorie ?? "");
        const kg = Number(l.poids_kg) || 0;
        const label = enumLabel(tCommon, code) || code.replace(/_/g, " ");
        return kg > 0 ? `${label} (${kg} kg)` : label;
      })
      .filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" · ");
    }
  }
  return pickDisplayLabel(row.produit as Record<string, unknown> | undefined) || "";
}

export function mapDistributionListRow(
  item: unknown,
  locale: string,
  tCommon: (key: string) => string,
): DistributionListRow {
  const row = item as Record<string, unknown>;
  const abNested = row.abattage as Record<string, unknown> | undefined;
  const bcNested = row.boucherie as Record<string, unknown> | undefined;
  const statut = String(row.statut ?? "");

  return {
    id: String(row.id ?? ""),
    abattageId: String(row.abattage_id ?? ""),
    abattageLabel: formatAbattageLabel(abNested, locale, tCommon("noLabel")),
    boucherieLabel:
      pickDisplayLabel(bcNested) || tCommon("noLabel"),
    summaryLabel: distributionCategoriesSummary(row, tCommon),
    quantite: Number(row.quantite ?? 0),
    statut,
    dateIso: String(row.created_at ?? ""),
    canCancel: statut === "en_attente",
  };
}

export function filterDistributionRows(
  rows: DistributionListRow[],
  search: string,
  tCommon: (key: string) => string,
): DistributionListRow[] {
  const q = search.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter((row) => {
    const statusLabel = enumLabel(tCommon, row.statut).toLowerCase();
    return (
      row.boucherieLabel.toLowerCase().includes(q) ||
      row.summaryLabel.toLowerCase().includes(q) ||
      row.abattageLabel.toLowerCase().includes(q) ||
      row.statut.toLowerCase().includes(q) ||
      statusLabel.includes(q)
    );
  });
}
