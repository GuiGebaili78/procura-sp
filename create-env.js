#!/usr/bin/env node
/**
 * Script para criar .env.development automaticamente
 * Usage: node create-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Configurações para desenvolvimento Docker
NODE_ENV=development

# Database (Rede interna Docker)
POSTGRES_HOST=procura-sp-db
POSTGRES_PORT=5432
POSTGRES_USER=procura_sp_user
POSTGRES_PASSWORD=procura_sp_password
POSTGRES_DB=procura_sp_db

# Backend
BACKEND_PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api`;

const envPath = path.join(__dirname, '.env.development');

if (fs.existsSync(envPath)) {
  console.log('⚠️  Arquivo .env.development já existe. Não será sobrescrito.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.development criado com sucesso!');
  console.log('📁 Localização:', envPath);
}

console.log('');
console.log('📋 Próximos passos:');
console.log('   1. npm run docker:up');
console.log('   2. Aguardar 10 segundos para o banco subir');
console.log('   3. npm run dev');

console.log('');
console.log('🔒 SEGURANÇA: Este arquivo não será commitado (protegido pelo .gitignore)');
