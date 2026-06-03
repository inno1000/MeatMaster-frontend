# Mode simplifié — flux validés (v1)

## Boucher

1. **Vente comptoir** — `/vente/enregistrer` (wizard : type → produit → quantité/prix → confirmer)
2. **Versement** — `/versement/enregistrer` (wizard : montant → mode → confirmer)
3. **Réception stock** — `/stock/reception` (navigation uniquement ; formulaire standard pour v1)

## Fournisseur

1. **Abattage** — `/abattage/enregistrer` (wizard : animal → poids par catégorie → distribution par boucherie → confirmer)
2. **Versements** — `/versement/liste` (cartes + Accepter / Refuser)
3. **Achat animal** — `/abattage/achats` (navigation ; formulaire standard pour v1)

L’administrateur n’active pas le mode simplifié (interface complète conservée).
