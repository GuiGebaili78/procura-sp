import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Configuração do Neon (substitua pelas suas credenciais)
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@host:port/database',
  ssl: {
    rejectUnauthorized: false
  }
});

async function populateNeon() {
  try {
    console.log('🔄 Conectando ao Neon...');
    await client.connect();
    
    console.log('✅ Conectado ao Neon com sucesso!');
    
    // Verificar se a tabela existe
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'estabelecimentos_saude'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Tabela estabelecimentos_saude não existe! Execute primeiro: node scripts/migrate-neon.js');
      return;
    }
    
    // Verificar se já tem dados
    const countResult = await client.query('SELECT COUNT(*) FROM estabelecimentos_saude');
    const count = parseInt(countResult.rows[0].count);
    
    if (count > 0) {
      console.log(`⚠️ Tabela já possui ${count} registros. Deseja limpar e recarregar? (y/n)`);
      console.log('💡 Para limpar e recarregar, descomente as linhas abaixo no script');
      // await client.query('DELETE FROM estabelecimentos_saude');
      // console.log('🗑️ Dados antigos removidos.');
    }
    
    // Ler e executar script de dados
    console.log('📊 Carregando dados dos estabelecimentos...');
    const dataPath = path.join(process.cwd(), 'scripts/popular_estabelecimentos_completo.sql');
    const dataSQL = fs.readFileSync(dataPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = dataSQL.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`📋 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        try {
          await client.query(command);
          if (i % 100 === 0) {
            console.log(`⏳ Progresso: ${i}/${commands.length} comandos executados...`);
          }
        } catch (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          console.error(`Comando: ${command.substring(0, 100)}...`);
        }
      }
    }
    
    // Verificar resultado final
    const finalCount = await client.query('SELECT COUNT(*) FROM estabelecimentos_saude');
    console.log(`✅ Migração concluída! Total de registros: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro durante o carregamento:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com Neon encerrada.');
  }
}

// Executar população
populateNeon();


