import { pickDisplayLabel } from "@/lib/display/reference-label";

export type DistributionRow = Record<string, unknown>;

/** Distributions encore réceptionnables (en attente, sans réception). */
export function filterDistributionsForReception(items: unknown[]): DistributionRow[] {
  return (items ?? []).filter((item) => {
    const d = item as DistributionRow;
    if (String(d.statut ?? "") !== "en_attente") {
      return false;
    }
    return d.reception == null;
  }) as DistributionRow[];
}

export function formatDistributionOptionLabel(
  d: DistributionRow,
  noLabel: string,
): string {
  const q = Number(d.quantite) || 0;
  const created = String(d.created_at ?? "").slice(0, 10);
  const produit = pickDisplayLabel(d.produit as Record<string, unknown> | undefined);
  const lignes = Array.isArray(d.lignes)
    ? (d.lignes as Record<string, unknown>[])
    : [];
  const categoriesLabel = lignes
    .map((l) => {
      const cat = String(l.categorie ?? "").replace(/_/g, " ");
      const kg = Number(l.poids_kg);
      return kg > 0 ? `${cat} (${kg} kg)` : cat;
    })
    .filter(Boolean)
    .join(", ");
  const parts = [
    created && created !== "" ? created : null,
    q > 0 ? `${q} kg` : null,
    categoriesLabel || produit || null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : noLabel;
}

export function expectedReceptionQuantity(d: DistributionRow): number {
  const total = Number(d.quantite) || 0;
  if (total > 0) {
    return total;
  }
  const lignes = Array.isArray(d.lignes)
    ? (d.lignes as Record<string, unknown>[])
    : [];
  return lignes.reduce((sum, l) => sum + (Number(l.poids_kg) || 0), 0);
}
