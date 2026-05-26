MeatMaster — Guide de recette mobile (Android)
Application : MeatMaster v1.2.0
Plateforme : téléphone ou tablette Android (APK fourni)
Serveur de démonstration : https://boucherie-api.onrender.com
Document : guide pas à pas pour le client — mai 2026

Comment utiliser ce document
Pour chaque fonctionnalité vous trouverez :
1. Qui peut tester (Administrateur / Fournisseur / Boucher)
2. Comment ouvrir l’écran sur mobile (barre du bas ☰ ou menu latéral ☰ en haut à gauche)
3. Actions à réaliser — numérotées, dans l’ordre
4. Résultat attendu
5. Cases à cocher : OK / KO + remarques
Testez un seul compte à la fois. Déconnectez-vous avant de changer de profil.

1. Installation et prérequis
Étape
Action
1
Copier le fichier APK sur l’appareil Android.
2
Ouvrir le fichier → autoriser Installation depuis cette source si Android le demande.
3
Appuyer sur Installer, puis ouvrir MeatMaster.
4
Accepter la permission Microphone si un formulaire propose l’enregistrement vocal.
5
Vérifier que le WiFi ou les données mobiles sont actifs.
Note : au premier lancement après inactivité du serveur, la connexion peut prendre 1 à 2 minutes. Réessayez en cas d’échec.
Comptes de démonstration
Profil
E-mail
Mot de passe
Administrateur
herve@example.net
admin1234
Fournisseur
ali@test.com
ali12345
Boucher
test@gmail.com
test1234
Mot de passe provisoire (comptes créés par l’admin) : BoucherieChangeMoi1! — changement obligatoire à la première connexion.
Rappel navigation mobile
Élément
Emplacement
Barre du bas
5 icônes selon le profil (Accueil, Stock, Ventes, etc.)
Menu ☰
En haut à gauche → liste complète des écrans
Menu utilisateur
En haut à droite → Déconnexion

PARTIE A — Fonctionnalités communes (tous profils)

A1 — Connexion


Profils
Administrateur, Fournisseur, Boucher
Ouvrir
Au lancement de l’app → écran Connexion
Actions à réaliser
1. Saisir l’e-mail du compte à tester.
2. Saisir le mot de passe.
3. Appuyer sur l’icône œil pour afficher/masquer le mot de passe (optionnel).
4. Appuyer sur Se connecter.
5. Attendre le chargement (patienter si le serveur est lent).
Résultat attendu
• Message de succès ou arrivée sur l’écran d’accueil du profil. 
• Admin → liste utilisateurs ou tableau de bord. 
• Fournisseur → liste abattage / distributions. 
• Boucher → tableau de bord.
OK
KO
Remarques
☐
☐


A2 — Connexion refusée (contrôle)


Profils
Tous
Actions à réaliser
1. Saisir un e-mail valide et un mauvais mot de passe.
2. Appuyer sur Se connecter.
Résultat attendu
• Message d’erreur visible. 
• Pas d’accès aux écrans internes.
OK
KO
Remarques
☐
☐


A3 — Changement de mot de passe obligatoire


Profils
Compte nouvellement créé par l’admin (voir C3)
Ouvrir
Automatique après connexion avec mot de passe provisoire
Actions à réaliser
1. Se connecter avec le compte créé par l’admin (mot de passe BoucherieChangeMoi1! sauf indication contraire).
2. Sur l’écran Changement de mot de passe obligatoire :
o saisir un nouveau mot de passe (8 caractères minimum) ; 
o le confirmer ; 
o le mot de passe doit être différent du provisoire.
3. Appuyer sur Enregistrer et continuer.
Résultat attendu
• Accès au reste de l’application. 
• À la prochaine connexion, utiliser le nouveau mot de passe.
OK
KO
Remarques
☐
☐


A4 — Déconnexion


