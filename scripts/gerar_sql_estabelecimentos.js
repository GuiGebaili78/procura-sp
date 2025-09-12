// Script para gerar SQL de inserção dos estabelecimentos
// Execute com: node scripts/gerar_sql_estabelecimentos.js

const fs = require('fs');
const path = require('path');

try {
  console.log('🔄 Gerando SQL de inserção...');
  
  // Caminho para o arquivo JSON
  const jsonPath = path.join(__dirname, '..', 'public', 'dados_saude', 'estabelecimentos.json');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Arquivo JSON não encontrado:', jsonPath);
    process.exit(1);
  }
  
  // Ler dados JSON
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📊 Total de registros: ${jsonData.length}`);
  
  // Gerar SQL
  let sql = `-- Script para popular a tabela estabelecimentos_saude
-- Gerado automaticamente com ${jsonData.length} registros

-- Primeiro, limpar a tabela se já tiver dados
DELETE FROM estabelecimentos_saude;

-- Inserir os dados dos estabelecimentos
INSERT INTO estabelecimentos_saude (id, nome, tipo, endereco, bairro, regiao, cep, latitude, longitude, esfera_administrativa) VALUES
`;

  // Processar cada registro
  const inserts = [];
  let processed = 0;
  
  for (const row of jsonData) {
    try {
      // Converter coordenadas (dividir por 1.000.000)
      const lat = parseFloat(String(row.LAT).replace(',', '.')) / 1000000;
      const lng = parseFloat(String(row.LONG).replace(',', '.')) / 1000000;
      
      // Validar coordenadas
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.log(`⚠️ Registro ${processed + 1} com coordenadas inválidas, pulando...`);
        continue;
      }
      
      // Mapear esfera administrativa
      let esfera = 'Privado'; // Padrão
      if (row.DEPADM) {
        const depadm = row.DEPADM.toLowerCase();
        if (depadm.includes('municipal')) esfera = 'Municipal';
        else if (depadm.includes('estadual')) esfera = 'Estadual';
        else if (depadm.includes('privado')) esfera = 'Privado';
      }
      
      // Escapar aspas simples nos textos
      const escapeText = (text) => {
        if (!text) return '';
        return String(text).replace(/'/g, "''");
      };
      
      // Gerar linha de INSERT
      const insert = `(${row.ID || 'NULL'}, '${escapeText(row.ESTABELECIMENTO || 'Nome não informado')}', '${escapeText(row.TIPO || 'Estabelecimento de Saúde')}', '${escapeText(row.ENDERECO || 'Endereço não informado')}', '${escapeText(row.BAIRRO || 'Bairro não informado')}', '${escapeText(row.REGIAO || 'Região não informada')}', '${escapeText(row.CEP || '00000-000')}', ${lat}, ${lng}, '${esfera}')`;
      
      inserts.push(insert);
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`📊 Processados: ${processed}/${jsonData.length}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar registro ${processed + 1}:`, error);
    }
  }
  
  // Adicionar os INSERTs ao SQL
  sql += inserts.join(',\n');
  sql += `;

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_estabelecimentos FROM estabelecimentos_saude;

-- Verificar distribuição por esfera administrativa
SELECT esfera_administrativa, COUNT(*) as quantidade 
FROM estabelecimentos_saude 
GROUP BY esfera_administrativa;

-- Verificar distribuição por região
SELECT regiao, COUNT(*) as quantidade 
FROM estabelecimentos_saude 
GROUP BY regiao;
`;

  // Salvar arquivo SQL
  const sqlPath = path.join(__dirname, 'popular_estabelecimentos_completo.sql');
  fs.writeFileSync(sqlPath, sql);
  
  console.log(`✅ SQL gerado com sucesso!`);
  console.log(`📁 Arquivo: ${sqlPath}`);
  console.log(`📊 Total processado: ${processed} registros`);
  console.log(`📊 Taxa de sucesso: ${((processed / jsonData.length) * 100).toFixed(1)}%`);
  
} catch (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}
