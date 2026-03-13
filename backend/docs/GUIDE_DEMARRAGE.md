# 🚀 Guide de Démarrage Rapide

## Étape 1 : Installation des dépendances

```bash
npm install
```

## Étape 2 : Configuration de la base de données

### 2.1 Créer la base de données PostgreSQL

Connectez-vous à PostgreSQL et exécutez :

```sql
CREATE DATABASE ciment_db;
```

### 2.2 Créer le fichier .env

Copiez le contenu de `ENV_EXAMPLE.txt` dans un nouveau fichier `.env` :

```bash
# Windows PowerShell
Copy-Item ENV_EXAMPLE.txt .env

# Linux/Mac
cp ENV_EXAMPLE.txt .env
```

Puis modifiez `.env` avec vos informations de connexion PostgreSQL :

```env
DATABASE_URL="postgresql://VOTRE_USER:VOTRE_PASSWORD@localhost:5432/ciment_db?schema=public"
JWT_SECRET="changez_moi_par_une_chaine_secrete_longue_et_aleatoire"
```

## Étape 3 : Configuration Prisma

### 3.1 Générer le client Prisma

```bash
npm run prisma:generate
```

### 3.2 Créer les tables dans la base de données

```bash
npm run prisma:migrate
```

Quand Prisma vous demande un nom de migration, tapez : `init`

## Étape 4 : Créer un utilisateur admin (optionnel)

```bash
npm run prisma:seed
```

Cela créera un utilisateur admin avec :
- Email: `admin@ciment.com`
- Password: `admin123`

⚠️ **Changez ce mot de passe en production !**

## Étape 5 : Démarrer le serveur

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Étape 6 : Tester l'API

### Test 1 : Vérifier que le serveur fonctionne

Ouvrez votre navigateur ou utilisez curl :

```bash
# Navigateur
http://localhost:3000/health

# ou curl
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Test 2 : Route de test publique

```bash
curl http://localhost:3000/api/test
```

### Test 3 : Connexion avec l'admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ciment.com",
    "password": "admin123"
  }'
```

Réponse :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@ciment.com",
      "firstName": "Admin",
      "lastName": "System",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 4 : Route protégée avec token

Copiez le `token` de la réponse précédente et utilisez-le :

```bash
curl http://localhost:3000/api/test/auth \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## 📋 Checklist de Vérification

- [ ] Node.js installé (v18+)
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `ciment_db` créée
- [ ] Fichier `.env` créé et configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Client Prisma généré (`npm run prisma:generate`)
- [ ] Migrations appliquées (`npm run prisma:migrate`)
- [ ] Serveur démarre sans erreur (`npm run dev`)
- [ ] Route `/health` répond correctement
- [ ] Connexion admin fonctionne

## 🐛 Problèmes Courants

### Erreur : "Cannot find module '@prisma/client'"

Solution :
```bash
npm run prisma:generate
```

### Erreur : "Can't reach database server"

Vérifiez que :
- PostgreSQL est démarré
- Les identifiants dans `.env` sont corrects
- La base de données existe

### Erreur : "P1001: Can't reach database server"

Vérifiez votre `DATABASE_URL` dans `.env` :
```
postgresql://USER:PASSWORD@localhost:5432/ciment_db?schema=public
```

## 📚 Prochaines Étapes

Une fois le serveur démarré, vous pouvez :

1. **Tester l'API** avec Postman ou Insomnia
2. **Créer des utilisateurs** via `/api/auth/register`
3. **Créer des clients** via `/api/clients`
4. **Créer des produits** via `/api/products`
5. **Créer des commandes** via `/api/orders`

Consultez le `README.md` pour la documentation complète de l'API.

