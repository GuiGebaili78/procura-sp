// Script para fazer backup do banco de dados
// Execute com: node scripts/backup-database.js

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fazerBackup() {
  try {
    console.log('🔄 Fazendo backup do banco de dados...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    const backupPath = path.join(__dirname, backupFile);
    
    const command = `docker-compose exec -T postgres pg_dump -U postgres procura_sp > "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no backup:', error);
        return;
      }
      
      if (stderr) {
        console.log('⚠️ Avisos:', stderr);
      }
      
      console.log('✅ Backup concluído!');
      console.log(`📁 Arquivo: ${backupFile}`);
      console.log(`📊 Tamanho: ${fs.statSync(backupPath).size} bytes`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fazerBackup();
