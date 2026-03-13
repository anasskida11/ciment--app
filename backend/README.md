# Backend API - Application de Distribution de Ciment

Backend professionnel pour une application hybride (Web + Mobile) de distribution de ciment.

## 🛠️ Tech Stack

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **Prisma ORM** - ORM pour PostgreSQL
- **JWT** - Authentification par tokens
- **bcrypt** - Hashage des mots de passe

## 📁 Structure du Projet

```
backend/
├── src/                 # Code source de l'application
│   ├── controllers/     # Contrôleurs (logique métier)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── client.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   └── ...
│   ├── routes/          # Routes API
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── client.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   └── ...
│   ├── middleware/     # Middlewares
│   │   ├── auth.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── services/       # Services métier
│   │   └── notification.service.js
│   ├── utils/          # Utilitaires
│   │   ├── jwt.util.js
│   │   ├── bcrypt.util.js
│   │   └── prisma.util.js
│   ├── app.js          # Configuration Express
│   └── server.js       # Point d'entrée du serveur
├── prisma/             # Configuration Prisma
│   ├── schema.prisma   # Schéma de base de données
│   ├── seed.js         # Script de seed
│   └── migrations/     # Migrations de base de données
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── COMMANDES_TERMINAL.md
│   ├── GUIDE_DEMARRAGE.md
│   ├── SETUP_DATABASE.md
│   └── ...
├── ENV_EXAMPLE.txt     # Exemple de variables d'environnement
├── prisma.config.ts    # Configuration Prisma 7
├── package.json
└── README.md
```

## 🚀 Installation

### 1. Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration de la base de données

1. Créez une base de données PostgreSQL :

```sql
CREATE DATABASE ciment_db;
```

2. Copiez le fichier `ENV_EXAMPLE.txt` vers `.env` et renommez-le :

```bash
# Windows PowerShell
Copy-Item ENV_EXAMPLE.txt .env

# Linux/Mac
cp ENV_EXAMPLE.txt .env
```

3. Modifiez le fichier `.env` avec vos informations :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ciment_db?schema=public"
JWT_SECRET="votre_secret_jwt_tres_securise"
PORT=3000
```

### 4. Configuration Prisma

1. Générer le client Prisma :

```bash
npm run prisma:generate
```

2. Créer les migrations et appliquer le schéma :

```bash
npm run prisma:migrate
```

Cela va créer toutes les tables dans votre base de données.

## 🏃 Démarrage du Serveur

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`).

## 📚 API Endpoints

### Routes de Test

- `GET /health` - Vérification de santé du serveur
- `GET /api/test` - Route de test publique
- `GET /api/test/auth` - Route de test avec authentification

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Informations de l'utilisateur connecté

### Utilisateurs (Admin uniquement)

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Clients

- `GET /api/clients` - Liste des clients
- `GET /api/clients/:id` - Détails d'un client
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Produits

- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Commandes

- `GET /api/orders` - Liste des commandes
- `GET /api/orders/:id` - Détails d'une commande
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/:id/confirm` - Confirmer une commande (décrémente le stock)
- `PUT /api/orders/:id` - Modifier une commande
- `DELETE /api/orders/:id` - Supprimer une commande

### Fournisseurs

- `GET /api/suppliers` - Liste des fournisseurs
- `GET /api/suppliers/:id` - Détails d'un fournisseur
- `POST /api/suppliers` - Créer un fournisseur
- `PUT /api/suppliers/:id` - Modifier un fournisseur
- `DELETE /api/suppliers/:id` - Supprimer un fournisseur

### Comptes

- `GET /api/accounts/client/:clientId` - Compte d'un client
- `GET /api/accounts/supplier/:supplierId` - Compte d'un fournisseur
- `GET /api/accounts/:id` - Détails d'un compte
- `PUT /api/accounts/:id` - Modifier un compte

### Transactions

- `GET /api/transactions/account/:accountId` - Transactions d'un compte
- `GET /api/transactions/:id` - Détails d'une transaction
- `POST /api/transactions` - Créer une transaction

### Trucks

- `GET /api/trucks` - Liste des trucks
- `GET /api/trucks/available` - Trucks disponibles
- `GET /api/trucks/:id` - Détails d'un truck
- `POST /api/trucks` - Créer un truck
- `PUT /api/trucks/:id` - Modifier un truck
- `POST /api/trucks/:id/maintenance` - Enregistrer maintenance
- `POST /api/trucks/:id/fuel` - Enregistrer consommation carburant
- `POST /api/trucks/:id/expense` - Enregistrer charge

### Bons de Demande

- `GET /api/stock-requests` - Liste des bons de demande
- `POST /api/stock-requests` - Créer un bon de demande
- `PUT /api/stock-requests/:id/receive` - Marquer comme reçu

### Bons de Livraison

- `GET /api/delivery-notes` - Liste des bons de livraison
- `POST /api/delivery-notes` - Créer un bon de livraison
- `PUT /api/delivery-notes/:id/confirm` - Confirmer livraison (décrémente stock)

### Réception de Stock

- `GET /api/stock-receipts` - Liste des réceptions
- `POST /api/stock-receipts` - Créer une réception
- `PUT /api/stock-receipts/:id/confirm` - Confirmer réception (incrémente stock)

## 🔐 Rôles et Permissions

Le système utilise 6 rôles :

- **ADMIN** - Accès complet
- **DIRECTEUR** - Vue complète, notifications, rapports
- **CAISSIER_VENTE** - Création clients, devis, factures, bons de demande, gestion commandes
- **GESTIONNAIRE_STOCK** - Gestion stock, bons de livraison, réception stocks
- **GESTIONNAIRE_TRUCKS** - Gestion trucks, maintenance, consommation
- **GESTIONNAIRE_COMPTABILITE** - Comptabilisation, transactions, rapports

## 📝 Exemples d'utilisation

### 1. Inscription

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN"
}
```

