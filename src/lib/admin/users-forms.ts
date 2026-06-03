import { z } from "zod";

export const ROLE_VALUES = ["admin", "boucher", "fournisseur"] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];

/** @deprecated Utiliser ROLE_VALUES + libellés i18n (`admin.roleAdmin`, etc.). */
export const ROLE_OPTIONS = [
  { value: "admin" as const, label: "Administrateur" },
  { value: "boucher" as const, label: "Boucher" },
  { value: "fournisseur" as const, label: "Fournisseur" },
] as const;

/** Champs formulaire alignés sur `POST /api/v1/users` → objet `fournisseur`. */
export type FournisseurFormFields = {
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
};

export function emptyFournisseurForm(): FournisseurFormFields {
  return { nom: "", contact: "", telephone: "", email: "", adresse: "" };
}

const fournisseurFormShape = {
  nom: z.string().trim(),
  contact: z.string().trim(),
  telephone: z.string().trim(),
  email: z.string().trim(),
  adresse: z.string().trim(),
};

/** Corps JSON API pour la clé `fournisseur`, ou `null` si aucune entité à envoyer. */
export function toApiFournisseurBody(
  f: FournisseurFormFields,
): { nom: string; contact: string; telephone: string; email?: string; adresse?: string } | null {
  const nom = f.nom.trim();
  const contact = f.contact.trim();
  const telephone = f.telephone.trim();
  const email = f.email.trim();
  const adresse = f.adresse.trim();
  const anyFilled =
    nom.length > 0 ||
    contact.length > 0 ||
    telephone.length > 0 ||
    email.length > 0 ||
    adresse.length > 0;
  if (!anyFilled) {
    return null;
  }
  if (!nom || !contact || !telephone) {
    return null;
  }
  const out: {
    nom: string;
    contact: string;
    telephone: string;
    email?: string;
    adresse?: string;
  } = { nom, contact, telephone };
  if (email) {
    out.email = email;
  }
  if (adresse) {
    out.adresse = adresse;
  }
  return out;
}

function refineFournisseurEmail(
  f: FournisseurFormFields,
  ctx: z.RefinementCtx,
  basePath: string[],
  tv: (key: string) => string,
) {
  const email = f.email.trim();
  if (email.length === 0) {
    return;
  }
  const check = z.string().email().safeParse(email);
  if (!check.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: tv("emailInvalid"),
      path: [...basePath, "email"],
    });
  }
}

export function buildUserCreateSchema(tv: (key: string) => string) {
  return z
    .object({
      name: z.string().trim().min(1, tv("nameRequired")),
      email: z.string().trim().email(tv("emailInvalid")),
      role: z.string().trim().min(1, tv("roleRequired")),
      boucherie_id: z.string().trim(),
      fournisseur: z.object(fournisseurFormShape),
    })
    .superRefine((data, ctx) => {
      if (data.role === "boucher" && data.boucherie_id.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tv("butcheryRequiredForBoucher"),
          path: ["boucherie_id"],
        });
      }
      if (data.role === "fournisseur") {
        refineFournisseurEmail(data.fournisseur, ctx, ["fournisseur"], tv);
        const payload = toApiFournisseurBody(data.fournisseur);
        const f = data.fournisseur;
        const partiallyFilled =
          f.nom.trim().length > 0 ||
          f.contact.trim().length > 0 ||
          f.telephone.trim().length > 0 ||
          f.email.trim().length > 0 ||
          f.adresse.trim().length > 0;
        if (partiallyFilled && !payload) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tv("supplierEntityPartial"),
            path: ["fournisseur", "nom"],
          });
        }
      }
    });
}

export function buildSupplierCreateSchema(tv: (key: string) => string) {
  return z
    .object({
      name: z.string().trim().min(1, tv("nameRequired")),
      email: z.string().trim().email(tv("emailInvalid")),
      fournisseur: z.object({
        nom: z.string().trim().min(1, tv("entityNameRequired")),
        contact: z.string().trim().min(1, tv("contactRequired")),
        telephone: z.string().trim().min(1, tv("phoneRequired")),
        email: z.string().trim(),
        adresse: z.string().trim(),
      }),
    })
    .superRefine((data, ctx) => {
      refineFournisseurEmail(data.fournisseur, ctx, ["fournisseur"], tv);
    });
}

export function buildButcheryCreateSchema(tv: (key: string) => string) {
  return z.object({
    nom: z.string().trim().min(1, tv("nameRequired")),
    adresse: z.string().trim().min(1, tv("addressRequired")),
    ville: z.string().trim().min(1, tv("cityRequired")),
    telephone: z.string().trim().min(1, tv("phoneRequired")),
  });
}

export type UserCreateInput = z.infer<ReturnType<typeof buildUserCreateSchema>>;
export type SupplierCreateInput = z.infer<ReturnType<typeof buildSupplierCreateSchema>>;
export type ButcheryCreateInput = z.infer<ReturnType<typeof buildButcheryCreateSchema>>;

export function toggleBoucherieId(
  list: string[],
  id: string,
  checked: boolean,
): string[] {
  if (checked) {
    return list.includes(id) ? list : [...list, id];
  }
  return list.filter((x) => x !== id);
}
