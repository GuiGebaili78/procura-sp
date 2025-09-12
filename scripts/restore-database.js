// Script para restaurar backup do banco de dados
// Execute com: node scripts/restore-database.js [arquivo-backup.sql]

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function restaurarBackup(backupFile) {
  try {
    if (!backupFile) {
      console.error('❌ Especifique o arquivo de backup!');
      console.log('💡 Uso: node scripts/restore-database.js backup-2024-01-01.sql');
      return;
    }
    
    const backupPath = path.join(__dirname, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Arquivo não encontrado: ${backupFile}`);
      return;
    }
    
    console.log('🔄 Restaurando backup do banco de dados...');
    console.log(`📁 Arquivo: ${backupFile}`);
    
    const command = `docker-compose exec -T postgres psql -U postgres procura_sp < "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro na restauração:', error);
        return;
      }
      
      if (stderr) {
        console.log('⚠️ Avisos:', stderr);
      }
      
      console.log('✅ Restauração concluída!');
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

const backupFile = process.argv[2];
restaurarBackup(backupFile);
