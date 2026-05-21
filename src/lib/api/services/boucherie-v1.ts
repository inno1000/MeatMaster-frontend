/**
 * Appels HTTP vers l’API Laravel documentée (`/api/v1/...`).
 * Les réponses sont laissées souples (`unknown`) : enveloppes `data` / pagination selon le backend.
 * CRUD : **PUT** pour la plupart des ressources ; **PATCH** pour référentiels, statuts ventes /
 * livraisons, versements, distributions, et **`users`** (guide + alignement Sanctum).
 */
import { apiClient } from "@/lib/api/client";
import { v1Url, v1UrlWithQuery } from "@/lib/api/v1-url";

const enc = encodeURIComponent;

/** Filtres `GET /animaux` (ex. `?statut=en_attente`). */
export type AnimauxListParams = {
  statut?: string;
};

/** Filtres `GET /ventes` (pagination Laravel : `page`, etc.). */
export type VentesListParams = {
  statut?: string;
  type_vente?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
};

export type VersementsListParams = {
  statut?: string;
  page?: number;
};

export type DistributionsListParams = {
  statut?: string;
  page?: number;
};

export type ReceptionsListParams = {
  page?: number;
};

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
    remove: (id: string) =>
      apiClient.delete<unknown>(v1Url(`/boucheries/${enc(id)}`)),
  },

  users: {
    list: () => apiClient.get<unknown>(v1Url("/users")),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/users"), body),
    get: (id: string) => apiClient.get<unknown>(v1Url(`/users/${enc(id)}`)),
    update: (id: string, body: Record<string, unknown>) =>
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
    list: (params?: AnimauxListParams) =>
      apiClient.get<unknown>(v1UrlWithQuery("/animaux", params)),
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
    list: (params?: VentesListParams) =>
      apiClient.get<unknown>(
        v1UrlWithQuery("/ventes", params),
      ),
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

  versements: {
    list: (params?: VersementsListParams) =>
      apiClient.get<unknown>(v1UrlWithQuery("/versements", params)),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/versements"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/versements/${enc(id)}`)),
    valider: (id: string, body?: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/versements/${enc(id)}/valider`), body),
    rejeter: (id: string, body: Record<string, unknown>) =>
      apiClient.patch<unknown>(v1Url(`/versements/${enc(id)}/rejeter`), body),
  },

  distributions: {
    list: (params?: DistributionsListParams) =>
      apiClient.get<unknown>(v1UrlWithQuery("/distributions", params)),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/distributions"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/distributions/${enc(id)}`)),
    annuler: (id: string) =>
      apiClient.patch<unknown>(v1Url(`/distributions/${enc(id)}/annuler`)),
  },

  receptions: {
    list: (params?: ReceptionsListParams) =>
      apiClient.get<unknown>(v1UrlWithQuery("/receptions", params)),
    create: (body: Record<string, unknown>) =>
      apiClient.post<unknown>(v1Url("/receptions"), body),
    get: (id: string) =>
      apiClient.get<unknown>(v1Url(`/receptions/${enc(id)}`)),
  },
} as const;
