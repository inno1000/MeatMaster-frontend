/** Référentiel plateforme : fournisseurs et boucheries (mock, aligné sur les données démo). */

export const ALL_PLATFORM_BUTCHERIES: readonly string[] = [
  "Boucherie Halal",
  "Boucherie Centrale",
  "Boucherie du Marché",
];

export type PlatformSupplierConfig = {
  email: string;
  token: string;
  name: string;
  defaultButcheries: string[];
};

export const PLATFORM_SUPPLIERS: readonly PlatformSupplierConfig[] = [
  {
    email: "fournisseur@meatmaster.local",
    token: "mock-jwt-supplier-a",
    name: "Fournisseur Nord",
    defaultButcheries: ["Boucherie Halal", "Boucherie Centrale"],
  },
  {
    email: "fournisseur2@meatmaster.local",
    token: "mock-jwt-supplier-b",
    name: "Fournisseur Sud",
    defaultButcheries: ["Boucherie du Marché"],
  },
];

export const getDefaultSupplierButcheries = (email: string): string[] => {
  const key = email.trim().toLowerCase();
  const row = PLATFORM_SUPPLIERS.find((s) => s.email === key);
  return row ? [...row.defaultButcheries] : [];
};

export const isKnownSupplierEmail = (email: string): boolean => {
  const key = email.trim().toLowerCase();
  return PLATFORM_SUPPLIERS.some((s) => s.email === key);
};
