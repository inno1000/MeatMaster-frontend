# Spécification API — MeatMaster (frontend Next.js)

Ce document décrit les **endpoints REST** attendus par le frontend actuel (remplacement des mocks) et les **structures JSON** associées. Les chemins sont donnés **sous le préfixe** défini par `NEXT_PUBLIC_API_URL` (sans slash final), par exemple : base `https://api.example.com` → `POST https://api.example.com/auth/login`.

**Documentation officielle du backend (Scribe)** — schémas de requête/réponse et exemples à jour : [Boucherie API](https://boucherie-api.onrender.com/docs/). Pour la liste des boucheries : [`GET api/v1/boucheries`](https://boucherie-api.onrender.com/docs/#boucheries-GETapi-v1-boucheries).

Dans le code Next, les appels métier passent par `src/lib/api/services/boucherie-v1.ts` avec le préfixe `/api/v1` (voir `v1-url.ts`).

**Conventions générales**

| Élément | Recommandation |
|--------|----------------|
| Format | `application/json` pour le corps, sauf upload fichiers (`multipart/form-data`) |
| Auth | Header `Authorization: Bearer <accessToken>` sur toutes les routes protégées |
| Dates | ISO 8601 (`2024-01-15` ou `2024-01-15T10:30:00Z`) |
| Identifiants | `uuid` ou `string` opaque côté serveur ; le front migrera des **noms** vers des **id** |
| Erreurs 4xx/5xx | Corps JSON `{ "message": "..." }` (ou tableau de messages) ; `401`/`403` déclenchent déconnexion côté client |
| Pagination (listes) | Query `?page=1&pageSize=20` ; réponse `{ "items": [...], "total": number, "page": number, "pageSize": number }` |

**Rôles métier** (`role` dans le profil utilisateur)

- `butcher` — opérateur boucherie (stock, ventes, enregistrement versement, fiches boucheries).
- `supplier` — fournisseur (abattages, validation versements, rapports côté fournisseur si exposés).
- `admin` — coordination plateforme (affectations fournisseur ↔ boucheries, utilisateurs, configuration).

Les règles d’accès UI actuelles sont dans `src/lib/authz.ts` ; le backend doit **refuser** toute ressource hors périmètre même si l’URL est devinée.

---

## 1. Authentification

### 1.1 `POST /auth/login`

Connexion. Le frontend envoie déjà ce corps (schéma `LoginSchema`).

**Requête**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Réponse `200`** — alignée sur `LoginResponseSchema`

```json
{
  "accessToken": "jwt-or-opaque-token"
}
```

### 1.2 `GET /auth/me` (ou `GET /auth/user`)

Profil de l’utilisateur connecté (équivalent actuel de fusion token + user). Le client attend un objet **compatible** avec le schéma utilisateur ci‑dessous ; le champ token côté app peut être **le même** que `accessToken` renvoyé au login.

**Réponse `200`**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nom affiché",
  "role": "butcher",
  "butcheries": [
    {
      "id": "uuid-boucherie",
      "name": "Boucherie Halal"
    }
  ]
}
```

**Variante minimale** (comme le mock actuel `UserSchema`) — le front accepte encore aujourd’hui des **chaînes** pour `butcheries` ; la cible est d’évoluer vers des objets `{ id, name }` puis d’adapter le schéma Zod.

```json
{
  "email": "user@example.com",
  "name": "Nom affiché",
  "role": "supplier",
  "butcheries": ["Boucherie Halal"]
}
```

**Note** : `lib/api/auth-service.ts` utilise aujourd’hui `POST .../auth/login` + `GET .../auth/user` et attend `{ accessToken }` puis parse avec `UserSchema` en réinjectant `token: accessToken`. Harmoniser les chemins (`/auth/me` vs `/auth/user`) entre ce fichier et l’implémentation réelle.

### 1.3 `POST /auth/register` (optionnel / phase 2)

**Requête** (`RegisterSchema`)

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Réponse `201`** : compte créé en attente d’activation, ou `200` avec message métier.

### 1.4 `POST /auth/logout` (optionnel)

Invalidation côté serveur du refresh token / session si applicable.

---

## 2. Utilisateurs & annuaire plateforme (admin)

Remplace le store local `user-directory-store` + la section admin « fournisseurs ↔ boucheries ».

### 2.1 `GET /admin/users` ou `GET /users`

Liste des comptes (admin). Filtres query optionnels : `?role=supplier&butcheryId=`.

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "email": "fournisseur@example.com",
      "name": "Fournisseur Nord",
      "role": "supplier",
      "butcheryIds": ["uuid-1", "uuid-2"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 0
}
```