Profils
Tous
Actions à réaliser
1. Ouvrir le menu utilisateur (en haut à droite).
2. Appuyer sur Déconnexion.
3. Vérifier le retour à l’écran de connexion.
4. Se reconnecter avec un autre profil pour la suite des tests.
Résultat attendu
• Session fermée ; impossible d’accéder au tableau de bord sans se reconnecter.
OK
KO
Remarques
☐
☐


A5 — Changer la langue


Profils
Tous
Ouvrir
Menu ☰ → Paramètres → Préférences
Actions à réaliser
1. Sur l’écran Préférences, repérer le sélecteur de langue (FR / EN / AR).
2. Appuyer sur EN (anglais).
3. Parcourir un autre écran (ex. Accueil) : les libellés doivent être en anglais.
4. Revenir aux Préférences et repasser en FR.
Résultat attendu
• L’interface change de langue immédiatement.
OK
KO
Remarques
☐
☐


A6 — Consulter et modifier le profil


Profils
Tous
Ouvrir
Menu ☰ → Paramètres → Profil
Actions à réaliser
1. Vérifier que nom, e-mail et rôle affichés correspondent au compte connecté.
2. Modifier le nom (ajouter « TEST » à la fin).
3. Appuyer sur Enregistrer.
4. Fermer l’app (gestionnaire Android) et rouvrir → vérifier que le nom est conservé.
Résultat attendu
• Données affichées cohérentes. 
• Message de succès après enregistrement (si les droits API le permettent pour ce profil).
OK
KO
Remarques
☐
☐


A7 — Tableau de bord (Accueil)


Profils
Tous
Ouvrir
Barre du bas → Accueil (première icône)
Actions à réaliser
1. Après connexion, appuyer sur Accueil si ce n’est pas déjà l’écran affiché.
2. Faire défiler la page.
3. Noter les cartes chiffrées (stocks, ventes, abattages, versements selon le rôle).
Résultat attendu
• Chiffres ou listes visibles (pas d’écran blanc prolongé). 
• Contenu différent selon admin / fournisseur / boucher.
OK
KO
Remarques
☐
☐


PARTIE B — Administrateur
Connectez-vous avec herve@example.net / admin1234.

B1 — Liste des utilisateurs


Ouvrir
Barre du bas → icône Utilisateurs ou Menu ☰ → Utilisateurs → Liste des utilisateurs
Actions à réaliser
1. Ouvrir la liste.
2. Faire défiler le tableau : colonnes nom, e-mail, rôle, boucheries.
3. Repérer les comptes de démo (fournisseur, boucher).
Résultat attendu
• Au moins les comptes de test visibles.
OK
KO
Remarques
☐
☐


B2 — Créer un utilisateur (boucher)


Ouvrir
Menu ☰ → Utilisateurs → Nouvel utilisateur
Actions à réaliser
1. Remplir Nom : Boucher Recette Test.
2. Remplir E-mail : une adresse unique (ex. boucher.recette@test.local).
3. Choisir le rôle Boucher.
4. Dans Boucherie, sélectionner une boucherie existante (ex. « Boucherie Test »).
5. Lire l’indication sur le mot de passe provisoire (attribué automatiquement).
6. Appuyer sur le bouton de création / enregistrement en bas du formulaire.
Résultat attendu
• Message de succès « Utilisateur créé ». 
• Le nouvel utilisateur apparaît dans la liste (B1). 
• (Optionnel) Se connecter avec ce compte → écran A3 (changement mot de passe).
OK
KO
Remarques
☐
☐


B3 — Créer un fournisseur


Ouvrir
Menu ☰ → Fournisseurs → Nouveau fournisseur
Actions à réaliser
1. Remplir Nom du compte : Fournisseur Recette Test.
2. Remplir E-mail unique : ex. fournisseur.recette@test.local.
3. Vérifier que le rôle est Fournisseur.
4. Remplir la fiche fournisseur (nom commercial, contact, téléphone, e-mail, adresse — champs proposés).
5. Enregistrer.
Résultat attendu
• Compte fournisseur créé avec succès.
OK
KO
Remarques
☐
☐


