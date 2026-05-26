---
title: "MeatMaster — Fiche de recette mobile"
---

\newpage

# MEATMASTER v1.2.0

## Fiche de Recette Mobile — Android

**Document confidentiel — Mai 2026**

**Serveur de démonstration :** https://boucherie-api.onrender.com

---

## Comptes de démonstration

| Profil | E-mail | Mot de passe | Rôle |
|--------|--------|--------------|------|
| Administrateur | herve@example.net | admin1234 | Admin |
| Fournisseur | ali@test.com | ali12345 | Fournisseur |
| Boucher | test@gmail.com | test1234 | Boucher |

**Mot de passe provisoire** (comptes créés par l'admin) : `BoucherieChangeMoi1!` — changement obligatoire à la première connexion.

**Légende :** cocher ☐ OK ou ☐ KO — noter les remarques dans la colonne prévue.

---

## PARTIE A — Fonctionnalités communes (tous profils)

### A1 — Connexion

| | |
|---|---|
| **Profils** | Administrateur, Fournisseur, Boucher |
| **Ouvrir** | Au lancement → écran Connexion |

**Actions à réaliser**

1. Saisir l'e-mail du compte à tester.
2. Saisir le mot de passe.
3. Appuyer sur l'icône œil pour afficher/masquer le mot de passe (optionnel).
4. Appuyer sur **Se connecter**.
5. Attendre le chargement (patienter si le serveur est lent).

**Résultat attendu**

- Message de succès ou arrivée sur l'écran d'accueil du profil.
- Admin → liste utilisateurs ou tableau de bord.
- Fournisseur → liste abattage / distributions.
- Boucher → tableau de bord.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A2 — Connexion refusée (contrôle)

| | |
|---|---|
| **Profils** | Tous |

**Actions à réaliser**

1. Saisir un e-mail valide et un **mauvais** mot de passe.
2. Appuyer sur **Se connecter**.

**Résultat attendu**

- Message d'erreur visible.
- Pas d'accès aux écrans internes.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A3 — Changement de mot de passe obligatoire

| | |
|---|---|
| **Profils** | Compte nouvellement créé par l'admin |
| **Ouvrir** | Automatique après connexion avec mot de passe provisoire |

**Actions à réaliser**

1. Se connecter avec le compte créé par l'admin (mot de passe provisoire `BoucherieChangeMoi1!`).
2. Saisir un **nouveau mot de passe** (8 caractères minimum).
3. **Confirmer** le nouveau mot de passe (différent du provisoire).
4. Appuyer sur **Enregistrer et continuer**.

**Résultat attendu**

- Accès au reste de l'application.
- À la prochaine connexion, utiliser le **nouveau** mot de passe.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A4 — Déconnexion

| | |
|---|---|
| **Profils** | Tous |

**Actions à réaliser**

1. Ouvrir le **menu utilisateur** (en haut à droite).
2. Appuyer sur **Déconnexion**.
3. Vérifier le retour à l'écran de connexion.
4. Se reconnecter avec un **autre** profil pour la suite des tests.

**Résultat attendu**

- Session fermée ; impossible d'accéder au tableau de bord sans se reconnecter.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A5 — Changer la langue

| | |
|---|---|
| **Profils** | Tous |
| **Ouvrir** | Menu ☰ → **Paramètres** → **Préférences** |

**Actions à réaliser**

1. Sur l'écran Préférences, repérer le sélecteur de langue (**FR** / **EN** / **AR**).
2. Appuyer sur **EN** (anglais).
3. Parcourir un autre écran (ex. Accueil) : les libellés doivent être en anglais.
4. Revenir aux Préférences et repasser en **FR**.

**Résultat attendu**

- L'interface change de langue immédiatement.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A6 — Consulter et modifier le profil

| | |
|---|---|
| **Profils** | Tous |
| **Ouvrir** | Menu ☰ → **Paramètres** → **Profil** |

**Actions à réaliser**

1. Vérifier que **nom**, **e-mail** et **rôle** affichés correspondent au compte connecté.
2. Modifier le **nom** (ajouter « TEST » à la fin).
3. Appuyer sur **Enregistrer**.
4. Fermer l'app (gestionnaire Android) et rouvrir → vérifier que le nom est conservé.

**Résultat attendu**

- Données affichées cohérentes.
- Message de succès après enregistrement.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### A7 — Tableau de bord (Accueil)

| | |
|---|---|
| **Profils** | Tous |
| **Ouvrir** | Barre du bas → **Accueil** (première icône) |

**Actions à réaliser**

1. Appuyer sur **Accueil** si ce n'est pas déjà l'écran affiché.
2. Faire défiler la page.
3. Noter les **cartes chiffrées** (stocks, ventes, abattages, versements selon le rôle).

**Résultat attendu**

- Chiffres ou listes visibles (pas d'écran blanc prolongé).
- Contenu **différent** selon admin / fournisseur / boucher.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

\newpage

## PARTIE B — Administrateur

**Connectez-vous avec** `herve@example.net` / `admin1234`.

### B1 — Liste des utilisateurs

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Barre du bas → **Utilisateurs** **ou** Menu ☰ → **Utilisateurs** → **Liste des utilisateurs** |

**Actions à réaliser**

1. Ouvrir la liste.
2. Faire défiler le tableau : colonnes **nom**, **e-mail**, **rôle**, **boucheries**.
3. Repérer les comptes de démo (fournisseur, boucher).

**Résultat attendu**

- Au moins les comptes de test sont visibles.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B2 — Créer un utilisateur (boucher)

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Utilisateurs** → **Nouvel utilisateur** |

**Actions à réaliser**

1. **Nom** : `Boucher Recette Test`.
2. **E-mail** : une adresse unique (ex. `boucher.recette@test.local`).
3. Choisir le rôle **Boucher**.
4. Dans **Boucherie**, sélectionner une boucherie existante.
5. Lire l'indication sur le **mot de passe provisoire** (attribué automatiquement).
6. Appuyer sur le bouton de **création / enregistrement** en bas du formulaire.

**Résultat attendu**

- Message de succès « Utilisateur créé ».
- Le nouvel utilisateur apparaît dans la liste (B1).
- *(Optionnel)* Se connecter avec ce compte → écran A3 (changement mot de passe).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B3 — Créer un fournisseur

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Fournisseurs** → **Nouveau fournisseur** |

**Actions à réaliser**

1. **Nom du compte** : `Fournisseur Recette Test`.
2. **E-mail unique** : ex. `fournisseur.recette@test.local`.
3. Vérifier que le rôle est **Fournisseur**.
4. Remplir la **fiche fournisseur** (nom commercial, contact, téléphone, e-mail, adresse).
5. **Enregistrer**.

**Résultat attendu**

- Compte fournisseur créé avec succès.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B4 — Lier un fournisseur à une boucherie

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Fournisseurs** → **Fournisseurs ↔ boucheries** |

**Actions à réaliser**

1. Repérer le fournisseur de test (`ali@test.com` ou celui créé en B3).
2. **Cocher** au moins une boucherie (ex. « Boucherie Test »).
3. Appuyer sur **Enregistrer** / **Sauvegarder**.
4. Vérifier que les boucheries cochées restent affichées comme sélectionnées.

**Résultat attendu**

- Message de succès « Affectation mise à jour ».

> **Note :** Sans cette étape, le fournisseur ne pourra pas distribuer vers la boucherie (erreur métier).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B5 — Liste des boucheries

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Barre du bas → **Boucheries** **ou** Menu ☰ → **Boucheries** |

**Actions à réaliser**

1. Ouvrir la liste.
2. Vérifier la présence d'au moins une boucherie (nom, ville, téléphone).

**Résultat attendu**

- Tableau ou liste lisible sur mobile.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B6 — Créer une boucherie

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Boucheries** → **Nouvelle boucherie** |

**Actions à réaliser**

1. **Nom** : `Boucherie Recette Mobile`.
2. **Adresse** : une adresse de test.
3. **Ville** : ex. `Douala`.
4. **Téléphone** : ex. `+237600000001`.
5. **Enregistrer**.

**Résultat attendu**

- Boucherie créée ; visible dans B5.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B7 — Rapport des ventes

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Barre du bas → **Rapports** **ou** Menu ☰ → **Rapports** → **Rapport de Ventes** |

**Actions à réaliser**

1. Choisir une **période** (7 jours / 30 jours / 12 mois).
2. Optionnel : renseigner **Date du** et **Date au**.
3. Optionnel : filtrer par **statut** de vente.
4. Consulter les **totaux** en haut (montant, nombre de ventes).
5. Faire défiler le **tableau** des ventes.
6. Consulter le bloc **Top produits**.

**Résultat attendu**

- Données chargées depuis le serveur (pas de chiffres inventés fixes).
- Les filtres modifient la liste.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B8 — Rapport des stocks

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Rapports** → **Rapport de Stocks** |

**Actions à réaliser**

1. Choisir une **période**.
2. Noter le nombre de **références** et d'**alertes**.
3. Utiliser la **recherche produit** (taper quelques lettres d'un nom de viande).
4. Parcourir le tableau : produit, quantité, seuil, statut.

**Résultat attendu**

- Liste des stocks actuels avec statut Normal / Alerte.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### B9 — Rapport financier

| | |
|---|---|
| **Profils** | Administrateur |
| **Ouvrir** | Menu ☰ → **Rapports** → **Rapport Financier** |

**Actions à réaliser**

1. Choisir une **période**.
2. Lire les cartes **En attente**, **Validés**, **Rejetés** (montants en FCFA).
3. Comparer avec l'activité versements connue.

**Résultat attendu**

- Synthèse des versements par statut.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

**Fin des tests Administrateur** — effectuer **A4 Déconnexion**.

\newpage

## PARTIE C — Fournisseur

**Connectez-vous avec** `ali@test.com` / `ali12345`.

### C1 — Vérifier les menus accessibles

| | |
|---|---|
| **Profils** | Fournisseur |

**Actions à réaliser**

1. Ouvrir le **menu ☰** et noter les entrées visibles.
2. Vérifier que **Ventes**, **Gestion des stocks** et **Rapport de ventes** **n'apparaissent pas**.
3. Vérifier la **barre du bas** : Accueil, Abattage, Achats, Paiements, Rapports.

**Résultat attendu**

- Menus limités au métier fournisseur.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C2 — Enregistrer un achat d'animal

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Barre du bas → **Achats** **ou** Menu ☰ → **Abattage** → **Achat d'animaux** |

**Actions à réaliser**

1. **Date d'achat** : date du jour.
2. **Montant total** : ex. 150 000 FCFA.
3. **Espèce** : choisir dans la liste (ex. bovin, mouton).
4. **Poids vif (kg)** : ex. 120.
5. **Prix d'achat** : ex. 150 000.
6. **Numéro de tag** : valeur **unique** (ex. `TAG-RECETTE-001`).
7. **Notes** : optionnel.
8. Appuyer sur **Enregistrer** / bouton de validation.

**Résultat attendu**

- Message de succès.
- L'animal est disponible pour l'abattage (étape C3).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C3 — Enregistrer un abattage et des distributions

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Menu ☰ → **Abattage** → **Enregistrer Abattage** |

**Actions à réaliser — Abattage**

1. **Animal** : sélectionner l'animal créé en C2 (espèce · tag).
2. **Date d'abattage** : date du jour.
3. **Poids par catégorie** : saisir un poids en kg pour chaque catégorie (viande, peau, etc.).
4. Vérifier le **total carcasse** affiché.

**Actions à réaliser — Distribution**

5. **Boucherie** : choisir la boucherie liée en B4.
6. Pour chaque catégorie, saisir le **poids distribué** (≤ poids abattage) et **prix** optionnel.
7. *(Optionnel)* **Ajouter une boucherie** via le bouton dédié.
8. *(Optionnel)* Enregistrer une **note vocale**.
9. Appuyer sur **Enregistrer l'abattage et les distributions**.

**Résultat attendu**

- Succès sans message « boucherie non desservie ».
- Distributions visibles en C4 avec statut **en attente**.

> **Prérequis :** B4 effectué (fournisseur lié à la boucherie cible).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C4 — Liste des distributions (écran Abattage)

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Barre du bas → **Abattage** |

**Actions à réaliser**

1. Consulter les compteurs en haut (nombre de distributions, poids total).
2. **Rechercher** un mot (boucherie, produit).
3. **Filtrer par statut** : En attente / Acceptée / Rejetée.
4. Sur une ligne **en attente**, appuyer sur **Détail** → vérifier la fiche abattage.
5. Revenir à la liste.

**Résultat attendu**

- La distribution créée en C3 apparaît.
- Le détail abattage affiche animal, poids, distributions, audio si enregistré.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C5 — Annuler une distribution

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Barre du bas → **Abattage** (liste) |

**Actions à réaliser**

1. Repérer une distribution au statut **en attente** (pas encore réceptionnée).
2. Appuyer sur **Annuler** (icône croix rouge).
3. Confirmer si une boîte de dialogue apparaît.
4. Actualiser le filtre : la ligne doit être annulée ou disparaître du filtre « en attente ».

**Résultat attendu**

- Distribution annulée ; le boucher ne pourra plus la réceptionner.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C6 — Liste des versements et validation

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Barre du bas → **Paiements** |

**Actions à réaliser**

1. Parcourir la liste : date, boucherie, montant, mode, référence, statut.
2. Repérer un versement **en attente** créé par le boucher (étape D9).
3. Appuyer sur **Valider** → vérifier que le statut passe à **validé**.
4. Sur un autre versement **en attente**, appuyer sur **Rejeter**.
5. Saisir un **motif** si demandé → vérifier le statut **rejeté**.

**Résultat attendu**

- Le fournisseur peut valider ou rejeter les paiements reçus de la boucherie.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### C7 — Rapport financier (fournisseur)

| | |
|---|---|
| **Profils** | Fournisseur |
| **Ouvrir** | Barre du bas → **Rapports** |

**Actions à réaliser**

1. Changer la **période** (7 j / 30 j / 12 mois).
2. Lire **Abattages** : nombre, poids, rendement.
3. Lire **Versements** : en attente, validés, rejetés, total dû, total perçu.

**Résultat attendu**

- Chiffres cohérents avec C6 et l'activité du jour.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

**Fin tests Fournisseur** — effectuer **A4 Déconnexion**.

\newpage

## PARTIE D — Boucher

**Connectez-vous avec** `test@gmail.com` / `test1234`.

### D1 — Vérifier les menus accessibles

| | |
|---|---|
| **Profils** | Boucher |

**Actions à réaliser**

1. Menu ☰ : vérifier **Gestion des stocks**, **Ventes**, **Versements**.
2. Vérifier l'**absence** de **Achat d'animaux** et **Enregistrer Abattage**.
3. Barre du bas : Accueil, Stock, Ventes, Paiements, Rapports.

**Résultat attendu**

- Menus limités au métier boucher.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D2 — État des stocks

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Barre du bas → **Stock** **ou** Menu ☰ → **État des Stocks** |

**Actions à réaliser**

1. Consulter les **cartes** (valeur totale, alertes).
2. **Filtrer** par nom de produit (champ recherche).
3. Parcourir le tableau : produit, quantité, seuil, statut.

**Résultat attendu**

- Stocks visibles ; produits en alerte signalés.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D3 — Réceptionner une distribution

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Menu ☰ → **Gestion des stocks** → **Réception de Viande** |

**Actions à réaliser**

1. **Distribution** : sélectionner dans la liste une ligne (date · kg · produit).
2. **Quantité reçue** : saisir le poids réellement reçu.
3. **Date de réception** : date du jour.
4. **Notes** : optionnel.
5. *(Optionnel)* Enregistrer une **note vocale**.
6. **Enregistrer**.

**Résultat attendu**

- Message de succès.
- Le stock du produit augmente (vérifiable en D2).

> **Prérequis :** distribution **en attente** créée en C3, **non annulée** (C5).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D4 — Déclaration / ajustement de stock

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Menu ☰ → **Déclaration de Stock** |

**Actions à réaliser**

1. **Stock** : choisir un produit dans la liste.
2. **Type de mouvement** : Ajustement (ou Entrée / Sortie).
3. **Quantité** : petite valeur positive (ex. 0,5 kg).
4. **Motif** : ex. `Inventaire recette mobile`.
5. **Enregistrer**.

**Résultat attendu**

- Succès ; quantité mise à jour en D2.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D5 — Journal de stock

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Menu ☰ → **Journal de Stock** |

**Actions à réaliser**

1. **Stock** : sélectionner le même produit qu'en D4.
2. Consulter la liste des **mouvements** (dates, types, quantités).

**Résultat attendu**

- Au moins le mouvement de réception (D3) et/ou l'ajustement (D4) apparaissent.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D6 — Enregistrer une vente au comptoir

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Barre du bas → **Ventes** |

**Actions à réaliser**

1. **Date** : aujourd'hui.
2. **Type de vente** : **Comptoir**.
3. **Client** : optionnel — choisir un client ou laisser vide.
4. **Produit** : choisir un produit ayant du **stock** suffisant.
5. Vérifier que le **prix unitaire** se remplit (modifiable).
6. **Quantité vendue** : ex. 2 kg (≤ stock disponible).
7. Vérifier le **total** affiché.
8. **Enregistrer**.

**Résultat attendu**

- Vente créée ; stock diminué.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D7 — Enregistrer une vente en livraison

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Barre du bas → **Ventes** |

**Actions à réaliser**

1. Remplir comme D6 mais **Type de vente** : **Livraison**.
2. Choisir un **client** (obligatoire pour livraison).
3. Renseigner **Adresse de livraison** (ex. Quartier Test, rue 12).
4. **Date prévue** : date future ou du jour.
5. **Enregistrer**.

**Résultat attendu**

- Vente + livraison créées sans erreur de validation.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D8 — Liste des ventes et changement de statut

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Menu ☰ → **Ventes** → **Liste des Ventes** |

**Actions à réaliser**

1. Filtrer par **dates** si besoin.
2. Filtrer par **type** ou **statut**.
3. Repérer une vente récente (D6 ou D7).
4. Appuyer sur **Payée** → vérifier le changement de statut.
5. Sur une autre vente de test, appuyer sur **Annuler** (si métier autorisé).

**Résultat attendu**

- Liste à jour ; statuts modifiables.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D9 — Enregistrer un versement au fournisseur

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Barre du bas → **Paiements** |

**Actions à réaliser**

1. **Fournisseur** : sélectionner dans la liste (ou affiché en lecture seule si assigné).
2. **Montant** : ex. 50 000 FCFA.
3. **Mode de paiement** : ex. Mobile money / Espèces.
4. **Date** : aujourd'hui.
5. **Référence** : ex. `VIR-RECETTE-001` (unique).
6. **Notes** : optionnel.
7. *(Optionnel)* Enregistrer une **note vocale**.
8. **Enregistrer**.

**Résultat attendu**

- Versement créé en statut **en attente** (visible côté fournisseur en C6).

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D10 — Liste des versements (boucher)

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Menu ☰ → **Versements** → **Liste des Versements** |

**Actions à réaliser**

1. Trouver le versement D9 dans la liste.
2. Vérifier montant, date, statut **en attente**.

**Résultat attendu**

- Historique des versements envoyés visible.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

### D11 — Rapports boucher

| | |
|---|---|
| **Profils** | Boucher |
| **Ouvrir** | Barre du bas → **Rapports** |

**Actions à réaliser**

1. **Rapport de ventes** : période + filtres (comme B7).
2. **Rapport de stocks** : recherche + alertes (comme B8).
3. **Rapport financier** : versements (comme B9).

**Résultat attendu**

- Données alignées avec ventes et stocks réels du compte boucher.

| OK | KO | Remarques |
|:--:|:--:|-----------|
| ☐ | ☐ | |

---

\newpage

## PARTIE E — Parcours métier complet (recette finale)

À exécuter **dans l'ordre**, idéalement sur une demi-journée, avec les **trois comptes**.

| Étape | Profil | Réf. | Action résumée | OK | KO |
|------|--------|------|----------------|:--:|:--:|
| 1 | Admin | B4, B6 | Boucherie OK + fournisseur `ali@test.com` lié à cette boucherie | ☐ | ☐ |
| 2 | Fournisseur | C2 | Achat animal — tag unique | ☐ | ☐ |
| 3 | Fournisseur | C3 | Abattage + distribution vers la boucherie | ☐ | ☐ |
| 4 | Boucher | D3 | Réception de la distribution | ☐ | ☐ |
| 5 | Boucher | D6 | Vente d'au moins 1 kg | ☐ | ☐ |
| 6 | Boucher | D9 | Versement au fournisseur | ☐ | ☐ |
| 7 | Fournisseur | C6 | Valider le versement | ☐ | ☐ |
| 8 | Tous | A7, C7, D11 | Vérifier tableaux de bord et rapports | ☐ | ☐ |

---

## PARTIE F — Synthèse et retour

| Domaine | Nb tests | OK | KO |
|---------|----------|----|----|
| Commun (A) | 7 | | |
| Administrateur (B) | 9 | | |
| Fournisseur (C) | 7 | | |
| Boucher (D) | 11 | | |
| Parcours E2E (E) | 8 étapes | | |

**Verdict :** ☐ Accepté &nbsp;&nbsp; ☐ Accepté avec réserves &nbsp;&nbsp; ☐ Refusé

**Remarques générales :**

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

| Client | Date | Signature |
|--------|------|-----------|
| | | |

---

## Annexe — Remontée d'anomalie

Pour chaque problème constaté, renseigner les informations suivantes :

| # | Information |
|---|-------------|
| 1 | Profil (admin / fournisseur / boucher) |
| 2 | Écran (ex. « Réception de viande ») |
| 3 | Numéros des actions réalisées (ex. D3, étape 6) |
| 4 | Message d'erreur exact ou **capture d'écran** |
| 5 | Modèle du téléphone + version Android |

---

*MeatMaster v1.2.0 — Fiche de recette mobile Android — Document confidentiel — Mai 2026*
