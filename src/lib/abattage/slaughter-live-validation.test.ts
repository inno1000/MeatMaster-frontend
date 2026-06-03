import { describe, expect, it } from "vitest";
import {
  analyzeSlaughterLive,
  getSlaughterValidationIssues,
  isDistributionLineOver,
  maxKgForDistributionLine,
} from "./slaughter-live-validation";

describe("slaughter-live-validation", () => {
  const baseWeights = [
    { categorieValeur: "viande", poidsKg: 100 },
    { categorieValeur: "tripes", poidsKg: 20 },
  ];

  it("detects over-distribution per category", () => {
    const data = {
      categoryWeights: baseWeights,
      distributions: [
        {
          boucherieId: "b1",
          lignes: [
            { categorieValeur: "viande", quantite: 60 },
            { categorieValeur: "tripes", quantite: 10 },
          ],
        },
        {
          boucherieId: "b2",
          lignes: [
            { categorieValeur: "viande", quantite: 50 },
            { categorieValeur: "tripes", quantite: 5 },
          ],
        },
      ],
    };
    const issues = getSlaughterValidationIssues(data);
    expect(issues.some((i) => i.code === "overDistributionCategory")).toBe(true);
    expect(isDistributionLineOver(data, 1, 0)).toBe(true);
    expect(maxKgForDistributionLine(data, 1, 0)).toBe(40);
  });

  it("computes rendement when animal poids vif is provided", () => {
    const analysis = analyzeSlaughterLive(
      {
        categoryWeights: [{ categorieValeur: "viande", poidsKg: 50 }],
        distributions: [
          {
            boucherieId: "b1",
            lignes: [{ categorieValeur: "viande", quantite: 50 }],
          },
        ],
      },
      { animalPoidsVifKg: 100 },
    );
    expect(analysis.rendementPct).toBe(50);
    expect(analysis.canSubmit).toBe(true);
    expect(analysis.totalRemainingKg).toBe(0);
  });
});
