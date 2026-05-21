# MeatMaster — Frontend

Application de suivi de la distribution de viande pour les boucheries (Next.js + Capacitor Android).

## Structure

| Dossier / fichier | Rôle |
|-------------------|------|
| `src/` | Code Next.js (App Router, composants, API client) |
| `public/` | Assets statiques |
| `messages/` | Traductions (fr, en, ar) |
| `android/` | Projet Capacitor Android (WebView → `out/`) |
| `scripts/` | Utilitaires (branding Android, tests API) |
| `docs/` | Spécifications (ex. `API-SPEC.md`) |

## Prérequis

- Node.js **20+**
- Backend Laravel : définir `NEXT_PUBLIC_API_URL` (voir `.env.local.example`)

## Installation

```bash
npm install
cp .env.local.example .env.local   # puis renseigner l’URL de l’API
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build statique → dossier `out/` |
| `npm run lint` | ESLint |
| `npm run build:mobile` | Build + `cap sync android` |
| `npm run android:assemble` | APK debug |
| `npm run mobile:android:branding` | Splash / icônes depuis `public/logo.svg` |

## URLs

Routes préfixées par locale : **`/fr/...`**, **`/en/...`**, **`/ar/...`** (défaut : français). La locale `ar` active le RTL.

- Connexion : `/fr/auth/login`
- Tableau de bord : `/fr/dashboard`

## Authentification

Jeton **Sanctum** stocké via Zustand (`localStorage`). Routes `(main)` protégées par `AuthGuard`.  
Rôles UI : `admin`, `butcher`, `supplier` (mappés depuis `admin`, `boucher`, `fournisseur` côté API).

## Client API

- `import { boucherieV1, apiLogin } from "@/lib/api"`
- Préfixe par défaut : `/api/v1` (`NEXT_PUBLIC_API_PREFIX`)

## Mobile (Capacitor)

- Config : `capacitor.config.ts` — `webDir: "out"`
- Build : `npm run build:mobile`
- WebView : schéma `https` pour Android

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/API-SPEC.md`](docs/API-SPEC.md) | Contrat API |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Vue d’ensemble fonctionnelle |
| [`cursorrules-frontend-nextjs.md`](cursorrules-frontend-nextjs.md) | Guide de développement |
