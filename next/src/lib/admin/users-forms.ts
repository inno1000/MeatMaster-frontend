import { z } from "zod";

export const ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "boucher", label: "Boucher" },
  { value: "fournisseur", label: "Fournisseur" },
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

function refineFournisseurEmail(f: FournisseurFormFields, ctx: z.RefinementCtx, basePath: string[]) {
  const email = f.email.trim();
  if (email.length === 0) {
    return;
  }
  const check = z.string().email().safeParse(email);
  if (!check.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "E-mail invalide",
      path: [...basePath, "email"],
    });
  }
}

export const UserCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Nom requis"),
    email: z.string().trim().email("E-mail invalide"),
    role: z.string().trim().min(1, "Rôle requis"),
    boucherie_id: z.string().trim(),
    fournisseur: z.object(fournisseurFormShape),
  })
  .superRefine((data, ctx) => {
    if (data.role === "boucher" && data.boucherie_id.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La boucherie est obligatoire pour un compte boucher.",
        path: ["boucherie_id"],
      });
    }
    if (data.role === "fournisseur") {
      refineFournisseurEmail(data.fournisseur, ctx, ["fournisseur"]);
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
          message:
            "Pour renseigner l’entité fournisseur, indiquez au minimum le nom, le contact et le téléphone.",
          path: ["fournisseur", "nom"],
        });
      }
    }
  });

export const SupplierCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Nom requis"),
    email: z.string().trim().email("E-mail invalide"),
    fournisseur: z.object({
      nom: z.string().trim().min(1, "Nom de l’entité requis"),
      contact: z.string().trim().min(1, "Contact requis"),
      telephone: z.string().trim().min(1, "Téléphone requis"),
      email: z.string().trim(),
      adresse: z.string().trim(),
    }),
  })
  .superRefine((data, ctx) => {
    refineFournisseurEmail(data.fournisseur, ctx, ["fournisseur"]);
  });

export const ButcheryCreateSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis"),
  adresse: z.string().trim().min(1, "Adresse requise"),
  ville: z.string().trim().min(1, "Ville requise"),
  telephone: z.string().trim().min(1, "Téléphone requis"),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type SupplierCreateInput = z.infer<typeof SupplierCreateSchema>;
export type ButcheryCreateInput = z.infer<typeof ButcheryCreateSchema>;

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
