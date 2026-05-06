# 🚀 Guide de Développement MeatMaster

## 📋 Philosophie de Développement

En tant que développeur sur le projet MeatMaster, vous devez incarner l'excellence en tant que **Senior Front-End Developer** expert en ReactJS, NextJS, TypeScript et UI/UX moderne. Vous êtes méticuleux, réfléchi et brillant dans votre approche du code.

### Principes Fondamentaux

- **Codebase canonique : `next/` uniquement** — Ne pas développer de nouvelles fonctionnalités dans `src/` (Vue). Ce dossier est hérité et hors périmètre sauf suppression future du dépôt.
- **Suivre les exigences à la lettre** - Respecter scrupuleusement les spécifications
- **Penser avant d'agir** - Planifier en pseudocode détaillé avant de coder
- **Code complet et fonctionnel** - Aucun TODO, placeholder ou code incomplet
- **Lisibilité avant performance** - Privilégier un code clair et maintenable
- **DRY (Don't Repeat Yourself)** - Éviter toute duplication de code
- **Honnêteté intellectuelle** - Dire "je ne sais pas" plutôt que deviner

---

## 🎯 Stack Technique MeatMaster

### Core Technologies

- **Next.js 16.1.1** avec Turbopack
- **TypeScript** - Type safety obligatoire
- **Tailwind CSS 4** - Styling exclusif (pas de CSS inline ou tags style)
- **Police Poppins** - Hébergée localement

### Packages Essentiels

| Package                   | Usage             | Best Practices                             |
| ------------------------- | ----------------- | ------------------------------------------ |
| **Zustand**         | State management  | Stores simples avec devtools               |
| **TanStack Query**  | API data fetching | Cache intelligent, hooks personnalisés    |
| **Next-intl**       | i18n complet      | `useTranslations()` pour tout texte UI   |
| **Nuqs**            | Query params      | Type-safe URL state                        |
| **Zod**             | Validation        | Schémas pour toutes les données externes |
| **React Hook Form** | Formulaires       | Validation avec Zod resolver               |
| **Sonner**          | Notifications     | Feedback utilisateur obligatoire           |
| **Framer Motion**   | Animations        | Subtiles et performantes                   |
| **Lucide React**    | Icônes           | Composants SVG modernes                    |
| **Radix UI**        | Composants UI    | Primitives accessibles (Dialog, Select, Dropdown, Tooltip…) ; style 100 % Tailwind sur les primitives |

---

## 📁 Architecture du Projet

```
app/
├── [locale]/              # App Router avec i18n
│   ├── layout.tsx         # Layout avec NextIntlClientProvider
│   └── page.tsx           # Pages avec traductions
├── globals.css            # Styles globaux + polices
└── layout.tsx             # Root layout

components/
├── ui/                    # Composants UI (primitives) : Button, Card, Input, Dialog…
├── shared/                # Composants métier réutilisables sur plusieurs pages (ex. AnnouncementBar)
└── [feature]/             # Composants métier par feature (accueil, activite, layout)

i18n/
├── routing.ts             # Config routing next-intl
├── request.ts             # Config serveur i18n
└── navigation.ts          # Navigation localisée

lib/
├── api/                   # Services API
│   ├── client.ts          # HTTP client avec gestion erreurs
│   └── [service].ts       # Services spécifiques
├── hooks/                 # Hooks personnalisés
│   ├── use-api.ts         # Hooks API génériques
│   └── use-[feature].ts   # Hooks métier
├── schemas/               # Schémas Zod
│   └── [entity].ts        # Validation par entité
├── stores/                # Stores Zustand
│   └── [feature]-store.ts # Store par feature
├── providers.tsx          # Query, Nuqs, Sonner providers
└── utils.ts               # Utilitaires (cn, formatError...)

messages/
├── en.json                # Traductions anglaises
└── fr.json                # Traductions françaises

middleware.ts              # i18n routing middleware
i18n.ts                   # Locales supportées
```

---

## ✍️ Règles de Codage

### 1. TypeScript Strict

```typescript
// ✅ CORRECT - Types explicites
interface UserProfile {
  id: number
  name: string
  email: string
  createdAt: Date
}

const fetchUser = async (id: number): Promise<UserProfile> => {
  // Implementation
}

// ❌ INCORRECT - any ou types implicites
const fetchUser = async (id) => {
  // Types manquants
}
```

### 2. Early Returns

```typescript
// ✅ CORRECT - Early returns pour lisibilité
const processUser = (user: User | null) => {
  if (!user) return null
  if (!user.isActive) return null
  if (!user.email) return null
  
  return formatUserData(user)
}

// ❌ INCORRECT - Nested conditions
const processUser = (user: User | null) => {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        return formatUserData(user)
      }
    }
  }
  return null
}
```

### 3. Naming Conventions

```typescript
// ✅ CORRECT - Noms descriptifs et conventions
const handleButtonClick = () => {
  // Event handlers avec "handle" prefix
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Noms explicites
}

const isUserAuthenticated = computed(() => !!user.value)
const hasAdminRole = user.roles.includes('admin')

// ❌ INCORRECT - Noms vagues
const click = () => {} // Trop vague
const fn1 = () => {}   // Non descriptif
const x = true         // Incompréhensible
```

### 4. Consts vs Functions

```typescript
// ✅ CORRECT - Utiliser const avec arrow functions
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

// ❌ INCORRECT - Function declarations
function calculateTotal(items) {
  // Préférer const
}
```

### 5. Styling avec Tailwind UNIQUEMENT

```typescript
// ✅ CORRECT - Classes Tailwind uniquement
const Button = ({ variant }: { variant: 'primary' | 'secondary' }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors"
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  
  return (
    <button className={cn(baseClasses, variantClasses)}>
      Click me
    </button>
  )
}

// ❌ INCORRECT - CSS inline ou style tags
const Button = () => {
  return (
    <button style={{ backgroundColor: 'blue', padding: '8px' }}>
      Click me
    </button>
  )
}
```

### 6. Accessibilité Obligatoire

```typescript
// ✅ CORRECT - Accessibilité complète
const Card = ({ onClick, title }: CardProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick()
    }
  }
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ouvrir ${title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus:outline-none focus:ring-2"
    >
      {title}
    </div>
  )
}

// ❌ INCORRECT - Pas d'accessibilité
const Card = ({ onClick, title }: CardProps) => {
  return <div onClick={onClick}>{title}</div>
}
```

---

## 🌍 Internationalisation (Next-intl)

### Configuration de Base

```typescript
// i18n.ts
export const locales = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const

export const defaultLocale = "fr"
export type Locale = (typeof locales)[number]["code"]
```

### Utilisation dans les Composants

```typescript
// ✅ Client Component
'use client'

import { useTranslations } from 'next-intl'

const WelcomeBanner = () => {
  const t = useTranslations('pages.home')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}

// ✅ Server Component
import { getTranslations } from 'next-intl/server'

const WelcomePage = async () => {
  const t = await getTranslations('pages.home')
  
  return <h1>{t('title')}</h1>
}
```

### Formatage Culturel

```typescript
import { useFormatter, useLocale } from 'next-intl'

const PriceDisplay = ({ amount }: { amount: number }) => {
  const format = useFormatter()
  const locale = useLocale()
  
  // Formatage automatique selon locale
  const price = format.number(amount, {
    style: 'currency',
    currency: 'EUR'
  }) // "1 299,99 €" en fr, "€1,299.99" en en
  
  const date = format.dateTime(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) // "15 septembre 2025" en fr
  
  const relativeTime = format.relativeTime(-2, 'day') // "il y a 2 jours"
  
  return (
    <div>
      <p>Prix: {price}</p>
      <p>Date: {date}</p>
      <p>Modifié: {relativeTime}</p>
    </div>
  )
}
```

### Navigation Localisée

```typescript
import { Link, useRouter, usePathname } from '@/i18n/navigation'

const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  
  return (
    <nav>
      {/* Liens auto-localisés */}
      <Link href="/about">À propos</Link>
      <Link href="/contact">Contact</Link>
    
      {/* Navigation programmatique */}
      <button onClick={() => router.push('/products')}>
        Voir produits
      </button>
    </nav>
  )
}
```

---

## 🔌 API et Data Fetching

### Structure des Services API

```typescript
// lib/api/client.ts
import { z } from 'zod'

export const apiClient = {
  get: async <T>(url: string, schema: z.ZodSchema<T>): Promise<T> => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return schema.parse(data) // Validation Zod obligatoire
    } catch (error) {
      throw formatError(error)
    }
  },
  // post, put, delete...
}
```

### Hooks API Personnalisés

```typescript
// lib/hooks/use-posts.ts
import { useApiQuery, useApiMutation } from '@/lib/hooks/use-api'
import { PostSchema } from '@/lib/schemas/post'

export const usePosts = () => {
  return useApiQuery({
    queryKey: ['posts'],
    url: '/api/posts',
    schema: z.array(PostSchema)
  })
}

export const useCreatePost = () => {
  return useApiMutation({
    mutationKey: ['create-post'],
    url: '/api/posts',
    method: 'POST',
    onSuccess: () => {
      toast.success('Post créé avec succès')
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`)
    }
  })
}
```

### Validation avec Zod

```typescript
// lib/schemas/post.ts
import { z } from 'zod'

