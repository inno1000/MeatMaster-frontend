/**
 * Appels HTTP vers l’API Laravel documentée (`/api/v1/...`).
 * Les réponses sont laissées souples (`unknown`) : enveloppes `data` / pagination selon le backend.
 */
import { apiClient } from "@/lib/api/client";
import { v1Url } from "@/lib/api/v1-url";

const enc = encodeURIComponent;

export const boucherieV1 = {
  referentiels: {
    list: (type: string) =>
      apiClient.get<unknown>(v1Url(`/referentiels/${enc(type)}`)),
    create: (type: string, body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url(`/referentiels/${enc(type)}`), body),
    update: (type: string, id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(
        v1Url(`/referentiels/${enc(type)}/${enc(id)}`),
        body,
      ),
    remove: (type: string, id: string) =>
      apiClient.delete<unknown>(v1Url(`/referentiels/${enc(type)}/${enc(id)}`)),
  },

  boucheries: {
    list: () => apiClient.get<unknown>(v1Url("/boucheries")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/boucheries"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/boucheries/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
      apiClient.put<unknown>(v1Url(`/boucheries/${enc(id)}`), body),
    patch: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/boucheries/${enc(id)}`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/boucheries/${enc(id)}`)),
  },

  users: {
    list: () => apiClient.get<unknown>(v1Url("/users")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/users"), body),
    get: (id: string) => apiClient.get<unknown>(v1Url(`/users/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
      apiClient.put<unknown>(v1Url(`/users/${enc(id)}`), body),
    patch: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/users/${enc(id)}`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/users/${enc(id)}`)),
  },

  fournisseurs: {
    list: () => apiClient.get<unknown>(v1Url("/fournisseurs")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/fournisseurs"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/fournisseurs/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
      apiClient.put<unknown>(v1Url(`/fournisseurs/${enc(id)}`), body),
    patch: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/fournisseurs/${enc(id)}`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/fournisseurs/${enc(id)}`)),
  },

  clients: {
    list: () => apiClient.get<unknown>(v1Url("/clients")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/clients"), body),
    get: (id: string) => apiClient.get<unknown>(v1Url(`/clients/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
      apiClient.put<unknown>(v1Url(`/clients/${enc(id)}`), body),
    patch: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/clients/${enc(id)}`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/clients/${enc(id)}`)),
  },

  produits: {
    list: () => apiClient.get<unknown>(v1Url("/produits")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/produits"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/produits/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
      apiClient.put<unknown>(v1Url(`/produits/${enc(id)}`), body),
    patch: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/produits/${enc(id)}`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/produits/${enc(id)}`)),
  },

  achatsFournisseurs: {
    list: () => apiClient.get<unknown>(v1Url("/achats-fournisseurs")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/achats-fournisseurs"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/achats-fournisseurs/${enc(id)}`)),
  },

  animaux: {
    list: () => apiClient.get<unknown>(v1Url("/animaux")),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/animaux/${enc(id)}`)),
  },

  abattages: {
    list: () => apiClient.get<unknown>(v1Url("/abattages")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/abattages"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/abattages/${enc(id)}`)),
  },

  stocks: {
    list: () => apiClient.get<unknown>(v1Url("/stocks")),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/stocks/${enc(id)}`)),
    mouvements: (stockId: string) =>
      apiClient.get<unknown>(v1Url(`/stocks/${enc(stockId)}/mouvements`)),
    ajuster: (stockId: string, body: Record<string, unknown>) =>
      apiClient.post<unknown>(
        v1Url(`/stocks/${enc(stockId)}/ajuster`),
        body,
      ),
  },

  ventes: {
    list: () => apiClient.get<unknown>(v1Url("/ventes")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/ventes"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/ventes/${enc(id)}`)),
    patchStatut: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/ventes/${enc(id)}/statut`), body),
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/ventes/${enc(id)}`)),
    /** Paiements = « versements » côté UI (nested sous une vente). */
    listPaiements: (venteId: string) =>
      apiClient.get<unknown>(v1Url(`/ventes/${enc(venteId)}/paiements`)),
    createPaiement: (venteId: string, body: Record<string, unknown>) =>
      apiClient.post<unknown>(
        v1Url(`/ventes/${enc(venteId)}/paiements`),
        body,
      ),
    createLivraison: (venteId: string, body: Record<string, unknown>) =>
      apiClient.post<unknown>(
        v1Url(`/ventes/${enc(venteId)}/livraison`),
        body,
      ),
    patchLivraison: (venteId: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(
        v1Url(`/ventes/${enc(venteId)}/livraison`),
        body,
      ),
  },
} as const;
