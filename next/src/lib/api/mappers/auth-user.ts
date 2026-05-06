import type { User, UserRole } from "@/lib/schemas/auth";

/** Rôles renvoyés par l’API Laravel (doc). */
export type ApiRole = "admin" | "boucher" | "caissier";

export const mapApiRoleToApp = (role: string): UserRole => {
  const r = role.toLowerCase();
  if (r === "admin") {
    return "admin";
  }
  if (r === "boucher") {
    return "butcher";
  }
  if (r === "caissier") {
    return "caissier";
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
