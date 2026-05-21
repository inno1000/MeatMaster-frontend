import { v1Url } from "@/lib/api/v1-url";
import { apiClient } from "@/lib/api/client";
import { extractUserPayload } from "@/lib/api/services/auth";
import type { ApiUserPayload } from "@/lib/api/mappers/auth-user";

/** Profil courant (`GET /auth/me`). */
export async function apiFetchMe(): Promise<ApiUserPayload> {
  const raw = await apiClient.get<unknown>(v1Url("/auth/me"));
  return extractUserPayload(raw);
}
