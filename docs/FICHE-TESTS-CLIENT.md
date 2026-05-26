# Fiche de tests fonctionnels — MeatMaster / Boucherie

Document destiné au **client** et aux **testeurs métier** pour valider l’application web/mobile (Next.js + API Laravel).

**Version applicative** : 1.2.0  
**Dernière mise à jour** : mai 2026

---

## 1. Prérequis

| Élément | Détail |
|--------|--------|
| **Application** | Navigateur récent (Chrome, Edge, Firefox) ou app Android (Capacitor) |
| **API** | Doit être joignable depuis l’appareil de test |
| **Langues** | FR (défaut), EN, AR — menu **Paramètres → Préférences** |

### Environnements

| Environnement | URL API (frontend `.env`) | Guide / doc API |
|---------------|---------------------------|-----------------|
| **Production (Render)** | `https://boucherie-api.onrender.com` | https://boucherie-api.onrender.com/guide |
| **Local (développement)** | `http://localhost:8000` | `php artisan serve` + `migrate --seed` |

### Comptes de test

#### Production (Render)

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Administrateur | `herve@example.net` | `admin1234` |
| Fournisseur | `ali@test.com` | `ali12345` |
| Boucher | `test@gmail.com` | `test1234` |

#### Local (après `migrate --seed`)

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Administrateur | `admin@test.com` | `password` |
| Fournisseur | `fournisseur@test.com` | `password` |
| Boucher | `boucher@test.com` | `password` |

> **Comptes créés par l’admin** : mot de passe provisoire par défaut `BoucherieChangeMoi1!` (sauf configuration différente). À la première connexion, l’app impose un **changement de mot de passe** avant d’accéder au reste.

### Légende des colonnes de test

| Symbole | Signification |
|---------|----------------|
| ☐ | À tester |
| ✅ | OK |
| ❌ | KO — noter le commentaire |
| N/A | Non applicable pour ce rôle |
| ⏭ | Reporté / bloqué (prérequis manquant) |

**Commentaires** : noter écran, message d’erreur, capture d’écran, date, testeur.

---

## 2. Scénarios transverses (tous rôles)

| # | Scénario | Étapes | Résultat attendu | Admin | Boucher | Fournisseur |
|---|----------|--------|------------------|:-----:|:-------:|:-----------:|
| T1 | Connexion valide | `/auth/login` → e-mail + mot de passe | Redirection vers l’écran d’accueil du rôle | ☐ | ☐ | ☐ |
| T2 | Connexion invalide | Mauvais mot de passe | Message d’erreur, pas de session | ☐ | ☐ | ☐ |
| T3 | Déconnexion | Menu utilisateur → Déconnexion | Retour login, plus d’accès aux pages protégées | ☐ | ☐ | ☐ |
| T4 | Changement de langue | Paramètres → Préférences → FR / EN / AR | Interface traduite, sens de lecture AR si AR | ☐ | ☐ | ☐ |
| T5 | Profil | Paramètres → Profil : affichage nom, e-mail, rôle | Données cohérentes avec `/auth/me` | ☐ | ☐ | ☐ |
| T6 | Mot de passe obligatoire | Compte neuf admin avec mot de passe provisoire | Redirection `/settings/first-password`, puis accès app | ☐ | ☐ | ☐ |
| T7 | Accès interdit | Se connecter boucher, tenter URL fournisseur (ex. `/abattage/achats`) | Refus / redirection (pas de données d’un autre rôle) | N/A | ☐ | N/A |
| T8 | Tableau de bord | `/dashboard` | Indicateurs chargés (pas d’écran vide prolongé) | ☐ | ☐ | ☐ |
| T9 | Mobile — barre du bas | Réduire fenêtre ou téléphone | Onglets adaptés au rôle, navigation OK | ☐ | ☐ | ☐ |

---

## 3. Par rôle

### 3.1 Administrateur

**Écran d’accueil par défaut** : liste des utilisateurs (`/admin/users/list`)

| # | Fonctionnalité | Route | Actions à tester | Attendu | ☐ |
|---|----------------|-------|------------------|---------|---|
| A1 | Liste utilisateurs | `/admin/users/list` | Ouvrir la page | Tableau nom, e-mail, rôle, boucheries liées | ☐ |
| A2 | Créer utilisateur boucher | `/admin/users/create` | Créer boucher + boucherie | Compte créé, peut se connecter | ☐ |
| A3 | Créer utilisateur fournisseur | `/admin/users/suppliers/create` | Créer avec fiche fournisseur | Compte fournisseur + entité fournisseur | ☐ |
| A4 | Lier fournisseur ↔ boucheries | `/admin/users/suppliers/butcheries` | Cocher une ou plusieurs boucheries, enregistrer | Fournisseur peut distribuer vers ces boucheries | ☐ |
| A5 | Liste boucheries | `/admin/butcheries/list` | Consulter | Liste des boucheries actives | ☐ |
| A6 | Créer boucherie | `/admin/butcheries/create` | Saisir nom, adresse, ville, téléphone | Boucherie visible en liste | ☐ |
| A7 | Rapport ventes | `/reports/sales` | Changer période / dates | Totaux et tableau alimentés par l’API | ☐ |
| A8 | Rapport stocks | `/reports/stocks` | Filtrer par produit | Liste stocks + alertes | ☐ |
| A9 | Rapport financier | `/reports/financial` | Changer période | Versements par statut | ☐ |
| A10 | Dashboard admin | `/dashboard` | Consulter | Totaux users / boucheries | ☐ |

