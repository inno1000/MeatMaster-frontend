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
| `npm run android:sync` | Alias de `build:mobile` (à lancer avant Android Studio) |
| `npm run android:assemble` | APK debug |
| `npm run android:assemble:release` | APK release (API Render via `.env.production`) |
| `npm run mobile:android:branding` | Splash / icônes depuis `public/logo-app.png` |

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

### Android Studio (important)

L’APK ne doit **pas** être lancé depuis Android Studio sans synchroniser le web avant :

```bash
npm run android:sync
```

Puis **Build → Rebuild Project** dans Android Studio, ou préférer :

```bash
npm run android:assemble:release
```

Sans `android:sync`, l’app Capacitor tourne sur `https://localhost` et les appels API partent vers **localhost** au lieu de Render.

`CapacitorHttp` est activé dans `capacitor.config.ts` pour que `fetch` passe par le client HTTP natif (pas de blocage CORS WebView).

- Prod : `.env.production` → `https://boucherie-api.onrender.com`
- Dev local (émulateur) : `.env.local` avec `NEXT_PUBLIC_API_URL=http://10.0.2.2:8000` puis `npm run android:sync`

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/API-SPEC.md`](docs/API-SPEC.md) | Contrat API |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Vue d’ensemble fonctionnelle |
| [`cursorrules-frontend-nextjs.md`](cursorrules-frontend-nextjs.md) | Guide de développement |
