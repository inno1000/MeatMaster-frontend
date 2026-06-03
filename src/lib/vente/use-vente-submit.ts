"use client";

import { boucherieV1, uploadAudioBlobs } from "@/lib/api";
import { unwrapDataObject } from "@/lib/api/unwrap";

export type VenteSubmitInput = {
  date: string;
  typeVente: string;
  clientId?: string;
  productId: string;
  soldQty: number;
  unitPrice: number;
  notes?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  audioBlobs?: Blob[];
};

export async function submitVente(values: VenteSubmitInput): Promise<void> {
  const attachmentIds = await uploadAudioBlobs(values.audioBlobs ?? []);
  const createdRaw = await boucherieV1.ventes.create({
    type_vente: values.typeVente,
    client_id: values.clientId || undefined,
    notes: values.notes || undefined,
    date_vente: values.date,
    ...(attachmentIds.length > 0 ? { attachment_ids: attachmentIds } : {}),
    lignes: [
      {
        produit_id: values.productId,
        quantite: values.soldQty,
        prix_unitaire: values.unitPrice,
      },
    ],
  });
  const created = unwrapDataObject(createdRaw);
  const saleId = String(created.id ?? "");
  if (values.typeVente === "livraison" && saleId) {
    await boucherieV1.ventes.createLivraison(saleId, {
      adresse_livraison: values.deliveryAddress ?? "",
      statut: "en_attente",
      date_prevue: values.deliveryDate,
    });
  }
}