### 2. Connexion

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Créer un client (avec token)

```bash
POST /api/clients
Authorization: Bearer <votre_token>
ContentType: application/json

{
  "name": "Entreprise ABC",
  "email": "contact@abc.com",
  "phone": "+222123456789",
  "idNumber": "123456789"
}
```

### 4. Créer un produit

```bash
POST /api/products
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "name": "Ciment Portland",
  "description": "Ciment de qualité supérieure",
  "unit": "tonne",
  "price": 120.50,
  "stock": 1000,
  "minStock": 100
}
```

### 5. Créer une commande

```bash
POST /api/orders
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "clientId": "client-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 50
    }
  ],
  "notes": "Livraison urgente"
}
```

### 6. Confirmer une commande (décrémente le stock)

```bash
PUT /api/orders/:id/confirm
Authorization: Bearer <votre_token>
```

## 🗄️ Base de Données

### Modèles Principaux

- **User** - Utilisateurs avec rôles
- **Client** - Clients de l'entreprise
- **Product** - Produits en stock
- **Order** - Commandes
- **OrderItem** - Articles de commande
- **Notification** - Notifications (structure préparée)
- **Quote** - Devis (préparé pour PDF)
- **Invoice** - Factures (préparé pour PDF)

### Visualiser la base de données

```bash
npm run prisma:studio
```

Ouvre Prisma Studio sur `http://localhost:5555` pour visualiser et modifier les données.

## 🔧 Scripts Disponibles

- `npm start` - Démarrer le serveur en production
- `npm run dev` - Démarrer en mode développement (nodemon)
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Créer et appliquer les migrations
- `npm run prisma:studio` - Ouvrir Prisma Studio
- `npm run prisma:seed` - Créer l'utilisateur admin par défaut

## 🧪 Tests

Pour tester l'API, utilisez les routes de test :

```bash
# Test de base
GET /api/test

# Test avec authentification
GET /api/test/auth
Authorization: Bearer <votre_token>
```

Ou utilisez PowerShell pour tester manuellement :

```powershell
# Connexion
$body = '{"email":"admin@ciment.com","password":"admin123"}'
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $login.data.token

# Test route protégée
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/clients" -Headers $headers
```

## 📚 Documentation

Toute la documentation détaillée se trouve dans le dossier `docs/` :

- `docs/GUIDE_DEMARRAGE.md` - Guide de démarrage rapide
- `docs/SETUP_DATABASE.md` - Configuration de la base de données
- `docs/COMMANDES_TERMINAL.md` - Commandes terminal utiles
- `docs/ARCHITECTURE.md` - Architecture du projet

## 📌 Fonctionnalités Implémentées

1. ✅ Structure complète du projet
2. ✅ Authentification JWT avec 6 rôles
3. ✅ CRUD Utilisateurs
4. ✅ CRUD Clients avec comptes
5. ✅ CRUD Fournisseurs avec comptes
6. ✅ CRUD Produits
7. ✅ CRUD Commandes avec workflow complet
8. ✅ Système de comptes (clients/fournisseurs) avec solde
9. ✅ Transactions avec justificatifs
10. ✅ Gestion complète des trucks (maintenance, carburant, charges)
11. ✅ Bons de demande vers magasin
12. ✅ Bons de livraison avec décrémentation automatique du stock
13. ✅ Réception de stocks avec incrémentation automatique
14. ✅ Service de notifications avec SMS intégré
15. ✅ Génération PDF (factures, devis, bons de livraison, bons de demande, réceptions)
16. ✅ Intégration SMS pour notifications directeur (Twilio)
17. ⏳ Rapports quotidiens/hebdomadaires/mensuels (structure prête dans schema)

## 🐛 Dépannage

### Erreur de connexion à la base de données

Vérifiez que :
- PostgreSQL est démarré
- La base de données existe
- Les identifiants dans `.env` sont corrects

### Erreur Prisma

```bash
# Régénérer le client Prisma
npm run prisma:generate

# Réappliquer les migrations
npm run prisma:migrate
```

## 📄 Licence

ISC

