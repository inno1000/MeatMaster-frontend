import { z } from "zod";

export const ButcherFormSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  website: z.string().optional(),
  openingHour: z.string().min(1),
  closingHour: z.string().min(1),
  openingDays: z.array(z.string()).min(1),
  owner: z.string().min(1),
  specialties: z.array(z.string()).min(1),
});

export type ButcherFormInput = z.infer<typeof ButcherFormSchema>;

export const ButcherRecordSchema = z.record(z.string(), z.unknown());

export const ButchersListSchema = z.array(z.record(z.string(), z.unknown()));
