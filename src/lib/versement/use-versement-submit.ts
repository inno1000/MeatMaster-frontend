"use client";

import { boucherieV1, uploadAudioBlobs } from "@/lib/api";
import { coerceApiScalarId } from "@/lib/api/coerce-id";

export type VersementSubmitInput = {
  fournisseurUserId: string;
  amount: number;
  method: string;
  dateVersement: string;
  reference: string;
  notes?: string;
  audioBlobs?: Blob[];
};

export async function submitVersement(values: VersementSubmitInput): Promise<void> {
  const attachmentIds = await uploadAudioBlobs(values.audioBlobs ?? []);
  await boucherieV1.versements.create({
    fournisseur_user_id: coerceApiScalarId(values.fournisseurUserId),
    montant: values.amount,
    mode_paiement: values.method,
    date_versement: values.dateVersement,
    reference: values.reference,
    notes: values.notes || undefined,
    ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
  });
}
