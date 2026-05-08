import { z } from "zod";

/** `supplier` = fournisseur (inclut ventes / liste versements + abattages & rapports). L’API peut encore envoyer `caissier` ; il est mappé vers `supplier`. */
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
  email: z.string().email(),
  name: z.string(),
  role: RoleSchema,
  butcheries: z.array(z.string()).default([]),
});

export type User = z.infer<typeof UserSchema>;
