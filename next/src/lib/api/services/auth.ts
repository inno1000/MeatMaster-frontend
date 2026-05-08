import { z } from "zod";
import { LaravelLoginResponseSchema, type User } from "@/lib/schemas/auth";
import { v1Url } from "@/lib/api/v1-url";
import { toAppUser, type ApiUserPayload } from "@/lib/api/mappers/auth-user";

async function parseAuthJson(response: Response): Promise<unknown> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const msg = laravelMessage(data) ?? response.statusText;
    throw new Error(msg);
  }
  return data;
}

function laravelMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string") {
    return o.message;
  }
  if (o.errors && typeof o.errors === "object") {
    const errs = o.errors as Record<string, unknown>;
    const first = Object.values(errs)[0];
    if (Array.isArray(first) && first[0] !== undefined) {
      return String(first[0]);
    }
  }
  return null;
}

export function extractUserPayload(data: unknown): ApiUserPayload {
  if (!data || typeof data !== "object") {
    return {};
  }
  const root = data as Record<string, unknown>;
  const src =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const boucherieRaw = src.boucherie;
  const boucherie =
    boucherieRaw && typeof boucherieRaw === "object"
      ? (boucherieRaw as { nom?: string; id?: string | number })
      : undefined;
  const roleFromArray =
    Array.isArray(src.roles) && typeof src.roles[0] === "string"
      ? src.roles[0]
      : undefined;
  return {
    name: typeof src.name === "string" ? src.name : undefined,
    email: typeof src.email === "string" ? src.email : undefined,
    role:
      typeof src.role === "string"
        ? src.role
        : roleFromArray ?? undefined,
    boucherie: boucherie ?? undefined,
    boucherie_nom:
      typeof src.boucherie_nom === "string" ? src.boucherie_nom : undefined,
  };
}

/** Connexion Laravel Sanctum → utilisateur applicatif. */
export async function apiLogin(email: string, password: string): Promise<User> {
  const raw = await parseAuthJson(
    await fetch(v1Url("/auth/login"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    }),
  );

  const parsed = LaravelLoginResponseSchema.parse(raw);
  const token = parsed.token;

  const fromLogin = extractUserPayload({ data: parsed.data });

  try {
    const meRaw = await parseAuthJson(
      await fetch(v1Url("/auth/me"), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    const fromMe = extractUserPayload(meRaw);
    return toAppUser(token, { ...fromLogin, ...fromMe });
  } catch {
    return toAppUser(token, fromLogin);
  }
}

export async function apiLogout(token: string): Promise<void> {
  try {
    await fetch(v1Url("/auth/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    /* offline */
  }
}

const RegisterApiBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string(),
  /** UUID ou id numérique selon le backend Laravel. */
  boucherie_id: z.union([z.string().min(1), z.number().int().positive()]).optional(),
  role: z.enum(["admin", "boucher", "caissier"]).optional(),
});

export type RegisterApiInput = z.infer<typeof RegisterApiBodySchema>;

/** Inscription API (corps aligné doc Laravel). Retourne l’utilisateur courant + token. */
export async function apiRegister(body: RegisterApiInput): Promise<User> {
  const raw = await parseAuthJson(
    await fetch(v1Url("/auth/register"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(RegisterApiBodySchema.parse(body)),
    }),
  );

  const parsed = LaravelLoginResponseSchema.parse(raw);
  const token = parsed.token;
  const payload = extractUserPayload({ data: parsed.data });
  return toAppUser(token, payload);
}
