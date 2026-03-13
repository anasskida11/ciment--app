const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Créer un pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Créer l'adaptateur Prisma pour PostgreSQL
const adapter = new PrismaPg(pool);

// Créer le client Prisma avec l'adaptateur
const prisma = new PrismaClient({ adapter });

module.exports = prisma;