B4 — Lier un fournisseur à une ou plusieurs boucheries


Ouvrir
Menu ☰ → Fournisseurs → Fournisseurs ↔ boucheries
Important
Sans cette étape, le fournisseur ne pourra pas distribuer vers la boucherie (erreur métier).
Actions à réaliser
1. Repérer le fournisseur de test (ali@test.com ou celui créé en B3).
2. Sous la liste des boucheries, cocher au moins une boucherie (ex. « Boucherie Test »).
3. Appuyer sur Enregistrer / Sauvegarder pour ce fournisseur.
4. Vérifier que les boucheries cochées restent affichées comme sélectionnées.
Résultat attendu
• Message de succès « Affectation mise à jour ».
OK
KO
Remarques
☐
☐


B5 — Liste des boucheries


Ouvrir
Barre du bas → Boucheries ou Menu ☰ → Boucheries → Boucheries
Actions à réaliser
1. Ouvrir la liste.
2. Vérifier la présence d’au moins une boucherie (nom, ville, téléphone).
Résultat attendu
• Tableau ou liste lisible sur mobile.
OK
KO
Remarques
☐
☐


B6 — Créer une boucherie


Ouvrir
Menu ☰ → Boucheries → Nouvelle boucherie
Actions à réaliser
1. Nom : Boucherie Recette Mobile.
2. Adresse : une adresse de test.
3. Ville : ex. Douala.
4. Téléphone : ex. +237600000001.
5. Enregistrer.
Résultat attendu
• Boucherie créée ; visible dans B5.
OK
KO
Remarques
☐
☐


B7 — Rapport des ventes


Ouvrir
Barre du bas → Rapports ou Menu ☰ → Rapports → Rapport de Ventes
Actions à réaliser
1. Choisir une période (7 jours / 30 jours / 12 mois).
2. Optionnel : renseigner Date du et Date au.
3. Optionnel : filtrer par statut de vente.
4. Consulter les totaux en haut (montant, nombre de ventes).
5. Faire défiler le tableau des ventes.
6. Consulter le bloc Top produits.
Résultat attendu
• Données chargées depuis le serveur (pas de chiffres inventés fixes). 
• Les filtres modifient la liste.
OK
KO
Remarques
☐
☐


B8 — Rapport des stocks


Ouvrir
Menu ☰ → Rapports → Rapport de Stocks
Actions à réaliser
1. Choisir une période.
2. Noter le nombre de références et d’alertes.
3. Utiliser la recherche produit (taper quelques lettres d’un nom de viande).
4. Parcourir le tableau : produit, quantité, seuil, statut.
Résultat attendu
• Liste des stocks actuels avec statut Normal / Alerte.
OK
KO
Remarques
☐
☐


B9 — Rapport financier


Ouvrir
Menu ☰ → Rapports → Rapport Financier
Actions à réaliser
1. Choisir une période.
2. Lire les cartes En attente, Validés, Rejetés (montants en FCFA).
3. Comparer avec l’activité versements connue.
Résultat attendu
• Synthèse des versements par statut.
OK
KO
Remarques
☐
☐


Fin des tests Administrateur → effectuer A4 Déconnexion.

PARTIE C — Fournisseur
Connectez-vous avec ali@test.com / ali12345.

C1 — Vérifier les menus accessibles
Actions à réaliser
1. Ouvrir le menu ☰ et noter les entrées visibles.
2. Vérifier que Ventes, Gestion des stocks et Rapport de ventes n’apparaissent pas (ou mènent à un refus).
3. Vérifier la barre du bas : Accueil, Abattage, Achats, Paiements, Rapports.
Résultat attendu
• Menus limités au métier fournisseur.
OK
KO
Remarques
☐
☐


C2 — Enregistrer un achat d’animal


