const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Créer un pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Créer l'adaptateur Prisma pour PostgreSQL
const adapter = new PrismaPg(pool);

// Créer le client Prisma avec l'adaptateur
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Création d'un utilisateur admin par défaut
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ciment.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe!2024';

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('ℹ️  L\'utilisateur admin existe déjà');
    return;
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Création de l'admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Utilisateur admin créé avec succès !');
  console.log(`   Email: ${adminEmail}`);
  console.log('   ⚠️  Changez le mot de passe admin après la première connexion !');

  // Exemple : Création d'un produit de test
  const product = await prisma.product.create({
    data: {
      name: 'Ciment Portland CPJ 32.5',
      description: 'Ciment Portland composé pour usage général',
      unit: 'tonne',
      price: 120.50,
      stock: 1000,
      minStock: 100
    }
  });

  console.log('✅ Produit de test créé:', product.name);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

