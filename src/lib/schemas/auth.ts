import { z } from "zod";

/** `supplier` = fournisseur (abattages, achats animaux, versements liste, rapports hors ventes). L’API envoie `fournisseur` ; `caissier` historique est encore mappé vers `supplier`. */
export const RoleSchema = z.enum(["butcher", "supplier", "admin"]);
export type UserRole = z.infer<typeof RoleSchema>;

export function buildLoginSchema(v: (key: string) => string) {
  return z.object({
    email: z.string().email(v("emailInvalid")),
    password: z
      .string()
      .min(1, v("passwordRequired"))
      .max(128, v("passwordTooLong")),
  });
}

export type LoginInput = z.infer<ReturnType<typeof buildLoginSchema>>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
});

/** Réponse Laravel Sanctum : `{ token, data: { ... } }`. */
export const LaravelLoginResponseSchema = z
  .object({
    token: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export function buildRegisterSchema(v: (key: string) => string) {
  return z.object({
    firstName: z.string().min(1, v("firstNameRequired")),
    lastName: z.string().min(1, v("lastNameRequired")),
    email: z.string().email(v("emailInvalid")),
    password: z.string().min(8, v("passwordMin8")),
  });
}

export type RegisterInput = z.infer<ReturnType<typeof buildRegisterSchema>>;

export const UserSchema = z.object({
  token: z.string(),
  /** Identifiant API (`/users`, versements `fournisseur_user_id`, etc.) — chaîne pour UUID ou entiers sérialisés. */
  id: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  role: RoleSchema,
  /** Noms affichables des boucheries (ex. relation chargée par `/auth/me`). */
  butcheries: z.array(z.string()).default([]),
  /** Identifiants API des boucheries desservies (ex. fournisseur multi‑sites). */
  butcheryIds: z.array(z.string()).default([]),
  /** Identifiant API de l’entité `fournisseurs` liée au compte (achats animaux, etc.). */
  fournisseurEntityId: z.string().optional(),
  /** User API du fournisseur assigné à la boucherie du boucher (versements). */
  supplierUserId: z.string().optional(),
  supplierName: z.string().optional(),
  /** Mot de passe encore celui par défaut (ou flag API) : changement obligatoire avant le reste de l’app. */
  mustChangePassword: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;