Ouvrir
Barre du bas → Achats ou Menu ☰ → Abattage → Achat d’animaux
Actions à réaliser
1. Date d’achat : date du jour.
2. Montant total : ex. 150000 (FCFA).
3. Espèce : choisir dans la liste (ex. bovin, mouton).
4. Poids vif (kg) : ex. 120.
5. Prix d’achat : ex. 150000.
6. Numéro de tag : valeur unique (ex. TAG-RECETTE-001).
7. Notes : optionnel.
8. Appuyer sur Enregistrer / bouton de validation du formulaire.
Résultat attendu
• Message de succès. 
• L’animal est disponible pour l’abattage (étape C3).
OK
KO
Remarques
☐
☐
Tag utilisé : _________

C3 — Enregistrer un abattage et des distributions


Ouvrir
Menu ☰ → Abattage → Enregistrer Abattage ou depuis C4 bouton Nouvel abattage
Prérequis
B4 effectué (fournisseur lié à la boucherie cible)
Actions à réaliser — Bloc abattage
1. Animal : sélectionner l’animal créé en C2 (espèce · tag).
2. Date d’abattage : date du jour.
3. Poids par catégorie : pour chaque catégorie affichée (viande, peau, etc.), saisir un poids en kg (ex. viande 80, peau 10 — adapter selon les catégories proposées).
4. Vérifier le total carcasse affiché.
5. Notes : optionnel.
Actions à réaliser — Bloc distribution
6. Descendre jusqu’à la section Distribution.
7. Boucherie 1 : choisir la boucherie liée en B4.
8. Pour chaque catégorie listée sous cette boucherie :
o saisir le poids distribué (kg) (≤ poids saisi à l’abattage pour cette catégorie) ; 
o optionnel : prix de vente (FCFA).
9. Si besoin d’une 2ᵉ boucherie : appuyer sur Ajouter une boucherie et répéter (optionnel).
10. Note vocale (optionnel) : appuyer sur enregistrer, parler, arrêter.
11. Appuyer sur Enregistrer l’abattage et les distributions (libellé du bouton principal en bas).
Résultat attendu
• Succès sans message « boucherie non desservie ». 
• Distributions visibles en C4 avec statut en attente.
OK
KO
Remarques
☐
☐


C4 — Liste des distributions (écran Abattage)


Ouvrir
Barre du bas → Abattage
Actions à réaliser
1. Consulter les compteurs en haut (nombre de distributions, poids total).
2. Rechercher : taper un mot (boucherie, produit).
3. Filtrer par statut : En attente / Acceptée / Rejetée.
4. Sur une ligne en attente, appuyer sur Détail → vérifier la fiche abattage.
5. Revenir à la liste.
Résultat attendu
• La distribution créée en C3 apparaît. 
• Le détail abattage affiche animal, poids, distributions, audio si enregistré.
OK
KO
Remarques
☐
☐


C5 — Annuler une distribution


Ouvrir
Barre du bas → Abattage (liste)
Actions à réaliser
1. Repérer une distribution au statut en attente (pas encore réceptionnée par le boucher).
2. Appuyer sur Annuler (icône croix rouge).
3. Confirmer si une boîte de dialogue apparaît.
4. Actualiser le filtre : la ligne doit être annulée ou disparaître du filtre « en attente ».
Résultat attendu
• Distribution annulée ; le boucher ne pourra plus la réceptionner.
OK
KO
Remarques
☐
☐

Pour le parcours complet : refaire C3 si vous avez annulé la seule distribution de test.

C6 — Liste des versements et validation


Ouvrir
Barre du bas → Paiements
Actions à réaliser — Consulter
1. Parcourir la liste : date, boucherie, montant, mode, référence, statut.
2. Repérer un versement en attente créé par le boucher (étape D10).
Actions à réaliser — Valider
3. Sur ce versement en attente, appuyer sur Valider.
4. Vérifier que le statut passe à validé.
Actions à réaliser — Rejeter (autre ligne ou nouveau test)
5. Sur un autre versement en attente (ou après nouveau versement boucher), appuyer sur Rejeter.
6. Saisir un motif si demandé.
7. Vérifier le statut rejeté.
Résultat attendu
• Le fournisseur peut valider ou rejeter les paiements reçus de la boucherie.
OK
KO
Remarques
☐
☐