### 2.2 `PUT /admin/users/:userId/butcheries` (ou `PATCH /users/:id`)

Affectation **exclusive** des boucheries desservies par un **fournisseur** (liste complète remplacée).

**Requête**

```json
{
  "butcheryIds": ["uuid-halal", "uuid-centrale"]
}
```

**Réponse `200`** : utilisateur mis à jour (même forme qu’un item de liste).

**Règles** : réservé `admin` ; valider que chaque `butcheryId` existe ; un fournisseur doit avoir **au moins une** boucherie si la règle métier l’impose.

### 2.3 `GET /reference/butcheries` (public ou authentifié)

Catalogue officiel des boucheries (pour selects formulaires abattage, versements, etc.) — permet d’**unifier** les listes actuellement dupliquées en dur dans le front.

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Boucherie Halal",
      "city": "string",
      "phone": "string"
    }
  ]
}
```

---

## 3. Boucheries (CRUD)

Aligné sur `ButcherFormSchema` + réponses mock `butchers-store`. **Backend Laravel** : groupe **Boucheries** dans la doc Scribe — liste [`GET /api/v1/boucheries`](https://boucherie-api.onrender.com/docs/#boucheries-GETapi-v1-boucheries), création `POST /api/v1/boucheries`, lecture `GET /api/v1/boucheries/{id}`, mise à jour **`PUT`** `/api/v1/boucheries/{id}`, suppression `DELETE /api/v1/boucheries/{id}`.

Ci‑dessous, chemins **relatifs au préfixe `/api/v1`** (comme dans `boucherieV1.boucheries`).

### 3.1 `GET /boucheries`

Liste pour l’écran « liste des boucheries » et alimentation des selects (`boucherieV1.boucheries.list()`).

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "city": "string",
      "phone": "string",
      "email": "string",
      "address": "string",
      "postalCode": "string",
      "website": "string | null",
      "openingHours": "string",
      "openingDays": ["mon", "tue"],
      "owner": "string",
      "specialties": "string"
    }
  ],
  "total": 0
}
```

*(Les noms de champs peuvent être en `snake_case` côté API si le backend est Python/Django — fournir une convention unique et documenter le mapping.)*

### 3.2 `POST /butcheries`

**Requête** (champs formulaire actuel)

```json
{
  "name": "string",
  "address": "string",
  "city": "string",
  "postal_code": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "openingHour": "08:00",
  "closingHour": "18:00",
  "openingDays": ["mon", "tue"],
  "owner": "string",
  "specialties": ["boeuf", "mouton"]
}
```

**Réponse `201`** : fiche boucherie créée (objet complet avec `id`).

### 3.3 `GET /butcheries/:id` / `PUT /butcheries/:id` / `DELETE /butcheries/:id`

CRUD standard (`get`, `update`, `remove` côté client) ; le backend expose une mise à jour en **`PUT`** (pas `PATCH` sur cette ressource). Droits : `butcher` + `admin` selon politique métier.

---

## 4. Abattages (slaughters)

Remplace `MOCK_SLAUGHTER_ANIMALS` et le formulaire multi-animaux.

### 4.1 Modèle métier cible

Un **lot / enregistrement d’abattage** peut contenir **plusieurs animaux** (comme le formulaire `animals[]`). Chaque animal porte une **distribution** vers une ou plusieurs boucheries.

**Animal (extrait)**

| Champ | Type | Description |
|-------|------|-------------|
| `weight` | number | Poids carcasse / live selon règle métier |
| `purchasePrice` | number | Prix d’achat (ex. FCFA) |
| `meatWeight` | number | Poids viande |
| `tripesWeight` | number | Poids tripes |
| `distributions` | array | Lignes par boucherie |

**Distribution**

| Champ | Type | Description |
|-------|------|-------------|
| `butcheryId` | string (uuid) | **Recommandé** (remplace `name` seul) |
| `weight` | number | Quantité allouée |
| `unitPrice` | number | Prix unitaire négocié |

**Compatibilité mock** : aujourd’hui le front utilise `butchers[].name`, `address`, `city`, `postal_code`, `phone`, `price`, `weight`. Le backend peut renvoyer **à la fois** `butcheryId` + objet `butchery` embarqué pour affichage.

### 4.2 `GET /slaughters`

