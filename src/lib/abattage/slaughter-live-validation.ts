import {
  sumDistributedByCategory,
  sumWeightsByCategory,
} from "@/lib/produits/slaughter-form";

export type SlaughterCategoryWeight = {
  categorieValeur: string;
  poidsKg: unknown;
};

export type SlaughterDistributionLigne = {
  categorieValeur: string;
  quantite: unknown;
  prixVente?: unknown;
};

export type SlaughterDistribution = {
  boucherieId: string;
  lignes: SlaughterDistributionLigne[];
};

export type SlaughterFormSnapshot = {
  categoryWeights: SlaughterCategoryWeight[];
  distributions: SlaughterDistribution[];
};

export type SlaughterIssueCode =
  | "atLeastOneCategory"
  | "duplicateButcher"
  | "overDistributionCategory"
  | "noDistribution";

export type SlaughterValidationIssue = {
  code: SlaughterIssueCode;
  path: ("categoryWeights" | "distributions")[];
  categoryValeur?: string;
};

export type CategoryDistributionStatus = {
  categorieValeur: string;
  availableKg: number;
  distributedKg: number;
  remainingKg: number;
  state: "empty" | "partial" | "complete" | "over";
};

export type SlaughterLiveAnalysis = {
  totalsByCat: Map<string, number>;
  distributedByCat: Map<string, number>;
  totalSlaughterKg: number;
  totalDistributedKg: number;
  totalRemainingKg: number;
  rendementPct: number | null;
  categoryStatuses: CategoryDistributionStatus[];
  issues: SlaughterValidationIssue[];
  canSubmit: boolean;
  duplicateButcherIndices: Set<number>;
};

function sumMapValues(map: Map<string, number>): number {
  let sum = 0;
  for (const v of map.values()) {
    sum += v;
  }
  return sum;
}

/** Issues bloquant la soumission (aligné sur le schéma Zod). */
export function getSlaughterValidationIssues(
  data: SlaughterFormSnapshot,
): SlaughterValidationIssue[] {
  const issues: SlaughterValidationIssue[] = [];
  const totalsByCat = sumWeightsByCategory(data.categoryWeights);

  if (totalsByCat.size === 0) {
    issues.push({
      code: "atLeastOneCategory",
      path: ["categoryWeights"],
    });
  }

  const butcherIds = data.distributions
    .map((d) => d.boucherieId)
    .filter((id) => id.length > 0);
  if (butcherIds.length > 0 && new Set(butcherIds).size !== butcherIds.length) {
    issues.push({
      code: "duplicateButcher",
      path: ["distributions"],
    });
  }

  const distByCat = sumDistributedByCategory(data.distributions);
  for (const [cat, total] of totalsByCat) {
    const distributed = distByCat.get(cat) ?? 0;
    if (distributed > total) {
      issues.push({
        code: "overDistributionCategory",
        path: ["distributions"],
        categoryValeur: cat,
      });
      break;
    }
  }

  const hasAnyDistribution = data.distributions.some((d) =>
    d.lignes.some((l) => (Number(l.quantite) || 0) > 0),
  );
  if (totalsByCat.size > 0 && !hasAnyDistribution) {
    issues.push({
      code: "noDistribution",
      path: ["distributions"],
    });
  }

  return issues;
}

export function analyzeSlaughterLive(
  data: SlaughterFormSnapshot,
  options?: { animalPoidsVifKg?: number | null },
): SlaughterLiveAnalysis {
  const totalsByCat = sumWeightsByCategory(data.categoryWeights);
  const distributedByCat = sumDistributedByCategory(data.distributions);
  const totalSlaughterKg = sumMapValues(totalsByCat);
  const totalDistributedKg = sumMapValues(distributedByCat);
  const totalRemainingKg = Math.max(0, totalSlaughterKg - totalDistributedKg);

  const poidsVif = options?.animalPoidsVifKg ?? null;
  const rendementPct =
    poidsVif != null && poidsVif > 0 && totalSlaughterKg > 0
      ? Math.round((totalSlaughterKg / poidsVif) * 1000) / 10
      : null;

  const categoryStatuses: CategoryDistributionStatus[] = [];
  for (const [categorieValeur, availableKg] of totalsByCat) {
    const distributedKg = distributedByCat.get(categorieValeur) ?? 0;
    const remainingKg = availableKg - distributedKg;
    let state: CategoryDistributionStatus["state"] = "empty";
    if (distributedKg > availableKg) {
      state = "over";
    } else if (distributedKg === availableKg && availableKg > 0) {
      state = "complete";
    } else if (distributedKg > 0) {
      state = "partial";
    }
    categoryStatuses.push({
      categorieValeur,
      availableKg,
      distributedKg,
      remainingKg,
      state,
    });
  }

  const issues = getSlaughterValidationIssues(data);
  const duplicateButcherIndices = findDuplicateButcherIndices(data.distributions);

  return {
    totalsByCat,
    distributedByCat,
    totalSlaughterKg,
    totalDistributedKg,
    totalRemainingKg,
    rendementPct,
    categoryStatuses,
    issues,
    canSubmit: issues.length === 0,
    duplicateButcherIndices,
  };
}

function findDuplicateButcherIndices(
  distributions: SlaughterDistribution[],
): Set<number> {
  const seen = new Map<string, number>();
  const duplicates = new Set<number>();
  distributions.forEach((dist, index) => {
    const id = dist.boucherieId.trim();
    if (!id) {
      return;
    }
    const first = seen.get(id);
    if (first !== undefined) {
      duplicates.add(first);
      duplicates.add(index);
    } else {
      seen.set(id, index);
    }
  });
  return duplicates;
}

/** Poids max saisissable sur une ligne sans dépasser le stock de la catégorie. */
export function maxKgForDistributionLine(
  data: SlaughterFormSnapshot,
  distIndex: number,
  ligneIndex: number,
): number {
  const ligne = data.distributions[distIndex]?.lignes[ligneIndex];
  if (!ligne) {
    return 0;
  }
  const cat = ligne.categorieValeur;
  const available = sumWeightsByCategory(data.categoryWeights).get(cat) ?? 0;
  if (available <= 0) {
    return 0;
  }

  let usedElsewhere = 0;
  data.distributions.forEach((dist, di) => {
    dist.lignes.forEach((l, li) => {
      if (di === distIndex && li === ligneIndex) {
        return;
      }
      if (l.categorieValeur === cat) {
        usedElsewhere += Number(l.quantite) || 0;
      }
    });
  });

  return Math.max(0, available - usedElsewhere);
}

export function isDistributionLineOver(
  data: SlaughterFormSnapshot,
  distIndex: number,
  ligneIndex: number,
): boolean {
  const ligne = data.distributions[distIndex]?.lignes[ligneIndex];
  if (!ligne) {
    return false;
  }
  const qty = Number(ligne.quantite) || 0;
  if (qty <= 0) {
    return false;
  }
  return qty > maxKgForDistributionLine(data, distIndex, ligneIndex);
}
