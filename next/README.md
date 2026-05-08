# MeatMaster — frontend Next.js

Application **canonique** du dépôt : tout le développement MeatMaster se fait ici (App Router). L’ancienne application Vue dans `src/` à la racine n’est plus la référence ; voir le `README.md` à la racine du dépôt.

## Données

**Connexion, inscription, déconnexion** et **liste / création des boucheries** passent uniquement par l’API (`/api/v1`) : définir **`NEXT_PUBLIC_API_URL`** (voir `.env.local.example`). Sans cette variable, la connexion échoue et la liste des boucheries affiche un message de configuration. Les **autres écrans** (stock, ventes, abattages, admin démo, etc.) utilisent encore des mocks ou des placeholders jusqu’à branchement ultérieur.

## Prérequis

- Node.js 20+
- Backend : copier `next/.env.local.example` → `.env.local` et définir `NEXT_PUBLIC_API_URL` (ex. `https://boucherie-api.onrender.com`) pour l’auth et les boucheries.

## Installation

À la racine du dépôt, après `npm install` dans ce dossier, vous pouvez aussi utiliser `npm run dev` depuis la racine (scripts délégués à `next/`).

```bash
cd next
npm install
```

Créer `next/.env.local` à partir de `.env.local.example` et renseigner l’URL de l’API.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (**export statique** → dossier `out/`, pour Web / Capacitor) |
| `npm run start` | Non utilisé avec `output: "export"` ; prévisualiser `out/` avec `npx serve out` si besoin |
| `npm run lint` | ESLint |

## URLs

Les routes sont préfixées par la locale : **`/fr/...`**, **`/en/...`** et **`/ar/...`** (par défaut : français). La locale **`ar`** active le sens **RTL** et une police arabe (Noto Sans Arabic).

- Connexion : `/fr/auth/login` · `/ar/auth/login`
- Tableau de bord (protégé) : `/fr/dashboard`

## Authentification

Le jeton **Sanctum** (`token` Laravel) est stocké via **Zustand** (`persist` / `localStorage`). Les routes sous `(main)` sont protégées par `AuthGuard`.  
Rôles API : **`boucher`** → `butcher` ; **`caissier`** (ou équivalent) → **`supplier`** (fournisseur : ventes + périmètre abattages / rapports, voir `authz.ts`). **`supplier`** est le seul rôle UI pour ce métier — il n’y a plus de `caissier` dans le state client.

## Client API (`/api/v1`)

- Point d’entrée : `import { boucherieV1, isApiEnabled, apiLogin } from "@/lib/api"`.
- Toutes les ressources documentées côté Laravel sont exposées sur l’objet **`boucherieV1`** (`referentiels`, `boucheries`, `users`, `fournisseurs`, `clients`, `produits`, `achatsFournisseurs`, `animaux`, `abattages`, `stocks`, `ventes`).
- Le module **`apiClient`** (`GET` / `POST` / `PUT` / `PATCH` / `DELETE`) ajoute `Authorization: Bearer` et gère les erreurs **422** Laravel (`errors`).

## Stack (guide projet)

Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, next-intl, TanStack Query, Zustand, Zod, React Hook Form, Sonner, Framer Motion, Radix UI, Lucide.

## Capacitor Android

Configuration à la **racine du dépôt** : `capacitor.config.ts` avec `webDir: "next/out"` (sortie de `next build` avec export statique).

1. Depuis la racine : `npm run build:mobile` — build Next + `cap sync android`.
2. APK debug : `npm run android:assemble` (nécessite JDK et Android SDK ; Gradle dans `android/`).
3. L’entrée `/` redirige vers `/fr` (le middleware next-intl n’est pas compatible avec l’export statique).

WebView : schéma `https` activé pour éviter des blocages API futures.
