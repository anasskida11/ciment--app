# Structure du Frontend

## Organisation par Modules (Features)

```
frontend/
├── app/                    # Pages Next.js (routing)
│   ├── (auth)/             # Routes d'authentification
│   ├── (cashier)/          # Interface Caissier Vente
│   ├── (stock)/            # Interface Gestionnaire Stock
│   ├── (fleet)/            # Interface Gestionnaire Trucks
│   ├── (accounting)/       # Interface Gestionnaire Comptabilité
│   ├── (director)/         # Interface Directeur
│   └── layout.tsx
│
├── features/               # Modules par fonctionnalité
│   ├── auth/               # Authentification
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── services/
│   │
│   ├── clients/            # Gestion des clients
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── services/
│   │
│   ├── products/           # Gestion des produits
│   ├── orders/              # Gestion des commandes
│   ├── quotes/              # Gestion des devis
│   ├── invoices/            # Gestion des factures
│   ├── stock/               # Gestion du stock
│   ├── trucks/              # Gestion des véhicules
│   ├── accounts/            # Gestion des comptes
│   ├── transactions/        # Gestion des transactions
│   └── suppliers/           # Gestion des fournisseurs
│
├── shared/                  # Code partagé
│   ├── components/          # Composants UI réutilisables
│   │   ├── ui/             # Composants shadcn/ui
│   │   ├── layout/         # Layout components
│   │   └── common/         # Composants communs
│   ├── hooks/              # Hooks réutilisables
│   ├── utils/              # Utilitaires
│   ├── types/              # Types partagés
│   └── constants/          # Constantes
│
├── lib/                     # Configuration globale
│   ├── api/                # Client API
│   ├── config/             # Configuration
│   └── utils/              # Utilitaires globaux
│
└── styles/                  # Styles globaux
```

## Principes

1. **Séparation des responsabilités** : Chaque module est autonome
2. **Composants petits** : Un composant = une responsabilité
3. **Hooks personnalisés** : Logique métier dans les hooks
4. **Types centralisés** : Types dans chaque module
5. **Services API** : Un service par domaine
