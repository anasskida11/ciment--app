# Structure du Backend

## Organisation par Modules

```
backend/
├── src/
│   ├── modules/            # Modules par domaine métier
│   │   ├── auth/           # Authentification
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validations.js
│   │   │
│   │   ├── users/          # Gestion des utilisateurs
│   │   ├── clients/        # Gestion des clients
│   │   ├── products/        # Gestion des produits
│   │   ├── orders/          # Gestion des commandes
│   │   ├── stock/           # Gestion du stock
│   │   ├── trucks/          # Gestion des véhicules
│   │   ├── accounts/        # Gestion des comptes
│   │   └── suppliers/       # Gestion des fournisseurs
│   │
│   ├── shared/              # Code partagé
│   │   ├── middleware/     # Middlewares
│   │   ├── utils/          # Utilitaires
│   │   ├── validations/    # Validations partagées
│   │   └── constants/      # Constantes
│   │
│   ├── services/            # Services métier globaux
│   │   ├── notification.service.js
│   │   ├── pdf/
│   │   └── sms/
│   │
│   ├── config/              # Configuration
│   │   ├── database.js
│   │   └── app.js
│   │
│   └── server.js            # Point d'entrée
│
├── prisma/                  # Prisma ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
└── docs/                    # Documentation
```

## Principes

1. **Séparation par domaine** : Chaque module est autonome
2. **Services métier** : Logique métier dans les services
3. **Validations centralisées** : Validations dans chaque module
4. **Middleware réutilisable** : Middlewares dans shared
5. **Configuration centralisée** : Config dans config/
