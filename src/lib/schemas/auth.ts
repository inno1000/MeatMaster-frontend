import { z } from "zod";

/** `supplier` = fournisseur (abattages, achats animaux, versements liste, rapports hors ventes). L’API envoie `fournisseur` ; `caissier` historique est encore mappé vers `supplier`. */
export const RoleSchema = z.enum(["butcher", "supplier", "admin"]);
export type UserRole = z.infer<typeof RoleSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .max(128, "Mot de passe trop long"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

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

export const RegisterSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  /** Aligné API Laravel (`password` min 8). */
  password: z.string().min(8, "Au moins 8 caractères"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

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
