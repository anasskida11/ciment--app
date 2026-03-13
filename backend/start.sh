#!/bin/sh
echo "Running database migrations..."
npx prisma migrate deploy
echo "Seeding database..."
node prisma/seed.js || true
echo "Starting server..."
node src/server.js
