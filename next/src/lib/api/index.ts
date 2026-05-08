export { isApiEnabled, getApiBaseUrl, API_V1_PREFIX } from "@/lib/api/config";
export { v1Url, v1UrlWithQuery } from "@/lib/api/v1-url";
export { apiClient, apiUrl, ApiError, safeApiCall } from "@/lib/api/client";
export {
  apiLogin,
  apiLogout,
  apiRegister,
  extractUserPayload,
} from "@/lib/api/services/auth";
export { boucherieV1 } from "@/lib/api/services/boucherie-v1";
export type {
  AnimauxListParams,
  DistributionsListParams,
  ReceptionsListParams,
  VentesListParams,
  VersementsListParams,
} from "@/lib/api/services/boucherie-v1";
