import { API_V1_PREFIX, getApiBaseUrl } from "@/lib/api/config";

/** Construit une URL absolue vers un chemin sous `/api/v1`. */
export const v1Url = (path: string): string => {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${API_V1_PREFIX}${p}`;
};
