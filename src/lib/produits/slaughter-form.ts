import { pickDisplayLabel } from "@/lib/display/reference-label";

export type ProduitRow = Record<string, unknown>;

export type CategorieProduitRef = {
  valeur: string;
  libelle: string;
  ordre: number;
};

/** Extrait le code catégorie (`categorie_produit` string ou objet référentiel). */
export function getProduitCategoryCode(produit: ProduitRow): string {
  const raw =
    produit.categorie ?? produit.categorie_produit ?? produit.category;
  if (typeof raw === "string") {
    return raw.trim().toLowerCase();
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const key of ["valeur", "code", "value", "slug"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) {
        return v.trim().toLowerCase();
      }
    }
    const label = pickDisplayLabel(o);
    if (label) {
      return label.trim().toLowerCase().replace(/\s+/g, "_");
    }
  }
  return "";
}

export function parseCategoriesFromReferentiel(
  items: unknown[] | undefined,
): CategorieProduitRef[] {
  const rows: CategorieProduitRef[] = [];
  for (const item of items ?? []) {
    const r = item as Record<string, unknown>;
    const valeur = String(r.valeur ?? r.code ?? r.value ?? "")
      .trim()
      .toLowerCase();
    if (!valeur) {
      continue;
    }
    rows.push({
      valeur,
      libelle: pickDisplayLabel(r) || valeur.replace(/_/g, " "),
      ordre: Number(r.ordre ?? 999),
    });
  }
  return rows.sort((a, b) => a.ordre - b.ordre || a.libelle.localeCompare(b.libelle, "fr"));
}

/** Premier produit du catalogue pour une catégorie donnée. */
export function pickProduitForCategory(
  produits: ProduitRow[],
  categoryCode: string,
): ProduitRow | undefined {
  const code = categoryCode.trim().toLowerCase();
  return produits.find((p) => getProduitCategoryCode(p) === code);
}

export function sumWeightsByCategory(
  entries: { categorieValeur: string; poidsKg: unknown }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) {
    const kg = Number(e.poidsKg) || 0;
    if (kg > 0) {
      map.set(e.categorieValeur, kg);
    }
  }
  return map;
}

export function sumDistributedByCategory(
  distributions: {
    lignes: { categorieValeur: string; quantite: unknown }[];
  }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const dist of distributions) {
    for (const ligne of dist.lignes) {
      const kg = Number(ligne.quantite) || 0;
      if (kg <= 0) {
        continue;
      }
      const cat = ligne.categorieValeur;
      map.set(cat, (map.get(cat) ?? 0) + kg);
    }
  }
  return map;
}
