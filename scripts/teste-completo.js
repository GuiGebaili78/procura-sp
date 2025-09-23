#!/usr/bin/env node

/**
 * Script para executar o teste completo de integração
 * Simula um usuário testando todos os serviços sequencialmente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando Teste Completo de Integração...\n');

// Verificar se o arquivo de teste existe
const testFile = path.join(__dirname, '../src/__tests__/integration/teste-completo-servicos.test.tsx');
if (!fs.existsSync(testFile)) {
  console.error('❌ Arquivo de teste não encontrado:', testFile);
  process.exit(1);
}

try {
  // Executar o teste
  console.log('📋 Executando teste de integração completo...');
  console.log('🔍 Verificando:');
  console.log('   • Request/Response das APIs');
  console.log('   • Integração entre componentes');
  console.log('   • Banco de dados');
  console.log('   • Layout da página');
  console.log('   • Performance e UX');
  console.log('   • Acessibilidade');
  console.log('   • Tratamento de erros\n');

  const result = execSync('npm test -- --testPathPattern=teste-completo-servicos.test.ts --verbose', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Teste completo executado com sucesso!');
  console.log('🎉 Todos os serviços foram testados:');
  console.log('   • ✅ Cata-Bagulho');
  console.log('   • ✅ Feiras Livres');
  console.log('   • ✅ Coleta de Lixo');
  console.log('   • ✅ Saúde Pública');
  console.log('\n📊 Resultado: Nenhum problema detectado!');

} catch (error) {
  console.error('\n❌ Teste falhou!');
  console.error('🔍 Verifique os erros acima para identificar problemas.');
  console.error('\n💡 Possíveis causas:');
  console.error('   • APIs não estão respondendo');
  console.error('   • Banco de dados não está conectado');
  console.error('   • Componentes com problemas de renderização');
  console.error('   • Erros de integração entre serviços');
  
  process.exit(1);
}
