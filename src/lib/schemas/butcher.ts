import { z } from "zod";

/** Champs alignés sur `POST /api/v1/boucheries`. */
export const ButcherFormSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis"),
  adresse: z.string().trim().min(1, "Adresse requise"),
  ville: z.string().trim().min(1, "Ville requise"),
  telephone: z.string().trim().min(1, "Téléphone requis"),
});

export type ButcherFormInput = z.infer<typeof ButcherFormSchema>;

export const ButcherRecordSchema = z.record(z.string(), z.unknown());

export const ButchersListSchema = z.array(z.record(z.string(), z.unknown()));