**Non disponible dans l’UI admin** (API seulement) : édition inline utilisateur, suppression comptes, CRUD entité `/fournisseurs` séparée.

---

### 3.2 Boucher

**Écran d’accueil par défaut** : `/dashboard`

| # | Fonctionnalité | Route | Actions à tester | Attendu | ☐ |
|---|----------------|-------|------------------|---------|---|
| B1 | Vue stock | `/stock/management` | Ouvrir, filtrer | Quantités, alertes, valeur stock | ☐ |
| B2 | Réception distribution | `/stock/reception` | Choisir distribution en attente, quantité, enregistrer (+ audio optionnel) | Réception créée, stock mis à jour | ☐ |
| B3 | Déclaration / ajustement | `/stock/declaration` | Sélectionner stock, type, quantité | Mouvement enregistré | ☐ |
| B4 | Journal stock | `/stock/journal` | Choisir un stock | Historique des mouvements | ☐ |
| B5 | Enregistrer vente | `/vente/enregistrer` | Produit, client, quantité, prix (+ audio) ; type comptoir ou livraison | Vente créée, stock décrémenté | ☐ |
| B6 | Vente livraison | `/vente/enregistrer` | Type « livraison » + adresse + date | Livraison associée à la vente | ☐ |
| B7 | Liste ventes | `/vente/liste` | Filtrer dates / statut ; marquer payée / annuler | Statuts mis à jour | ☐ |
| B8 | Créer versement | `/versement/enregistrer` | Montant, mode paiement, fournisseur assigné (lecture seule si lié) (+ audio) | Versement en attente côté fournisseur | ☐ |
| B9 | Liste versements | `/versement/liste` | Consulter ses versements | Historique visible | ☐ |
| B10 | Créer boucherie | `/boucherie/enregistrer` | Nom, adresse, ville, tél. (+ audio) | Boucherie créée (si droits API) | ☐ |
| B11 | Liste boucheries | `/boucherie/liste` | Consulter | Voit sa / ses boucheries | ☐ |
| B12 | Rapport ventes | `/reports/sales` | Filtres date | Données API, pas de tableau fictif | ☐ |
| B13 | Rapport stocks | `/reports/stocks` | Recherche produit | Aligné avec stocks réels | ☐ |
| B14 | Rapport financier | `/reports/financial` | Période | Versements (envoyés / en attente) | ☐ |

**Inaccessible au boucher** (doit être refusé) : `/abattage/*`, achats animaux fournisseur.

---

### 3.3 Fournisseur

**Écran d’accueil par défaut** : `/abattage/liste` (distributions)

| # | Fonctionnalité | Route | Actions à tester | Attendu | ☐ |
|---|----------------|-------|------------------|---------|---|
| F1 | Achats animaux | `/abattage/achats` | Espèce, tag, poids, prix, enregistrer | Achat + animal « en attente » | ☐ |
| F2 | Enregistrer abattage | `/abattage/enregistrer` | Animal en attente, date, poids carcasse, catégories, distributions par boucherie (+ audio) | Abattage + distributions créés | ☐ |
| F3 | Liste distributions | `/abattage/liste` | Filtrer statut, annuler une distribution | Liste à jour ; lien vers détail abattage | ☐ |
| F4 | Détail abattage | `/abattage/detail_abattage?id=…` | Ouvrir depuis la liste | Infos animal, distributions, lecture audio si joint | ☐ |
| F5 | Valider / rejeter versement | `/versement/liste` | Ouvrir versement en attente → valider ou rejeter | Statut mis à jour | ☐ |
| F6 | Dashboard fournisseur | `/dashboard` | Consulter | Compteurs abattages, achats, distributions | ☐ |
| F7 | Rapport financier | `/reports/financial` | Période | Versements reçus, total dû / perçu, activité abattage | ☐ |

**Inaccessible au fournisseur** (doit être refusé) : `/vente/*`, `/stock/*`, `/reports/sales`, `/reports/stocks`, création versement (`/versement/enregistrer`).

> **Prérequis métier** : l’admin doit avoir **lié le fournisseur aux boucheries** (A4). Sinon : erreur « boucherie non desservie » à la distribution.

---

## 4. Par fonctionnalité (matrice rôles)

