import { z } from "zod";

export const ButcherFormSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
  address: z.string().trim().min(1, "Adresse requise"),
  city: z.string().trim().min(1, "Ville requise"),
  postal_code: z.string().trim().min(1, "Code postal requis"),
  phone: z.string().trim().min(1, "Téléphone requis"),
  email: z.string().trim().email("E-mail invalide"),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "URL invalide (commencez par http:// ou https://)",
    ),
  openingHour: z.string().trim().min(1, "Heure d'ouverture requise"),
  closingHour: z.string().trim().min(1, "Heure de fermeture requise"),
  openingDays: z.array(z.string()).min(1, "Sélectionnez au moins un jour"),
  owner: z.string().trim().min(1, "Propriétaire requis"),
  specialties: z.array(z.string()).min(1, "Sélectionnez au moins une spécialité"),
});

export type ButcherFormInput = z.infer<typeof ButcherFormSchema>;

export const ButcherRecordSchema = z.record(z.string(), z.unknown());

export const ButchersListSchema = z.array(z.record(z.string(), z.unknown()));
