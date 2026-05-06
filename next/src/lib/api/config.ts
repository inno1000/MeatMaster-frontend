/** URL de base sans slash final (ex. https://boucherie-api.onrender.com). */
export const getApiBaseUrl = (): string =>
  (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");

export const isApiEnabled = (): boolean => Boolean(getApiBaseUrl());

/** Préfixe versionné Laravel (doc Scribe). */
export const API_V1_PREFIX = "/api/v1";