C7 — Rapport financier (fournisseur)


Ouvrir
Barre du bas → Rapports
Actions à réaliser
1. Changer la période (7 j / 30 j / 12 mois).
2. Lire Abattages (nombre, poids, rendement).
3. Lire Versements : en attente, validés, rejetés, total dû, total perçu.
Résultat attendu
• Chiffres cohérents avec C6 et l’activité du jour.
OK
KO
Remarques
☐
☐


Fin tests Fournisseur → A4 Déconnexion.

PARTIE D — Boucher
Connectez-vous avec test@gmail.com / test1234.

D1 — Vérifier les menus accessibles
Actions à réaliser
1. Menu ☰ : vérifier Gestion des stocks, Ventes, Versements.
2. Vérifier l’absence de Achat d’animaux et Enregistrer Abattage.
3. Barre du bas : Accueil, Stock, Ventes, Paiements, Rapports.
OK
KO
Remarques
☐
☐


D2 — État des stocks


Ouvrir
Barre du bas → Stock ou Menu ☰ → État des Stocks
Actions à réaliser
1. Consulter les cartes (valeur totale, alertes).
2. Filtrer par nom de produit (champ recherche).
3. Parcourir le tableau : produit, quantité, seuil, statut.
Résultat attendu
• Stocks visibles ; produits en alerte signalés.
OK
KO
Remarques
☐
☐


D3 — Réceptionner une distribution


Ouvrir
Menu ☰ → Gestion des stocks → Réception de Viande
Prérequis
Distribution en attente créée par le fournisseur (C3), non annulée (C5)
Actions à réaliser
1. Distribution : sélectionner dans la liste une ligne (date · kg · produit).
2. Quantité reçue : saisir le poids réellement reçu (ex. égal à la quantité distribuée).
3. Date de réception : date du jour.
4. Notes : optionnel.
5. Audio (optionnel) : enregistrer une note vocale.
6. Enregistrer.
Résultat attendu
• Message de succès. 
• Le stock du produit augmente (vérifiable en D2).
OK
KO
Remarques
☐
☐


D4 — Déclaration / ajustement de stock


Ouvrir
Menu ☰ → Déclaration de Stock
Actions à réaliser
1. Stock : choisir un produit dans la liste.
2. Type de mouvement : Ajustement (ou Entrée / Sortie).
3. Quantité : petite valeur positive (ex. 0.5 kg).
4. Motif : ex. Inventaire recette mobile.
5. Enregistrer.
Résultat attendu
• Succès ; quantité mise à jour en D2.
OK
KO
Remarques
☐
☐


D5 — Journal de stock


Ouvrir
Menu ☰ → Journal de Stock
Actions à réaliser
1. Stock : sélectionner le même produit qu’en D4.
2. Consulter la liste des mouvements (dates, types, quantités).
Résultat attendu
• Au moins le mouvement de réception (D3) et/ou l’ajustement (D4) apparaissent.
OK
KO
Remarques
☐
☐


D6 — Enregistrer une vente au comptoir


Ouvrir
Barre du bas → Ventes
Actions à réaliser
1. Date : aujourd’hui.
2. Type de vente : Comptoir.
3. Client : optionnel — choisir un client ou laisser vide.
4. Produit : choisir un produit ayant du stock suffisant.
5. Vérifier que le prix unitaire se remplit (modifiable).
6. Quantité vendue : ex. 2 kg (reste ≤ stock disponible).
7. Vérifier le total affiché.
8. Notes : optionnel.
9. Enregistrer.
Résultat attendu
• Vente créée ; stock diminué.
OK
KO
Remarques
☐
☐


D7 — Enregistrer une vente en livraison


