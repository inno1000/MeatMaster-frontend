import { z } from "zod";
import { LaravelLoginResponseSchema, type User } from "@/lib/schemas/auth";
import { v1Url } from "@/lib/api/v1-url";
import { toAppUser, type ApiUserPayload } from "@/lib/api/mappers/auth-user";
import { getDefaultNewUserPassword } from "@/lib/default-password";

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

function normalizeIdArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((x) => String(x)).filter((s) => s.length > 0);
}

/** Extrait les ids de boucheries depuis une ligne API utilisateur (`boucherie_ids`, relation `boucheries`, ou `boucherie_id`). */
export function extractBoucherieIdsFromUserSrc(
  src: Record<string, unknown>,
): string[] {
  const direct = normalizeIdArray(src.boucherie_ids);
  if (direct.length > 0) {
    return direct;
  }
  const camel = normalizeIdArray(src.boucherieIds);
  if (camel.length > 0) {
    return camel;
  }
  const nested = src.boucheries;
  if (Array.isArray(nested)) {
    const ids: string[] = [];
    for (const item of nested) {
      if (item && typeof item === "object") {
        const id = (item as Record<string, unknown>).id;
        if (id !== undefined && id !== null) {
          ids.push(String(id));
        }
      }
    }
    if (ids.length > 0) {
      return ids;
    }
  }
  const single = src.boucherie_id;
  if (single !== undefined && single !== null && String(single) !== "") {
    return [String(single)];
  }
  const fromEmbedded =
    src.boucherie &&
    typeof src.boucherie === "object" &&
    (src.boucherie as Record<string, unknown>).id != null
      ? String((src.boucherie as Record<string, unknown>).id)
      : "";
  if (fromEmbedded) {
    return [fromEmbedded];
  }
  return [];
}

function extractBoucherieNamesFromUserSrc(
  src: Record<string, unknown>,
): string[] {
  const nested = src.boucheries;
  if (Array.isArray(nested)) {
    const names: string[] = [];
    for (const item of nested) {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const n = o.nom ?? o.name;
        if (typeof n === "string" && n.length > 0) {
          names.push(n);
        }
      }
    }
    if (names.length > 0) {
      return names;
    }
  }
  return [];
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

  const boucherie_ids = extractBoucherieIdsFromUserSrc(src);
  let boucherie_names_from_pivot = extractBoucherieNamesFromUserSrc(src);
  const singleNom =
    typeof src.boucherie_nom === "string" && src.boucherie_nom
      ? src.boucherie_nom
      : boucherie?.nom
        ? String(boucherie.nom)
        : undefined;
  if (boucherie_names_from_pivot.length === 0 && singleNom) {
    boucherie_names_from_pivot = [singleNom];
  }

  const out: ApiUserPayload = {
    id:
      src.id !== undefined && src.id !== null
        ? (src.id as string | number)
        : undefined,
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
  if (boucherie_ids.length > 0) {
    out.boucherie_ids = boucherie_ids;
  }
  if (boucherie_names_from_pivot.length > 0) {
    out.boucherie_names_from_pivot = boucherie_names_from_pivot;
  }
  if (
    src.must_change_password === true ||
    src.mustChangePassword === true
  ) {
    out.must_change_password = true;
  }

  const nestedFournisseur =
    src.fournisseur && typeof src.fournisseur === "object" && !Array.isArray(src.fournisseur)
      ? (src.fournisseur as Record<string, unknown>)
      : null;
  const entiteFournisseur =
    src.entite_fournisseur &&
    typeof src.entite_fournisseur === "object" &&
    !Array.isArray(src.entite_fournisseur)
      ? (src.entite_fournisseur as Record<string, unknown>)
      : null;
  const feRaw =
    src.fournisseur_id ??
    src.fournisseurId ??
    nestedFournisseur?.id ??
    entiteFournisseur?.id;
  if (feRaw !== undefined && feRaw !== null && String(feRaw).trim() !== "") {
    out.fournisseurEntityId = feRaw as string | number;
  }

  return out;
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
    const merged: ApiUserPayload = { ...fromLogin, ...fromMe };
    const loginPasswordMatchesOrgDefault =
      password === getDefaultNewUserPassword();
    return toAppUser(token, merged, { loginPasswordMatchesOrgDefault });
  } catch {
    const loginPasswordMatchesOrgDefault =
      password === getDefaultNewUserPassword();
    return toAppUser(token, fromLogin, { loginPasswordMatchesOrgDefault });
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

const RegisterFournisseurSchema = z
  .object({
    nom: z.string(),
    contact: z.string(),
    telephone: z.string(),
    email: z.string().optional(),
    adresse: z.string().optional(),
  })
  .strict()
  .optional();

const RegisterApiBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string(),
  /** UUID ou id numérique selon le backend Laravel. */
  boucherie_id: z.union([z.string().min(1), z.number().int().positive()]).optional(),
  /** Fournisseur desservant plusieurs boucheries (si supporté par l’API). */
  boucherie_ids: z
    .array(z.union([z.string().min(1), z.number().int().positive()]))
    .optional(),
  role: z.enum(["admin", "boucher", "fournisseur"]).optional(),
  /** Entité métier fournisseur (voir guide API / POST users). */
  fournisseur: RegisterFournisseurSchema,
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
  const loginPasswordMatchesOrgDefault =
    body.password === getDefaultNewUserPassword();
  return toAppUser(token, payload, { loginPasswordMatchesOrgDefault });
}
