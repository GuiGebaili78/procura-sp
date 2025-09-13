#!/usr/bin/env node
/**
 * Script para build da Vercel com migrações automáticas
 * Executa as migrações do banco antes do build
 */

const { execSync } = require('child_process');

console.log('🚀 Iniciando build da Vercel...');

try {
  // 1. Executar migrações diretamente
  console.log('🔄 Executando migrações do banco...');
  
  // Executar migrações usando ts-node diretamente
  execSync('npx ts-node -e "import(\'./src/lib/migrations.ts\').then(m => m.runMigrations()).catch(e => { console.error(\'Erro:\', e); process.exit(1); })"', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
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
