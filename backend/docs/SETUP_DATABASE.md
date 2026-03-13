# 🗄️ Guide de Configuration de la Base de Données PostgreSQL

## Étape 1 : Créer la base de données dans PostgreSQL

Vous avez **3 options** pour créer la base de données :

### Option A : Via psql (ligne de commande)

```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, exécutez :
CREATE DATABASE ciment_db;

# Quitter psql
\q
```

### Option B : Via pgAdmin (interface graphique)

1. Ouvrez **pgAdmin**
2. Connectez-vous à votre serveur PostgreSQL
3. Clic droit sur **Databases** → **Create** → **Database**
4. Nom : `ciment_db`
5. Cliquez sur **Save**

### Option C : Via le script SQL fourni

```powershell
# Exécuter le script SQL
psql -U postgres -f CREATE_DATABASE.sql
```

## Étape 2 : Créer le fichier .env

Créez un fichier `.env` à la racine du projet (`C:\Users\user\Documents\ciment-app\backend\.env`) avec ce contenu :

```env
# Configuration de la base de données PostgreSQL
# ⚠️ REMPLACEZ user et password par vos identifiants PostgreSQL réels !
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/ciment_db?schema=public"

# Configuration JWT
# ⚠️ CHANGEZ ce secret en production !
JWT_SECRET="votre_secret_jwt_tres_securise_changez_moi_en_production"
JWT_EXPIRES_IN="7d"

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

**⚠️ IMPORTANT :**
- Remplacez `postgres` par votre nom d'utilisateur PostgreSQL
- Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe PostgreSQL
- Si vous utilisez un port différent (par défaut 5432), modifiez-le dans l'URL

## Étape 3 : Générer le client Prisma

```powershell
npm run prisma:generate
```

## Étape 4 : Créer les tables (migrations)

```powershell
npm run prisma:migrate
```

Quand on vous demande le nom de la migration, tapez : `init`

Cela va créer toutes les tables dans votre base de données selon le schéma Prisma.

## Étape 5 : (Optionnel) Créer un utilisateur admin par défaut

```powershell
npm run prisma:seed
```

Cela créera un utilisateur admin avec :
- **Email** : `admin@ciment.com`
- **Password** : `admin123`

⚠️ **Changez ce mot de passe en production !**

## Étape 6 : Vérifier que tout fonctionne

```powershell
# Démarrer le serveur
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

Testez la connexion :
```powershell
# Dans un autre terminal
curl http://localhost:3000/health
```

Ou ouvrez dans votre navigateur : `http://localhost:3000/health`

## 🔍 Vérification de la connexion

Si vous avez des erreurs de connexion, vérifiez :

1. **PostgreSQL est démarré** :
   ```powershell
   # Vérifier le service PostgreSQL
   Get-Service -Name postgresql*
   ```

2. **Les identifiants dans .env sont corrects**

3. **La base de données existe** :
   ```powershell
   psql -U postgres -l
   # Vous devriez voir ciment_db dans la liste
   ```

4. **Le port PostgreSQL est correct** (par défaut 5432)

## 📊 Visualiser la base de données avec Prisma Studio

```powershell
npm run prisma:studio
```

Cela ouvre une interface graphique sur `http://localhost:5555` pour voir et modifier vos données.

## ✅ Checklist

- [ ] PostgreSQL est installé et démarré
- [ ] Base de données `ciment_db` créée
- [ ] Fichier `.env` créé avec les bonnes informations
- [ ] Client Prisma généré (`npm run prisma:generate`)
- [ ] Migrations exécutées (`npm run prisma:migrate`)
- [ ] (Optionnel) Seed exécuté (`npm run prisma:seed`)
- [ ] Serveur démarre sans erreur (`npm run dev`)
