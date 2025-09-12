// Script para importar dados dos estabelecimentos
// Execute com: node scripts/importar-dados.js

import http from 'http';

async function importarDados() {
  try {
    console.log('🔄 Importando dados dos estabelecimentos...');
    console.log('⏳ Aguardando servidor responder...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/import-estabelecimentos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos timeout
    };

    const req = http.request(options, (res) => {
      console.log(`📡 Status: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('✅ Importação concluída!');
            console.log('📊 Resultado:', result);
          } else {
            console.error(`❌ Erro HTTP ${res.statusCode}:`, data);
          }
        } catch (error) {
          console.error('❌ Erro ao parsear resposta:', error);
          console.log('📄 Resposta raw:', data);
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Servidor não está rodando!');
        console.log('💡 Execute: docker-compose up -d');
      } else {
        console.error('❌ Erro na requisição:', error);
      }
    });

    req.on('timeout', () => {
      console.error('❌ Timeout - servidor demorou muito para responder');
      req.destroy();
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Verificar se o servidor está rodando antes de importar
console.log('🔍 Verificando se o servidor está rodando...');
importarDados();
