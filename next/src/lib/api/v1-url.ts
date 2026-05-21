import { getApiBaseUrl, getApiPrefix } from "@/lib/api/config";

/** Construit une URL absolue vers un chemin sous le préfixe API (`NEXT_PUBLIC_API_PREFIX`, défaut `/api/v1`). */
export const v1Url = (path: string): string => {
  const base = getApiBaseUrl();
  const prefix = getApiPrefix();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${p}`;
};

export type QueryParamRecord = Record<
  string,
  string | number | boolean | undefined | null
>;

/** Ajoute une query string ; ignore clés vides / undefined / null. */
export function v1UrlWithQuery(path: string, query?: QueryParamRecord): string {
  const baseUrl = v1Url(path);
  if (!query) {
    return baseUrl;
  }
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") {
      continue;
    }
    sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `${baseUrl}?${q}` : baseUrl;
}
