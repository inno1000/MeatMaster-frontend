export {
  isApiEnabled,
  getApiBaseUrl,
  getApiPrefix,
  API_PREFIX,
  /** @deprecated Utiliser `API_PREFIX`. */
  API_V1_PREFIX,
} from "@/lib/api/config";
export { v1Url, v1UrlWithQuery } from "@/lib/api/v1-url";
export { apiClient, apiUrl, ApiError, safeApiCall } from "@/lib/api/client";
export {
  apiLogin,
  apiLogout,
  apiRegister,
  extractUserPayload,
} from "@/lib/api/services/auth";
export { boucherieV1 } from "@/lib/api/services/boucherie-v1";
export {
  uploadAttachment,
  uploadAudioBlobs,
  fetchAttachmentBlob,
} from "@/lib/api/services/attachments";
export type { AttachmentDto } from "@/lib/api/services/attachments";
export type {
  AnimauxListParams,
  DistributionsListParams,
  RecettesListParams,
  ReceptionsListParams,
  StatsParams,
  VentesListParams,
  VersementsListParams,
} from "@/lib/api/services/boucherie-v1";
