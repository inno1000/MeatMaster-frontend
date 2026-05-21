import type { z } from "zod";
import { formatError } from "@/lib/format-error";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getApiBaseUrl } from "@/lib/api/config";

const getBaseUrl = () => getApiBaseUrl();

function laravelErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  if (o.errors && typeof o.errors === "object") {
    const errs = o.errors as Record<string, unknown>;
    const firstKey = Object.keys(errs)[0];
    const val = firstKey ? errs[firstKey] : undefined;
    if (Array.isArray(val) && val[0] !== undefined) {
      return String(val[0]);
    }
  }
  return null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const buildHeaders = (
  url: string,
  init?: HeadersInit,
  jsonBody?: boolean,
): Headers => {
  const headers = new Headers(init);
  const base = getBaseUrl();
  const token = useAuthStore.getState().user?.token as string | undefined;

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (jsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && base && url.startsWith(base)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

export const parseJson = async <T>(
  response: Response,
  schema?: z.ZodType<T>,
): Promise<T> => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const { user, logout } = useAuthStore.getState();
      if (user) {
        logout();
      }
    }
    const message =
      laravelErrorMessage(data) ||
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      response.statusText;
    throw new ApiError(message, response.status, data);
  }

  if (schema) {
    return schema.parse(data);
  }
  return data as T;
};

export const apiClient = {
  get: async <T>(url: string, schema?: z.ZodType<T>): Promise<T> => {
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(url),
    });
    return parseJson(response, schema);
  },

  post: async <T>(
    url: string,
    body?: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> => {
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(url, undefined, !!body),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJson(response, schema);
  },

  put: async <T>(
    url: string,
    body?: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(url, undefined, !!body),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJson(response, schema);
  },

  patch: async <T>(
    url: string,
    body?: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> => {
    const response = await fetch(url, {
      method: "PATCH",
      headers: buildHeaders(url, undefined, !!body),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJson(response, schema);
  },

  delete: async <T>(url: string, schema?: z.ZodType<T>): Promise<T> => {
    const response = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(url),
    });
    return parseJson(response, schema);
  },
};

export const apiUrl = (path: string) => {
  const base = getBaseUrl().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const safeApiCall = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    throw new Error(formatError(e));
  }
};