Liste paginée ; filtres : `?from=&to=&butcheryId=&supplierId=` (le fournisseur ne voit que **ses** enregistrements).

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "supplierId": "uuid",
      "date": "2024-01-15",
      "animals": [
        {
          "id": "uuid",
          "weight": 200,
          "purchasePrice": 500000,
          "meatWeight": 150,
          "tripesWeight": 30,
          "distributions": [
            {
              "butcheryId": "uuid",
              "butcheryName": "Boucherie Halal",
              "weight": 80,
              "unitPrice": 2000
            }
          ]
        }
      ],
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 0
}
```

### 4.3 `GET /slaughters/:id`

Détail pour la page « détail abattage ».

### 4.4 `POST /slaughters`

**Requête** (alignée formulaire `animals`)

```json
{
  "animals": [
    {
      "weight": 200,
      "purchasePrice": 500000,
      "meatWeight": 150,
      "tripesWeight": 30,
      "distributions": [
        {
          "butcheryId": "uuid",
          "weight": 80,
          "unitPrice": 2000
        }
      ]
    }
  ],
  "audioAttachmentIds": ["uuid-fichier"]
}
```

**Réponse `201`** : ressource créée avec `id` et mêmes structures enrichies (dates serveur, ids animaux).

### 4.5 `PATCH /slaughters/:id` / `DELETE /slaughters/:id`

Mise à jour / suppression selon droits (`supplier` propriétaire, `admin`).

**Rôles** : création/liste côté UI surtout `supplier` ; `admin` lecture globale.

---

## 5. Versements → **paiements** (backend Laravel)

**Terminologie** : dans l’interface MeatMaster, « **versement** » désigne ce que l’API expose comme **paiements** (`paiement`), rattachés à une **vente**.

Les routes documentées sont :

- `GET /api/v1/ventes/{vente}/paiements` — lister les paiements d’une vente
- `POST /api/v1/ventes/{vente}/paiements` — créer un paiement pour cette vente

**Corps typique (POST)** — voir la doc Scribe OpenAPI pour les champs exacts (`montant`, `mode_paiement` via référentiel `mode_paiement`, `date_paiement`, etc.).

```json
{
  "montant": 150000,
  "mode_paiement": "valeur_enum_referentiel",
  "date_paiement": "2026-05-06T12:00:00"
}
```

**Conséquence UX** : un « versement » isolé sans vente n’existe pas tel quel côté backend ; il faut soit **lier à une vente** (`vente_id`), soit faire évoluer l’API si le métier impose des paiements hors vente.

Les écrans actuels `versement/liste` et `versement/enregistrer` utilisent encore des **mocks** ; à brancher via `boucherieV1.ventes.listPaiements(venteId)` et `createPaiement(venteId, body)` une fois la vente concernée identifiée.

---

## 6. Stocks

### 6.1 `GET /stock/inventory`

État des stocks par article (lignes type `STOCK_DATA` dans `stock-management-view`).

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "butcheryId": "uuid",
      "meatTypeId": "uuid",
      "meatTypeName": "Bœuf",
      "currentStock": 45,
      "unit": "kg",
      "minThreshold": 20,
      "maxThreshold": 100,
      "unitPrice": 2500,
      "status": "normal",
      "lastUpdatedAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

`status` peut être calculé serveur (`normal` | `low` | `critical`) ou renvoyé explicitement.

### 6.2 `GET /stock/movements`

Journal / historique (filtres `from`, `to`, `type`, `meatTypeId`, pagination).

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "occurredAt": "2024-01-15T10:30:00Z",
      "type": "reception",
      "meatTypeName": "Bœuf",
      "quantity": 25,
      "unit": "kg",
      "userId": "uuid",
      "userDisplayName": "Admin"
    }
  ],
  "total": 0
}
```

`type` : `reception` | `sale` | `adjustment` | `transfer` (selon besoin).

### 6.3 `POST /stock/receptions`

Formulaire « réception de viande ».

**Requête**

```json
{
  "butcheryId": "uuid",
  "supplierId": "uuid",
  "meatTypeId": "uuid",
  "quantity": 25,
  "batch": "LOT-2024-01",
  "notes": "string",
  "audioAttachmentIds": ["uuid"]
}
```

*(Le front envoie aujourd’hui `supplier` et `meatType` en texte libre — à remplacer par ids référentiels.)*

**Réponse `201`** : mouvement créé + stock mis à jour.

### 6.4 `POST /stock/adjustments` (déclaration d’écart)

**Requête**

```json
{
  "butcheryId": "uuid",
  "meatTypeId": "uuid",
  "declaredQuantity": 10,
  "reason": "string"
}
```

**Réponse `201`**.

### 6.5 `GET /stock/movements/export` (optionnel)

