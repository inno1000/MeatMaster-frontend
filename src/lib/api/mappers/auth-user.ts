import type { User, UserRole } from "@/lib/schemas/auth";

/** Rôles renvoyés par l’API Laravel (`fournisseur` ; `caissier` encore accepté pour d’anciennes lignes). */
export type ApiRole = "admin" | "boucher" | "fournisseur";

export const mapApiRoleToApp = (role: string): UserRole => {
  const r = role.toLowerCase();
  if (r === "admin") {
    return "admin";
  }
  if (r === "boucher") {
    return "butcher";
  }
  /** Fournisseur : une seule entrée UI `supplier`. */
  if (r === "fournisseur" || r === "caissier") {
    return "supplier";
  }
  return "butcher";
};

export type ApiUserPayload = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  boucherie?: { nom?: string | null; id?: string | number | null } | null;
  boucherie_nom?: string | null;
  /** Plusieurs boucheries (fournisseur), ids normalisés dans `extractUserPayload`. */
  boucherie_ids?: string[];
  /** Noms issus de `boucheries[]` ou fusion avec la boucherie unique. */
  boucherie_names_from_pivot?: string[];
  /** Identifiant métier `fournisseurs` (ex. `fournisseur_id` sur le user Laravel). */
  fournisseurEntityId?: string | number;
  /** Compte User du fournisseur assigné à la boucherie du boucher (`fournisseur_user_id`). */
  fournisseurUserId?: string | number;
  /** Nom affiché du fournisseur assigné (`fournisseur_assigne.nom`). */
  supplierAssigneName?: string;
  /** Si l’API impose un changement de mot de passe (nom Laravel ou camelCase). */
  must_change_password?: boolean;
};

export type ToAppUserOptions = {
  /** Connexion avec le mot de passe d’organisation encore égal au défaut. */
  loginPasswordMatchesOrgDefault?: boolean;
};

export const toAppUser = (
  token: string,
  payload: ApiUserPayload,
  opts?: ToAppUserOptions,
): User => {
  const role = mapApiRoleToApp(payload.role ?? "boucher");
  const butcheryIds = payload.boucherie_ids ?? [];
  const pivotNames = payload.boucherie_names_from_pivot ?? [];
  const singleName =
    payload.boucherie?.nom ?? payload.boucherie_nom ?? undefined;
  const butcheries =
    pivotNames.length > 0
      ? pivotNames
      : singleName
        ? [singleName]
        : [];

  const mustChangePassword =
    payload.must_change_password === true ||
    opts?.loginPasswordMatchesOrgDefault === true;

  const fournisseurEntityId =
    payload.fournisseurEntityId !== undefined &&
    payload.fournisseurEntityId !== null
      ? String(payload.fournisseurEntityId)
      : undefined;

  const supplierUserId =
    payload.fournisseurUserId !== undefined &&
    payload.fournisseurUserId !== null
      ? String(payload.fournisseurUserId)
      : undefined;

  const supplierName =
    typeof payload.supplierAssigneName === "string" &&
    payload.supplierAssigneName.length > 0
      ? payload.supplierAssigneName
      : undefined;

  return {
    token,
    id:
      payload.id !== undefined && payload.id !== null
        ? String(payload.id)
        : undefined,
    email: payload.email ?? "",
    name: payload.name ?? "",
    role,
    butcheries,
    butcheryIds,
    ...(fournisseurEntityId ? { fournisseurEntityId } : {}),
    ...(supplierUserId ? { supplierUserId } : {}),
    ...(supplierName ? { supplierName } : {}),
    ...(mustChangePassword ? { mustChangePassword: true as const } : {}),
  };
};