| Fonctionnalité | Admin | Boucher | Fournisseur | Remarques |
|----------------|:-----:|:-------:|:-----------:|-----------|
| **Authentification** (login, logout, register public) | ✅ | ✅ | ✅ | Register sans rôle métier |
| **Changement mot de passe forcé** | ✅ | ✅ | ✅ | Comptes créés par admin |
| **Profil / préférences** | ✅ | ✅ | ✅ | Profil : édition selon droits API |
| **Dashboard** | ✅ | ✅ | ✅ | Contenu différent par rôle |
| **Référentiels** (espèces, catégories…) | ✅ (via API) | ✅ (listes formulaires) | ✅ (listes formulaires) | Pas d’écran admin dédié |
| **Gestion utilisateurs** | ✅ | N/A | N/A | |
| **Liaison fournisseur ↔ boucheries** | ✅ | N/A | N/A | Indispensable pour distributions |
| **Gestion boucheries (admin)** | ✅ | N/A | N/A | |
| **Création boucherie (boucher)** | ✅ | ✅ | N/A | Formulaire simplifié |
| **Achats animaux** | N/A | N/A | ✅ | |
| **Abattage + distributions** | N/A | N/A | ✅ | 2 étapes : abattage puis distribution |
| **Réception stock** | N/A | ✅ | N/A | Après distribution « en attente » |
| **Ajustement / journal stock** | N/A | ✅ | N/A | |
| **Ventes** | ✅ (stats) | ✅ | N/A | |
| **Versements (création)** | N/A | ✅ | N/A | Vers fournisseur assigné |
| **Versements (validation)** | N/A | N/A | ✅ | Liste partagée boucher/fournisseur |
| **Rapports ventes** | ✅ | ✅ | N/A | |
| **Rapports stocks** | ✅ | ✅ | N/A | |
| **Rapport financier** | ✅ | ✅ | ✅ | |
| **Pièces jointes audio** | — | Ventes, réceptions, versements | Abattage | Boucherie création : audio OK |
| **Recettes journalières** | API | API | API | Pas d’écran dédié dans l’app |

---

## 5. Parcours métier bout-en-bout (recommandé pour la recette client)

Cocher chaque parcours une fois complet sur l’environnement cible (prod ou local).

### Parcours 1 — Cycle fournisseur → boucher (happy path)

| Étape | Acteur | Action | ☐ |
|------|--------|--------|---|
| 1 | Admin | Créer boucherie + boucher + fournisseur ; lier fournisseur à la boucherie | ☐ |
| 2 | Fournisseur | Achats animaux (tag unique) | ☐ |
| 3 | Fournisseur | Abattage + distribution vers la boucherie (kg par catégorie) | ☐ |
| 4 | Boucher | Réception de la distribution | ☐ |
| 5 | Boucher | Vente d’une partie du stock | ☐ |
| 6 | Boucher | Versement au fournisseur | ☐ |
| 7 | Fournisseur | Valider le versement dans la liste | ☐ |
| 8 | Tous | Vérifier rapports / dashboard (montants cohérents) | ☐ |

### Parcours 2 — Annulation et refus

| Étape | Acteur | Action | ☐ |
|------|--------|--------|---|
| 1 | Fournisseur | Annuler une distribution en attente | ☐ |
| 2 | Boucher | Tenter réception sur distribution annulée | ☐ |
| 3 | Fournisseur | Rejeter un versement avec motif | ☐ |

### Parcours 3 — Contrôles de sécurité

| Étape | Action | ☐ |
|------|--------|---|
| 1 | Boucher tente d’ouvrir `/abattage/achats` | ☐ |
| 2 | Fournisseur tente d’ouvrir `/vente/enregistrer` | ☐ |
| 3 | Utilisateur non connecté tente `/dashboard` | ☐ |

---

## 6. Tests API automatisés (équipe technique)

Pour une vérification rapide de **tous les endpoints** consommés par le frontend :

```powershell
cd boucherie-frontend
npm run test:api
```

Configurer `scripts/.env.test` (URL + comptes). Résultat détaillé : `scripts/test-api-last.log`.

---

## 7. Synthèse de recette

| Domaine | Nb cas (indicatif) | Validés | KO | % |
|---------|-------------------|---------|-----|---|
| Transversal | 9 | | | |
| Admin | 10 | | | |
| Boucher | 14 | | | |
| Fournisseur | 7 | | | |
| Parcours E2E | 3 parcours | | | |

**Validé pour mise en production** : ☐ Oui ☐ Non  

**Signatures**  

| Rôle | Nom | Date |
|------|-----|------|
| Client / métier | | |
| QA | | |
| Technique | | |

---

## 8. Problèmes connus / limites (à ne pas compter comme bug sans confirmation)

| Sujet | Détail |
|-------|--------|
| Liste abattages | Affiche surtout les **distributions**, pas une liste d’abattages seule |
| Historique achats | Création OK, **pas de liste** dédiée des achats passés |
| Profil | Mise à jour nom/e-mail peut nécessiter droits admin côté API |
| Render (prod) | Premier chargement après inactivité : 1–2 min possible (réveil serveur) |
| Prix distribution | Peut être saisi dans les **notes**, pas en champ dédié |
| Recettes journalières | Endpoint API présent, **pas d’écran** dans l’app |

---

*Document généré pour le projet Boucherie / MeatMaster. Pour toute évolution des écrans, mettre à jour ce fichier en parallèle des releases.*
