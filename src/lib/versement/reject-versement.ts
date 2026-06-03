"use client";

import { boucherieV1, uploadAudioBlobs } from "@/lib/api";

export type RejectVersementInput = {
  motif: string;
  audioBlobs?: Blob[];
  /** Utilisé si motif vide mais enregistrement vocal présent */
  defaultMotifIfVoiceOnly?: string;
  /** Utilisé si motif et vocal absents (ne devrait pas arriver côté UI) */
  fallbackMotif?: string;
};

export async function rejectVersement(
  id: string,
  input: RejectVersementInput,
): Promise<void> {
  const trimmed = input.motif.trim();
  const attachmentIds = await uploadAudioBlobs(input.audioBlobs ?? []);

  let motif_rejet = trimmed;
  if (!motif_rejet && attachmentIds.length > 0) {
    motif_rejet =
      input.defaultMotifIfVoiceOnly?.trim() || "Motif vocal (pièce jointe)";
  }
  if (!motif_rejet) {
    motif_rejet = input.fallbackMotif?.trim() || "Versement rejeté";
  }

  const body: Record<string, unknown> = { motif_rejet };
  if (attachmentIds.length > 0) {
    body.attachment_ids = attachmentIds;
  }

  await boucherieV1.versements.rejeter(id, body);
}
