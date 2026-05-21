# Spécification API — MeatMaster (frontend Next.js)

Ce document décrit les **endpoints REST** attendus par le frontend actuel (remplacement des mocks) et les **structures JSON** associées.

**Variables d’environnement** : `NEXT_PUBLIC_API_URL` = **origine seule** du serveur (sans chemin API), par exemple `https://boucherie-api.onrender.com`. **`NEXT_PUBLIC_API_PREFIX`** (optionnel, défaut **`/api/v1`**) = segment après l’origine pour toutes les routes REST (`config.ts`, `v1-url.ts`).

**Documentation officielle (Scribe)** : [Boucherie API](https://boucherie-api.onrender.com/docs/). Liens directs : boucheries [`GET api/v1/boucheries`](https://boucherie-api.onrender.com/docs/#boucheries-GETapi-v1-boucheries), ventes [`GET api/v1/ventes`](https://boucherie-api.onrender.com/docs/#ventes-GETapi-v1-ventes).

**Guide d’utilisation (flux par rôle)** : [https://boucherie-api.onrender.com/guide](https://boucherie-api.onrender.com/guide).

**Collection Postman** : export équivalent (variable `baseUrl` → `https://boucherie-api.onrender.com`, chemins `api/v1/...`). Les corps / réponses ci‑dessous sont **alignés** sur cette collection, le guide et sur `services/auth.ts` + `boucherie-v1.ts`.

**Création de comptes (`POST /api/v1/users`)** : pour **`boucher`** uniquement, envoyer **`boucherie_id`** (obligatoire). Les **`admin`** ne sont pas rattachés à une boucherie. Pour **`fournisseur`**, envoyer un objet optionnel **`fournisseur`** `{ nom, contact, telephone, email?, adresse? }` ; les rattachements multi‑boucheries se font ensuite (ex. écran admin ou `PATCH /users/{id}`).

**Conventions générales**

| Élément | Recommandation |
|--------|----------------|
| Format | `application/json` pour le corps, sauf upload fichiers (`multipart/form-data`) |
| Auth | Header `Authorization: Bearer <token>` (Sanctum, ex. `1|…`) sur les routes protégées |
| Dates | ISO 8601 (`2024-01-15` ou `2024-01-15T10:30:00Z`) |
| Identifiants | `uuid` ou `string` opaque côté serveur ; le front migrera des **noms** vers des **id** |
| Erreurs 4xx/5xx | Corps JSON `{ "message": "..." }` (ou tableau de messages) ; `401`/`403` déclenchent déconnexion côté client |
| Pagination (listes) | Query `?page=1&pageSize=20` ; réponse `{ "items": [...], "total": number, "page": number, "pageSize": number }` |

**Rôles métier** (`role` dans le profil utilisateur côté front)

- `butcher` — opérateur boucherie (équivalent API `boucher`).
- `supplier` — **fournisseur** : inclut tout ce que l’ancien écran « caissier » couvrait (ventes, liste des versements, etc.) **plus** les fonctions fournisseur (abattages, rapports). Une seule entrée UI ; pas de rôle `caissier` dans le state applicatif.
- `admin` — coordination plateforme (équivalent API `admin`).

**Compatibilité API Laravel** : le backend expose `role: "fournisseur"` ; le front mappe vers **`supplier`** (`auth-user.ts`). Un ancien `caissier` éventuel est encore accepté à la lecture. Les corps JSON utilisent **`admin`**, **`boucher`**, **`fournisseur`** ; le state client reste `butcher` | `supplier` | `admin`.

Les règles d’accès UI sont dans `src/lib/authz.ts` ; le backend doit **refuser** toute ressource hors périmètre même si l’URL est devinée.

---

## 1. Authentification (Laravel Sanctum)

Tous les chemins sont sous **`/api/v1/auth/...`** (full URL : `{NEXT_PUBLIC_API_URL}/api/v1/auth/...`). Implémentation front : `src/lib/api/services/auth.ts` (`apiLogin`, `apiRegister`, `apiLogout`) + schéma `LaravelLoginResponseSchema` (`token` + `data`).

### 1.1 `POST /api/v1/auth/register`

**Requête** (corps JSON API — voir aussi collection Postman / [guide](https://boucherie-api.onrender.com/guide))

```json
{
  "name": "Alice Martin",
  "email": "user@example.com",
  "password": "secretsecret",
  "password_confirmation": "secretsecret",
  "role": "boucher",
  "boucherie_id": "uuid-de-la-boucherie"
}
```

Pour un **`admin`**, ne pas envoyer de **`boucherie_id`** (compte non rattaché à une boucherie).

Pour un **fournisseur**, le corps peut inclure un objet **`fournisseur`** (nom, contact, téléphone, etc.), comme pour `POST /api/v1/users`.

`role` : valeurs attendues côté API (`admin`, `boucher`, `fournisseur`, etc. — voir doc Scribe).

**Réponse `201`**

```json
{
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "boucher"
  },
  "token": "1|…",
  "message": "Compte créé avec succès."
}
```

### 1.2 `POST /api/v1/auth/login`

**Requête**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Réponse `200`**

```json
{
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  },
  "token": "1|…",
  "message": "Connexion réussie."
}
```

Le front enchaîne avec **`GET /api/v1/auth/me`** pour enrichir le profil (ex. `boucherie` imbriquée si présente).

### 1.3 `GET /api/v1/auth/me`

Header : `Authorization: Bearer <token>`.

**Réponse `200`** : utilisateur courant (souvent enveloppe `data` ou champs à la racine — le mapper `extractUserPayload` accepte les deux).

### 1.4 `POST /api/v1/auth/logout`

Header : `Authorization: Bearer <token>`. Corps vide.

**Réponse `200`** : `{ "message": "Déconnexion réussie." }`

---

## 2. Utilisateurs & annuaire plateforme (admin)

Remplace le store local `user-directory-store` + la section admin « fournisseurs ↔ boucheries ».

### 2.1 `GET /api/v1/users`

Liste paginée des comptes (admin). Le frontend appelle `boucherieV1.users.list()` (`GET /api/v1/users`). Filtres query selon règles backend.

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

### 2.2 `PUT /admin/users/:userId/butcheries` (affectation ; les mises à jour user utilisent **`PATCH /users/:id`** côté API — aligné guide Scribe / Laravel)

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

Aligné sur `ButcherFormSchema` + normalisation `mapApiBoucherieRow`. **Backend Laravel** : groupe **Boucheries** dans la doc Scribe — liste [`GET /api/v1/boucheries`](https://boucherie-api.onrender.com/docs/#boucheries-GETapi-v1-boucheries), création `POST /api/v1/boucheries`, lecture `GET /api/v1/boucheries/{id}`, mise à jour **`PUT`** `/api/v1/boucheries/{id}`, suppression `DELETE /api/v1/boucheries/{id}`.

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

Les réponses liste peuvent envelopper les lignes dans `data` ; chaque ligne utilise typiquement **`nom`**, **`ville`**, **`telephone`**, **`adresse`**, etc. Le front normalise via `mapApiBoucherieRow` (`boucherie-record.ts`).

### 3.2 `POST /butcheries`

**Requête** (corps minimal aligné collection Postman — le formulaire UI peut envoyer plus de champs si le backend les accepte)

```json
{
  "nom": "Boucherie Halal",
  "adresse": "Rue …",
  "ville": "Yaoundé",
  "telephone": "+237…",
  "actif": true
}
```

Création depuis le formulaire actuel : `use-butchers.ts` mappe `name` → `nom`, `address` → `adresse`, `city` → `ville`, `phone` → `telephone`, `actif: true`.

**Réponse `201`** : fiche créée (voir Scribe pour la structure exacte).

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

**Backend Laravel** — groupe **Ventes** dans la doc Scribe : [`GET api/v1/ventes`](https://boucherie-api.onrender.com/docs/#ventes-GETapi-v1-ventes). Ci‑dessous : chemins **relatifs au préfixe `/api/v1`** (fonctions `boucherieV1.ventes.*`).

| Méthode | Chemin | Rôle |
|--------|--------|------|
| `GET` | `/ventes` | Lister les ventes |
| `POST` | `/ventes` | Créer une vente |
| `GET` | `/ventes/{vente}` | Détail d’une vente |
| `PATCH` | `/ventes/{vente}/statut` | Mettre à jour le statut |
| `DELETE` | `/ventes/{vente}` | Supprimer |
| `GET` | `/ventes/{vente}/paiements` | Paiements (versements UI) |
| `POST` | `/ventes/{vente}/paiements` | Enregistrer un paiement |
| `POST` | `/ventes/{vente}/livraison` | Créer / initier livraison |
| `PATCH` | `/ventes/{vente}/livraison` | Mettre à jour livraison |

Les query params de filtrage (`from`, `to`, etc.) et la forme exacte des réponses : **voir Scribe** (pagination / enveloppe selon version API).

### 7.1 `POST /ventes` — corps attendu (extrait Scribe)

Une vente porte un **type** (`type_vente` : valeur du référentiel / enum côté backend), un **client** optionnel, des **notes**, et au moins une **ligne** produit.

```json
{
  "type_vente": "valeur_enum_referentiel",
  "client_id": "uuid-optionnel",
  "notes": "texte optionnel",
  "lignes": [
    {
      "produit_id": "uuid",
      "quantite": 84,
      "prix_unitaire": 12
    }
  ]
}
```

- `client_id` : UUID d’un enregistrement **clients** (optionnel).
- `lignes[].produit_id` : UUID d’un **produit** ; `quantite` ≥ 0,01 ; `prix_unitaire` optionnel (≥ 0 si présent).

**Réponse `201`** : ressource vente créée (structure dans Scribe).

### 7.2 Écart avec l’UI actuelle (mock)

Les écrans `vente/liste` et `vente/enregistrer` utilisent encore des tableaux fictifs (`meatType`, `customer` texte, une seule ligne) et **ne appellent pas** `GET/POST /ventes`. Pour brancher l’API : lister **produits** (`GET /produits`), **clients** (`GET /clients`), référentiel **type de vente** (`GET /referentiels/...` selon la doc), puis mapper le formulaire vers le corps `POST /ventes` ci‑dessus.

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
2. Référencer les IDs pièce jointe dans les corps prévus par le backend (ex. `POST /abattages`, `POST /ventes`, `POST …/ventes/{id}/paiements`, réceptions stock) une fois les champs exposés dans Scribe.

---

## 10. Référentiels (enums)

Backend : **`GET /api/v1/referentiels/:type`** — liste les valeurs globales **et** celles de la boucherie de l’utilisateur. **`POST /api/v1/referentiels/:type`** avec corps `{ "valeur", "libelle", "ordre" }` pour ajouter une valeur. **`PATCH`** / **`DELETE`** sur `/referentiels/:type/:id` (les entrées `systeme=true` ne sont pas modifiables / supprimables).

Exemples de **`type`** (collection Postman / Scribe) : `espece_animal`, `categorie_produit`, `unite_produit`, `mode_paiement`, `statut_animal`, `type_vente`, `statut_vente`, `statut_livraison`, `type_mouvement`.

À utiliser côté front pour remplacer les listes en dur (`MEAT`, modes de paiement, statuts de vente/livraison, etc.).

---

## 11. Matrice rôles → endpoints (résumé)

| Zone | butcher | supplier | admin |
|------|---------|----------|-------|
| Login / me | ✓ | ✓ | ✓ |
| Boucheries CRUD | ✓ (scope) | — | ✓ |
| Slaughters | lecture si lié | ✓ CRUD ses lots | ✓ |
| Payments liste / création boucherie | ✓ | ✓ validation | ✓ |
| Stock / ventes | ✓ (scope) | ✓ ventes (fournisseur / ex‑caissier) | ✓ |
| Affectations user ↔ boucheries | — | — | ✓ |
| Rapports | selon pages | selon pages | ✓ |

---


Ce document est la **cible fonctionnelle** ; les chemins exacts (`/slaughters` vs `/abattages`, etc.) peuvent suivre la convention du backend tant qu’ils sont **stables** et documentés pour le client `NEXT_PUBLIC_API_URL`.