Export CSV/Excel pour le bouton « export » du journal (query mêmes filtres que 6.2).

---

## 7. Ventes

### 7.1 `GET /sales`

Liste + filtres (`from`, `to`, `meatTypeId`, `butcheryId`).

**Réponse `200`**

```json
{
  "items": [
    {
      "id": "uuid",
      "date": "2024-01-15",
      "butcheryId": "uuid",
      "meatTypeName": "Bœuf",
      "quantity": 25,
      "unit": "kg",
      "unitPrice": 2500,
      "totalAmount": 62500,
      "customerName": "Client A",
      "audioAttachmentIds": []
    }
  ],
  "total": 0
}
```

### 7.2 `POST /sales`

**Requête**

```json
{
  "butcheryId": "uuid",
  "date": "2024-01-15",
  "meatTypeId": "uuid",
  "soldQuantity": 25,
  "unitPrice": 2500,
  "customerName": "Client A",
  "audioAttachmentIds": ["uuid"]
}
```

**Réponse `201`**. Le serveur doit **refuser** si `soldQuantity` > stock disponible (même règle que la validation Zod actuelle sur données mock).

---

## 8. Tableau de bord & rapports

### 8.1 `GET /dashboard/summary`

Remplace les constantes `MEAT_TYPES`, `RECENT`, `todaySales`, `todayRevenue` dans `dashboard-content`.

**Réponse `200`** (exemple)

```json
{
  "totalStockKg": 147,
  "lowStockAlertsCount": 2,
  "todaySalesCount": 45,
  "todayRevenue": 275000,
  "currency": "XAF",
  "stockByMeatType": [
    { "meatTypeName": "Bœuf", "stockKg": 45, "status": "normal" }
  ],
  "recentActivity": [
    {
      "type": "reception",
      "label": "Bœuf",
      "quantityLabel": "25 kg",
      "time": "10:30",
      "status": "success"
    }
  ]
}
```

### 8.2 `GET /reports/sales`

Agrégats pour l’écran rapport ventes (totaux, moyenne, ventilation par type). Query : `from`, `to`, `meatTypeId`, `butcheryId`.

**Réponse `200`**

```json
{
  "rows": [],
  "totalAmount": 0,
  "totalQuantity": 0,
  "averageTicket": 0,
  "byMeatType": [
    { "meatTypeName": "Bœuf", "quantity": 25, "amount": 62500 }
  ]
}
```

### 8.3 `GET /reports/financial` / `GET /reports/stocks` (placeholders UI)

À définir avec le métier (trésorerie, marges, valorisation stock). Retourner au minimum `{ "message": "not_implemented" }` ou structures vides documentées.

---

## 9. Fichiers & pièces jointes audio

Plusieurs formulaires incluent un composant **enregistrement audio** (blobs locaux aujourd’hui). Flux recommandé :

1. `POST /attachments` en `multipart/form-data` avec champ `file` (audio/webm, etc.) → réponse `{ "id": "uuid", "url": "..." }`.
2. Référencer `audioAttachmentIds` dans `POST /slaughters`, `POST /payments`, `POST /sales`, `POST /stock/receptions`.

---

## 10. Référentiels (types de viande, méthodes paiement, villes…)

Pour remplacer les listes en dur (`MEAT`, `CITIES`, options versement) :

| Endpoint | Usage |
|----------|--------|
| `GET /reference/meat-types` | `{ "items": [{ "id", "name", "defaultUnitPrice", "unit" }] }` |
| `GET /reference/payment-methods` | `{ "items": [{ "id", "code", "label" }] }` |
| `GET /reference/cities` (optionnel) | Autocomplete fiche boucherie |

---

## 11. Matrice rôles → endpoints (résumé)

| Zone | butcher | supplier | admin |
|------|---------|----------|-------|
| Login / me | ✓ | ✓ | ✓ |
| Boucheries CRUD | ✓ (scope) | — | ✓ |
| Slaughters | lecture si lié | ✓ CRUD ses lots | ✓ |
| Payments liste / création boucherie | ✓ | ✓ validation | ✓ |
| Stock / ventes | ✓ (scope) | — | ✓ |
| Affectations user ↔ boucheries | — | — | ✓ |
| Rapports | selon pages | selon pages | ✓ |

---


Ce document est la **cible fonctionnelle** ; les chemins exacts (`/slaughters` vs `/abattages`, etc.) peuvent suivre la convention du backend tant qu’ils sont **stables** et documentés pour le client `NEXT_PUBLIC_API_URL`.