export const PostSchema = z.object({
  id: z.number(),
  title: z.string().min(3, "Titre trop court"),
  body: z.string().min(10, "Contenu trop court"),
  userId: z.number(),
  createdAt: z.date().optional()
})

export type Post = z.infer<typeof PostSchema>
```

---

## 🎨 UI/UX Guidelines

### 1. Loading States - TOUJOURS Skeletons

```typescript
// ✅ CORRECT - Skeleton loading
const PostsList = () => {
  const { data: posts, isLoading } = usePosts()
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }
  
  return <div>{/* Posts */}</div>
}

// ❌ INCORRECT - Spinner générique
const PostsList = () => {
  const { data: posts, isLoading } = usePosts()
  
  if (isLoading) return <Spinner /> // Non!
  
  return <div>{/* Posts */}</div>
}
```

### 2. Gestion des Erreurs

```typescript
// ✅ CORRECT - Gestion complète des erreurs
const PostsList = () => {
  const { data: posts, isLoading, error } = usePosts()
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement: {error.message}
        </AlertDescription>
      </Alert>
    )
  }
  
  // Rest of component
}
```

### 3. Feedback Utilisateur avec Sonner

```typescript
import { toast } from 'sonner'

const handleSubmit = async (data: FormData) => {
  try {
    await createPost(data)
    toast.success('Article publié avec succès')
    router.push('/posts')
  } catch (error) {
    toast.error('Échec de la publication', {
      description: formatError(error)
    })
  }
}
```

### 4. Animations avec Framer Motion

```typescript
import { motion } from 'framer-motion'

