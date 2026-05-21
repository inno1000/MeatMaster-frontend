/** URL de base sans slash final (ex. https://boucherie-api.onrender.com). */
export const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");

export const isApiEnabled = (): boolean => Boolean(getApiBaseUrl());

const DEFAULT_API_PREFIX = "/api/v1";

/**
 * Chemin API après l’origine : `/api/v1`, `/api/v2`, etc.
 * Défini par `NEXT_PUBLIC_API_PREFIX` (sans slash final ; un slash initial est ajouté si absent).
 */
export const getApiPrefix = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_PREFIX ?? DEFAULT_API_PREFIX).trim();
  const normalized = (raw.startsWith("/") ? raw : `/${raw}`).replace(/\/+$/, "");
  return normalized || DEFAULT_API_PREFIX;
};

/** Préfixe effectif des routes REST (ex. `/api/v1`). */
export const API_PREFIX = getApiPrefix();

/** @deprecated Utiliser `API_PREFIX` ou `getApiPrefix()`. */
export const API_V1_PREFIX = API_PREFIX;
