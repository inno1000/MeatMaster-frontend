import type { User, UserRole } from "@/lib/schemas/auth";

/** Rôles renvoyés par l’API Laravel (`caissier` = ancien nom métier, fusionné côté UI dans `supplier`). */
export type ApiRole = "admin" | "boucher" | "caissier";

export const mapApiRoleToApp = (role: string): UserRole => {
  const r = role.toLowerCase();
  if (r === "admin") {
    return "admin";
  }
  if (r === "boucher") {
    return "butcher";
  }
  /** Fournisseur : l’API peut exposer `caissier` ou un futur `fournisseur` — une seule entrée UI `supplier`. */
  if (r === "caissier" || r === "fournisseur") {
    return "supplier";
  }
  return "butcher";
};

export type ApiUserPayload = {
  name?: string;
  email?: string;
  role?: string;
  boucherie?: { nom?: string | null; id?: string | number | null } | null;
  boucherie_nom?: string | null;
};

export const toAppUser = (token: string, payload: ApiUserPayload): User => {
  const role = mapApiRoleToApp(payload.role ?? "boucher");
  const boucherieName =
    payload.boucherie?.nom ?? payload.boucherie_nom ?? undefined;
  const butcheries = boucherieName ? [boucherieName] : [];

  return {
    token,
    email: payload.email ?? "",
    name: payload.name ?? "",
    role,
    butcheries,
  };
};
