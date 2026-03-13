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

async function createUser(email, password, firstName, lastName, role) {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log(`ℹ️  ${role} - L'utilisateur existe déjà: ${email}`);
    return existingUser;
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Création de l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  console.log(`✅ ${role} - Utilisateur créé avec succès !`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Name: ${user.firstName} ${user.lastName}`);
  console.log('');
  
  return user;
}

async function main() {
  console.log('🌱 Création des utilisateurs de test pour tous les rôles...\n');

  const testUsers = [
    {
      email: 'gestionnaire.client@test.com',
      password: 'test123',
      firstName: 'Gestionnaire',
      lastName: 'Clientèle',
      role: 'GESTIONNAIRE_CLIENTELE'
    },
    {
      email: 'gestionnaire.stock@test.com',
      password: 'test123',
      firstName: 'Gestionnaire',
      lastName: 'Stock',
      role: 'GESTIONNAIRE_STOCK'
    },
    {
      email: 'gestionnaire.trucks@test.com',
      password: 'test123',
      firstName: 'Gestionnaire',
      lastName: 'Véhicules',
      role: 'GESTIONNAIRE_TRUCKS'
    },
    {
      email: 'comptable@test.com',
      password: 'test123',
      firstName: 'Comptable',
      lastName: 'Test',
      role: 'COMPTABLE'
    }
  ];

  for (const userData of testUsers) {
    await createUser(
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.role
    );
  }

  console.log('✅ Tous les utilisateurs de test ont été créés !');
  console.log('\n📋 Résumé des comptes:');
  console.log('   Email: gestionnaire.client@test.com | Password: test123 | Role: GESTIONNAIRE_CLIENTELE');
  console.log('   Email: gestionnaire.stock@test.com | Password: test123 | Role: GESTIONNAIRE_STOCK');
  console.log('   Email: gestionnaire.trucks@test.com | Password: test123 | Role: GESTIONNAIRE_TRUCKS');
  console.log('   Email: comptable@test.com | Password: test123 | Role: COMPTABLE');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
