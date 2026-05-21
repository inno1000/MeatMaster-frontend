# Architecture — MeatMaster (frontend Next.js)

> **Frontend :** Next.js 16 à la racine du dépôt (App Router, React 19, Tailwind 4, next-intl) + empaquetage mobile **`android/`** (Capacitor, WebView sur `out/`).

## Diagramme d’ensemble

```mermaid
graph TB
    subgraph "Frontend — Next.js (racine)"
        A[Tableau de bord] --> B[Gestion des stocks]
        A --> C[Ventes]
        A --> D[Versements]
        A --> E[Rapports]

        B --> B1[Réception]
        B --> B2[État des stocks]
        B --> B3[Journal]
        B --> B4[Déclaration]

        C --> C1[Enregistrer vente]
        C --> C2[Liste des ventes]

        D --> D1[Enregistrer versement]
        D --> D2[Liste des versements]

        E --> E1[Rapport ventes]
        E --> E2[Rapport stocks]
        E --> E3[Rapport financier]
    end

    subgraph "Fonctionnalités clés"
        F[Calculs automatiques]
        G[Upload fichiers / photos]
        H[Messages vocaux]
        I[Alertes stock]
        J[Validation versements]
    end

    subgraph "Backend — Laravel à intégrer"
        K[API REST]
        L[Base de données]
        M[Stockage fichiers]
        N[Auth JWT]
    end

    A --> F
    B1 --> G
    B1 --> H
    B2 --> I
    D1 --> J

    F --> K
    G --> M
    H --> K
    I --> L
    J --> N
```

## Structure des composants (Next.js)

```mermaid
graph LR
    subgraph "Pages App Router"
        A["app/.../dashboard"]
        B["app/.../stock/*"]
        C["app/.../vente/*"]
        D["app/.../versement/*"]
        E["app/.../reports/*"]
    end

    subgraph "Composants partagés"
        G[ParentCard]
        H[AudioRecorder]
        I[DashboardShell]
    end

    subgraph "État & données"
        M[auth-store Zustand]
        N[TanStack Query]
    end

    A --> G
    B --> G
    B --> H
    C --> G
    C --> H
    D --> G
    D --> H
    E --> G

    A --> I
    B --> I
    C --> I

    A --> M
    B --> N
```

## Flux de données (cible)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Next.js
    participant A as API
    participant D as Base de données

    U->>F: Saisit une réception
    F->>F: Validation Zod / RHF
    F->>A: HTTP (JSON / multipart)
    A->>D: Persistance
    D-->>A: Confirmation
    A-->>F: Réponse
    F-->>U: Feedback (Sonner)

    U->>F: Consulte les stocks
    F->>A: Requête
    A->>D: Lecture
    D-->>A: Données
    A-->>F: JSON
    F-->>U: UI
```

## Fonctionnalités par module

### Tableau de bord

- Indicateurs et accès rapides
- Activités récentes (mock ou API)

### Stocks

- Réception (évolution prévue : montant total, photos de bordereau)
- État des stocks, journal, déclaration

### Ventes

- Calculs automatiques (quantités × prix)
- Contrôle de stock (règles métier côté API à terme)

### Versements

- Modes de paiement, références
- Workflow validation fournisseur (back-end)

### Rapports

- Filtres par période / type
- Exports PDF/Excel : souvent générés côté serveur

## Technologies (frontend actuel)

| Domaine | Choix |
|--------|--------|
| Framework | Next.js 16, React 19 |
| Langage | TypeScript strict |
| UI | Tailwind CSS 4, Radix UI, composants locaux |
| i18n | next-intl (`/fr`, `/en`) |
| Formulaires | React Hook Form + Zod |
| État client | Zustand (auth persisté) |
| Données serveur | TanStack Query |
| Notifications | Sonner |

### Backend (prévu CdC)

- Laravel, PostgreSQL, fichiers sur stockage sécurisé, JWT.

## Sécurité et performance

- Auth JWT (mock puis API) ; routes protégées côté client (`AuthGuard`)
- HTTPS en production ; chiffrement au repos côté infra
- UI mobile-first, bundles découpés par route App Router

## Évolutivité

- Modules par fonctionnalité sous `src/app/[locale]/(main)/...`
- Client HTTP et schémas dans `src/lib/`
- Intégration progressive avec l’API Laravel sans casser les mocks de développement

---

*Document aligné sur le frontend Next.js ; mise à jour lors du branchement complet sur l’API.*
