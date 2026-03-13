# 📐 Architecture du Backend

## Structure des Dossiers

```
backend/
├── src/
│   ├── controllers/          # Logique métier (CRUD)
│   │   ├── auth.controller.js      → Authentification (register, login)
│   │   ├── user.controller.js      → Gestion des utilisateurs
│   │   ├── client.controller.js    → Gestion des clients
│   │   ├── product.controller.js   → Gestion des produits/stock
│   │   └── order.controller.js     → Gestion des commandes
│   │
│   ├── routes/                # Définition des routes API
│   │   ├── auth.routes.js          → /api/auth/*
│   │   ├── user.routes.js          → /api/users/*
│   │   ├── client.routes.js        → /api/clients/*
│   │   ├── product.routes.js       → /api/products/*
│   │   ├── order.routes.js         → /api/orders/*
│   │   └── test.routes.js          → /api/test/*
│   │
│   ├── middleware/            # Middlewares Express
│   │   ├── auth.middleware.js      → Authentification JWT + autorisation
│   │   └── errorHandler.middleware.js → Gestion des erreurs
│   │
│   ├── utils/                 # Fonctions utilitaires
│   │   ├── jwt.util.js             → Génération/vérification tokens
│   │   └── bcrypt.util.js          → Hashage mots de passe
│   │
│   ├── app.js                 # Configuration Express (middlewares, routes)
│   └── server.js              # Point d'entrée (démarrage serveur)
│
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── seed.js                # Script d'initialisation (admin par défaut)
│
├── .env                       # Variables d'environnement (à créer)
├── ENV_EXAMPLE.txt            # Exemple de configuration
├── package.json               # Dépendances et scripts
├── README.md                  # Documentation complète
├── GUIDE_DEMARRAGE.md         # Guide de démarrage rapide
└── ARCHITECTURE.md            # Ce fichier
```

## Flux de Requête

```
Client (Frontend/Mobile)
    ↓
Route (routes/*.routes.js)
    ↓
Middleware d'authentification (si nécessaire)
    ↓
Controller (controllers/*.controller.js)
    ↓
Prisma Client (Base de données)
    ↓
Réponse JSON
```

## Modèles de Données

### User (Utilisateur)
- **Rôles** : ADMIN, CHARGE_CLIENTELE, GESTIONNAIRE_STOCK, GESTIONNAIRE_TRUCKS
- **Relations** : Orders créées, Clients gérés, Notifications

### Client (Client)
- **Relations** : Charge clientèle (User), Commandes (Order)

### Product (Produit)
- **Champs** : nom, description, unité, prix, stock, stock minimum
- **Relations** : OrderItems

### Order (Commande)
- **Statuts** : PENDING, CONFIRMED, IN_PREPARATION, READY, DELIVERED, CANCELLED
- **Relations** : Client, Créateur (User), Items (OrderItem)

### OrderItem (Article de commande)
- **Relations** : Order, Product

### Notification (Préparé)
- **Types** : ORDER_CREATED, ORDER_CONFIRMED, STOCK_LOW, etc.
- **Relations** : User, Order

### Quote & Invoice (Préparés pour PDF)
- Structures prêtes pour génération de devis et factures

## Sécurité

### Authentification JWT
- Token dans le header `Authorization: Bearer <token>`
- Expiration configurable (défaut: 7 jours)
- Secret stocké dans `.env`

### Autorisation par Rôles
- Middleware `authorize()` vérifie les rôles
- Routes protégées selon les permissions

### Sécurité HTTP
- Helmet.js pour les headers de sécurité
- CORS configuré
- Validation des entrées

## Gestion des Erreurs

- Middleware centralisé `errorHandler`
- Format de réponse cohérent :
  ```json
  {
    "success": false,
    "message": "Message d'erreur",
    "error": "Détails (dev uniquement)"
  }
  ```

## Bonnes Pratiques

1. **Séparation des responsabilités**
   - Routes : définition des endpoints
   - Controllers : logique métier
   - Middleware : authentification, validation
   - Utils : fonctions réutilisables

2. **Validation**
   - Validation des données dans les controllers
   - Messages d'erreur clairs

3. **Transactions**
   - Utilisation de `prisma.$transaction()` pour les opérations critiques
   - Exemple : confirmation de commande + décrémentation stock

4. **Code propre**
   - Commentaires explicatifs
   - Noms de variables clairs
   - Structure modulaire

## Points d'Extension

### À implémenter plus tard :
1. **Génération PDF** (devis/factures)
   - Bibliothèque : `pdfkit` ou `puppeteer`
   - Endpoints : `/api/quotes/:id/pdf`, `/api/invoices/:id/pdf`

2. **Système de notifications**
   - WebSockets ou Server-Sent Events
   - Notifications en temps réel

3. **Gestion des camions**
   - Modèle `Truck`
   - Routes pour GESTIONNAIRE_TRUCKS

4. **Upload de fichiers**
   - Images produits
   - Documents clients

5. **Pagination**
   - Pour les listes (clients, produits, commandes)

6. **Recherche et filtres**
   - Recherche de clients
   - Filtres par statut, date, etc.

