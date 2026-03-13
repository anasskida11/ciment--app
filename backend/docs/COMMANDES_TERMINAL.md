# 📝 Commandes Terminal - Guide Complet

## Étape 1 : Vérifier que vous êtes dans le bon dossier

```powershell
cd C:\Users\user\Documents\ciment-app\backend
```

## Étape 2 : Vérifier que Node.js est installé

```powershell
node --version
```

Vous devriez voir quelque chose comme `v18.x.x` ou supérieur.

## Étape 3 : Installer les dépendances

```powershell
npm install
```

Cette commande va installer tous les packages nécessaires (Express, Prisma, JWT, etc.)

## Étape 4 : Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec ce contenu :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ciment_db?schema=public"
JWT_SECRET="votre_secret_jwt_tres_securise_changez_moi"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

**⚠️ IMPORTANT** : Remplacez `user` et `password` par vos identifiants PostgreSQL réels !

## Étape 5 : Créer la base de données PostgreSQL

Ouvrez PostgreSQL (pgAdmin ou psql) et exécutez :

```sql
CREATE DATABASE ciment_db;
```

## Étape 6 : Générer le client Prisma

```powershell
npm run prisma:generate
```

## Étape 7 : Créer les tables dans la base de données

```powershell
npm run prisma:migrate
```

Quand on vous demande le nom de la migration, tapez : `init`

## Étape 8 : (Optionnel) Créer un utilisateur admin

```powershell
npm run prisma:seed
```

Cela créera un admin avec :
- Email: `admin@ciment.com`
- Password: `admin123`

## Étape 9 : Démarrer le serveur

```powershell
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

## ✅ Vérification

Ouvrez un autre terminal et testez :

```powershell
curl http://localhost:3000/health
```

Ou ouvrez dans votre navigateur : `http://localhost:3000/health`

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "..."
}
```

## 🐛 Si vous avez des erreurs

### Erreur "Cannot find module"
→ Réexécutez `npm install`

### Erreur de connexion à la base de données
→ Vérifiez que PostgreSQL est démarré et que le `.env` a les bons identifiants

### Erreur Prisma
→ Vérifiez que vous avez bien créé la base de données `ciment_db`