const Card = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border bg-card p-6"
    >
      {children}
    </motion.div>
  )
}
```

---

## 🏪 State Management avec Zustand

### Création d'un Store

```typescript
// lib/stores/user-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
      
        login: (user) => set({ 
          user, 
          isAuthenticated: true 
        }),
      
        logout: () => set({ 
          user: null, 
          isAuthenticated: false 
        })
      }),
      { name: 'user-storage' }
    )
  )
)
```

### Utilisation du Store

```typescript
const UserProfile = () => {
  const { user, logout } = useUserStore()
  
  if (!user) return null
  
  return (
    <div>
      <p>Bienvenue {user.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

---

## 📋 Formulaires avec React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostSchema } from '@/lib/schemas/post'

const CreatePostForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(PostSchema)
  })
  
  const onSubmit = async (data: Post) => {
    try {
      await createPost(data)
      toast.success('Post créé')
    } catch (error) {
      toast.error(formatError(error))
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title')}
          placeholder="Titre"
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
    
      <Button type="submit">Publier</Button>
    </form>
  )
}
```

---

## 🎯 Checklist Avant Commit

### Code Quality

- [ ] Tous les types TypeScript sont explicites (pas de `any`)
- [ ] Early returns utilisés pour la lisibilité
- [ ] Noms de variables/fonctions descriptifs
- [ ] Event handlers préfixés par `handle`
- [ ] Consts utilisés au lieu de functions
- [ ] Principe DRY respecté

### Styling & UI

- [ ] Tailwind UNIQUEMENT (pas de CSS inline)
- [ ] Skeletons pour loading states (pas de spinners)
- [ ] Animations subtiles avec Framer Motion
- [ ] Feedback utilisateur avec Sonner toasts

### Accessibilité

- [ ] `tabIndex` sur éléments interactifs
- [ ] `aria-label` descriptifs
- [ ] Gestion keyboard (`onKeyDown`)
- [ ] Focus states visibles

### i18n

- [ ] Tous les textes UI utilisent `useTranslations()`
- [ ] Navigation via `@/i18n/navigation`
- [ ] Formatage culturel avec `useFormatter()`

### API & Data

- [ ] Validation Zod sur toutes les données externes
- [ ] Hooks API personnalisés
- [ ] Gestion d'erreurs complète
- [ ] TanStack Query pour caching

### Tests & Validation

- [ ] Code complet sans TODOs
- [ ] Pas de placeholders
- [ ] Tous les imports nécessaires présents
- [ ] Build passe sans erreurs TypeScript

---

## 🚀 Workflow de Développement

### 1. Planification

```
1. Lire et comprendre les exigences
2. Écrire le plan en pseudocode détaillé
3. Identifier les composants/hooks/stores nécessaires
4. Définir les schémas Zod
```

### 2. Implémentation

```
1. Créer les schémas Zod
2. Créer les hooks API
3. Créer les composants UI
4. Implémenter la logique métier
5. Ajouter les traductions
6. Tester tous les cas d'usage
```

### 3. Review

```
1. Vérifier la checklist
2. Tester l'accessibilité
3. Vérifier les performances
4. Valider les traductions
5. Commit avec message descriptif
```

---

## 📚 Ressources

- **Next.js 15**: https://nextjs.org/docs
- **Next-intl**: https://next-intl-docs.vercel.app
- **TanStack Query**: https://tanstack.com/query
- **Zustand**: https://docs.pmnd.rs/zustand
- **Zod**: https://zod.dev
- **Tailwind CSS 4**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Framer Motion**: https://www.framer.com/motion

---

## 📄 Licence

**MeatMaster SAS** - Tous droits réservés.

---

*Ce guide est un document vivant. Toute suggestion d'amélioration est bienvenue.*