Ouvrir
Barre du bas → Ventes
Actions à réaliser
1. Remplir comme D6 mais Type de vente : Livraison.
2. Choisir un client (obligatoire pour livraison).
3. Renseigner Adresse de livraison (ex. Quartier Test, rue 12).
4. Date prévue : date future ou du jour.
5. Enregistrer.
Résultat attendu
• Vente + livraison créées sans erreur de validation.
OK
KO
Remarques
☐
☐


D8 — Liste des ventes et changement de statut


Ouvrir
Menu ☰ → Ventes → Liste des Ventes
Actions à réaliser
1. Filtrer par dates (du / au) si besoin.
2. Filtrer par type ou statut.
3. Repérer une vente récente (D6 ou D7).
4. Appuyer sur Payée → vérifier le changement de statut.
5. Sur une autre vente de test, appuyer sur Annuler (si métier autorisé).
Résultat attendu
• Liste à jour ; statuts modifiables.
OK
KO
Remarques
☐
☐


D9 — Enregistrer un versement au fournisseur


Ouvrir
Barre du bas → Paiements
Actions à réaliser
1. Fournisseur : si un fournisseur est assigné à la boucherie, son nom s’affiche en lecture seule ; sinon choisir dans la liste.
2. Montant : ex. 50000 FCFA.
3. Mode de paiement : ex. Mobile money / Espèces.
4. Date : aujourd’hui.
5. Référence : ex. VIR-RECETTE-001 (unique).
6. Notes : optionnel.
7. Audio : optionnel.
8. Enregistrer.
Résultat attendu
• Versement créé en statut en attente (visible côté fournisseur en C6).
OK
KO
Remarques
☐
☐
Référence : _________

D10 — Liste des versements (boucher)


Ouvrir
Menu ☰ → Versements → Liste des Versements
Actions à réaliser
1. Trouver le versement D9 dans la liste.
2. Vérifier montant, date, statut en attente.
Résultat attendu
• Historique des versements envoyés visible.
OK
KO
Remarques
☐
☐


D11 — Rapports boucher


Ouvrir
Barre du bas → Rapports puis Menu ☰ pour stocks/financier
Actions à réaliser
1. Rapport de ventes : période + filtres (comme B7).
2. Rapport de stocks : recherche + alertes (comme B8).
3. Rapport financier : versements (comme B9).
Résultat attendu
• Données alignées avec ventes et stocks réels du compte boucher.
OK
KO
Remarques
☐
☐


Fin tests Boucher → A4 Déconnexion.

PARTIE E — Parcours métier complet (recette finale)
À exécuter dans l’ordre, idéalement sur une demi-journée, avec les trois comptes.
Étape
Profil
Réf.
Action résumée
OK
KO
1
Admin
B4, B6
Boucherie OK + fournisseur ali@test.com lié à cette boucherie
☐
☐
2
Fournisseur
C2
Achat animal tag unique
☐
☐
3
Fournisseur
C3
Abattage + distribution vers la boucherie
☐
☐
4
Boucher
D3
Réception de la distribution
☐
☐
5
Boucher
D6
Vente d’au moins 1 kg
☐
☐
6
Boucher
D9
Versement au fournisseur
☐
☐
7
Fournisseur
C6
Valider le versement
☐
☐
8
Tous
A7, C7, D11
Vérifier tableaux de bord et rapports
☐
☐

PARTIE F — Synthèse et retour
Domaine
Nb tests
OK
KO
Commun (A)
7


Administrateur (B)
9


Fournisseur (C)
7


Boucher (D)
11


Parcours E2E (E)
8 étapes


Verdict : ☐ Accepté ☐ Accepté avec réserves ☐ Refusé
Remarques générales :


Client
Date
Signature




Annexe — Remontée d’anomalie
Pour chaque problème :
1. Profil (admin / fournisseur / boucher)
2. Écran (ex. « Réception de viande »)
3. Numéros des actions réalisées dans ce guide
4. Message d’erreur exact ou capture d’écran
5. Modèle du téléphone + version Android

MeatMaster v1.2.0 — Recette mobile client — Confidentiel

