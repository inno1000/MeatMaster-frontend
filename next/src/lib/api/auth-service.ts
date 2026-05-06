/**
 * Compatibilité : les chemins réels sont sous `/api/v1` (voir `services/auth.ts`).
 */
import type { User } from "@/lib/schemas/auth";
import { apiLogin, extractUserPayload } from "@/lib/api/services/auth";
import { v1Url } from "@/lib/api/v1-url";
import { toAppUser } from "@/lib/api/mappers/auth-user";

export const authEndpoints = {
  loginUrl: () => v1Url("/auth/login"),
  userUrl: () => v1Url("/auth/me"),
};

/** @deprecated Préférer `apiLogin` depuis `@/lib/api`. */
export const loginRequest = async (
  email: string,
  password: string,
): Promise<{ accessToken: string }> => {
  const user = await apiLogin(email, password);
  return { accessToken: user.token };
};

/** @deprecated Préférer `/auth/me` via `apiLogin` qui hydrate déjà le profil. */
export const fetchCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await fetch(authEndpoints.userUrl(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : response.statusText;
    throw new Error(message);
  }
  return toAppUser(accessToken, extractUserPayload(data));
};
