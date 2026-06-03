# Mode simplifié — flux validés

Le hub **Aujourd’hui** (`/dashboard`, `GET /api/v1/dashboard/today`) est le point d’entrée pour boucher et fournisseur. Les écrans de saisie sont **toujours** en pas à pas (plus de formulaires complets pour ces rôles).

## Boucher (saisie pas à pas)

1. **Réception** — `/stock/reception` (`ReceptionSimpleFlow` : distribution → quantité → confirmer)
2. **Vente comptoir** — `/vente/enregistrer` (`VenteSimpleFlow`)
3. **Versement** — `/versement/enregistrer` (`VersementSimpleFlow`)

## Fournisseur

1. **Achat animal** — `/abattage/achats` (`AchatSimpleFlow` : espèce → poids → prix → tag)
2. **Abattage** — `/abattage/enregistrer` (`AbattageSimpleFlow`)
3. **Versements** — `/versement/liste` (onglets En attente / Historique + Accepter / Refuser)

L’administrateur conserve l’interface complète (pas de mode simplifié).

## Navigation mobile

- Dock : Accueil + 3 actions (rôle)
- Bouton **Plus** : listes, rapports, profil, réglages
