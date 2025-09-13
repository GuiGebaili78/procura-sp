#!/usr/bin/env node
/**
 * Script para build da Vercel com migrações automáticas
 * Executa as migrações do banco antes do build
 */

const { execSync } = require('child_process');

console.log('🚀 Iniciando build da Vercel...');

try {
  // 1. Executar migrações via API (mais confiável)
  console.log('🔄 Executando migrações do banco...');
  
  // Criar um servidor temporário para executar migrações
  const fs = require('fs');
  const path = require('path');
  
  const migrationScript = `
    import { runMigrations } from './src/lib/migrations.ts';
    
    runMigrations()
      .then(() => {
        console.log('✅ Migrações executadas com sucesso!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Erro nas migrações:', error);
        process.exit(1);
      });
  `;
  
  // Escrever script temporário
  fs.writeFileSync('temp-migrate.mjs', migrationScript);
  
  // Executar migrações
  execSync('node temp-migrate.mjs', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Limpar arquivo temporário
  fs.unlinkSync('temp-migrate.mjs');
  
  console.log('✅ Migrações concluídas!');
  
} catch (error) {
  console.error('❌ Erro durante as migrações:', error.message);
  console.log('⚠️ Continuando com o build mesmo assim...');
}

try {
  // 2. Executar build do Next.js
  console.log('🔨 Executando build do Next.js...');
  execSync('next build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Build concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
