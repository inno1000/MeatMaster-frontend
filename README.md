# MeatMaster — Frontend

Application web de suivi de la distribution de viande pour les boucheries.

## Application active : Next.js

Tout le développement produit se fait dans le dossier **[`next/`](next/)** (Next.js App Router, Tailwind CSS 4, next-intl, TanStack Query, Zustand).

Le dossier **`src/`** à la racine correspond à l’ancienne application **Vue 3 / Vite / Vuetify** : elle **n’est plus maintenue**. Elle peut être supprimée du dépôt lorsque vous validerez que la migration vers Next.js est terminée.

## Démarrage rapide

Prérequis : **Node.js 20+**.

```bash
cd next
npm install
npm run dev
```

Depuis la **racine** du dépôt, après installation des dépendances dans `next/` :

```bash
npm install --prefix next
npm run dev
```

Les scripts racine **`dev`**, **`build`**, **`start`** et **`lint`** délèguent à l’application dans `next/`.

## Documentation

| Fichier | Contenu |
|--------|---------|
| [`next/README.md`](next/README.md) | Scripts, `.env`, routes `/fr` · `/en`, stack technique |
| [`cursorrules-frontend-nextjs.md`](cursorrules-frontend-nextjs.md) | Guide de développement Next.js (MeatMaster) |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Vue d’ensemble technique (cible Next.js) |

## Ancienne app Vue (local uniquement)

Si vous devez encore lancer l’UI historique :

```bash
npm run vue:dev
```

Le build Capacitor historique pointe vers `dist/` (sortie Vite). Un futur empaquetage mobile devra cibler la sortie Next.js (ex. `next/out` avec export statique) — voir la section Capacitor dans `next/README.md`.

---

*Le dépôt s’appuie historiquement sur le template [Berry Free Vue](https://github.com/codedthemes/berry-free-vue-admin-template) (MIT) pour la partie `src/` héritée.*
