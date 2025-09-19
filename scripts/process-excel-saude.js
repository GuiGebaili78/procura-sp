const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Script para processar planilha Excel de estabelecimentos de saúde
 * Executa: node scripts/process-excel-saude.js
 */

async function processarExcelSaude() {
  console.log('🏥 Processando planilha Excel de estabelecimentos de saúde...');
  console.log('=====================================================');

  try {
    // 1. Ler o arquivo Excel
    const excelPath = path.join(__dirname, '..', 'public', 'estabelecimentos-saude.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Arquivo Excel não encontrado: ${excelPath}`);
      return;
    }

    console.log(`📊 Lendo arquivo: ${excelPath}`);
    const workbook = XLSX.readFile(excelPath);
    
    // 2. Listar as planilhas disponíveis
    console.log('📋 Planilhas encontradas:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    // 3. Processar a primeira planilha (ou a principal)
    const sheetName = workbook.SheetNames[0];
    console.log(`\n📊 Processando planilha: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Total de registros encontrados: ${jsonData.length}`);
    
    if (jsonData.length === 0) {
      console.log('⚠️ Nenhum dado encontrado na planilha');
      return;
    }

    // 4. Mostrar estrutura dos dados
    console.log('\n📋 Estrutura dos dados:');
    const firstRow = jsonData[0];
    Object.keys(firstRow).forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}: ${typeof firstRow[key]} (exemplo: ${firstRow[key]})`);
    });

    // 5. Processar e limpar os dados
    console.log('\n🔧 Processando e limpando dados...');
    const estabelecimentosProcessados = jsonData.map((row, index) => {
      try {
        // Mapear campos para estrutura padronizada
        const estabelecimento = {
          id: row.ID || row.id || `saude-${index + 1}`,
          nome: row.LOCAL || row.ESTABELECIMENTO || row.nome || row.NOME || 'Nome não informado',
          endereco: row.ENDERECO || row.endereco || 'Endereço não informado',
          bairro: row.BAIRRO || row.bairro || 'Bairro não informado',
          cep: row.CEP || row.cep || null,
          telefone: row.TELEFONE || row.telefone || row.FONE || null,
          tipo: row.TIPO || row.tipo || row.CATEGORIA || 'Tipo não informado',
          categoria: row.CATEGORIA || row.categoria || null,
          administracao: row.ADM || row.administracao || null,
          regiao: row.REGIAO || row.regiao || 'Região não informada',
          codigo: row.CODIGO || row.codigo || null,
          descricao: row.DESCRICAO || row.descricao || null,
          latitude: row.LAT ? parseFloat(row.LAT) / 1000000 : null,
          longitude: row.LONG ? parseFloat(row.LONG) / 1000000 : null,
          ativo: true,
          dataAtualizacao: new Date().toISOString()
        };

        // Limpar e formatar dados
        if (estabelecimento.cep && typeof estabelecimento.cep === 'string') {
          estabelecimento.cep = estabelecimento.cep.replace(/\D/g, '');
          if (estabelecimento.cep.length === 8) {
            estabelecimento.cep = estabelecimento.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
          }
        }

        if (estabelecimento.telefone && typeof estabelecimento.telefone === 'string') {
          estabelecimento.telefone = estabelecimento.telefone.replace(/\D/g, '');
        }

        // Validar coordenadas
        if (estabelecimento.latitude && estabelecimento.longitude) {
          if (estabelecimento.latitude < -90 || estabelecimento.latitude > 90) {
            estabelecimento.latitude = null;
          }
          if (estabelecimento.longitude < -180 || estabelecimento.longitude > 180) {
            estabelecimento.longitude = null;
          }
        }

        return estabelecimento;
      } catch (error) {
        console.error(`❌ Erro ao processar registro ${index + 1}:`, error);
        return null;
      }
    }).filter(est => est !== null);

    console.log(`✅ ${estabelecimentosProcessados.length} estabelecimentos processados com sucesso`);

    // 6. Estatísticas dos dados
    console.log('\n📊 Estatísticas dos dados:');
    
    const tipos = {};
    const regioes = {};
    const bairros = {};
    let comCoordenadas = 0;
    let comTelefone = 0;
    let comCep = 0;

    estabelecimentosProcessados.forEach(est => {
      tipos[est.tipo] = (tipos[est.tipo] || 0) + 1;
      regioes[est.regiao] = (regioes[est.regiao] || 0) + 1;
      bairros[est.bairro] = (bairros[est.bairro] || 0) + 1;
      
      if (est.latitude && est.longitude) comCoordenadas++;
      if (est.telefone) comTelefone++;
      if (est.cep) comCep++;
    });

    console.log(`   📍 Com coordenadas: ${comCoordenadas}/${estabelecimentosProcessados.length} (${((comCoordenadas/estabelecimentosProcessados.length)*100).toFixed(1)}%)`);
    console.log(`   📞 Com telefone: ${comTelefone}/${estabelecimentosProcessados.length} (${((comTelefone/estabelecimentosProcessados.length)*100).toFixed(1)}%)`);
    console.log(`   📮 Com CEP: ${comCep}/${estabelecimentosProcessados.length} (${((comCep/estabelecimentosProcessados.length)*100).toFixed(1)}%)`);

    console.log('\n   🏥 Tipos de estabelecimentos:');
    Object.entries(tipos).slice(0, 10).forEach(([tipo, count]) => {
      console.log(`      ${tipo}: ${count}`);
    });

    console.log('\n   🗺️ Regiões:');
    Object.entries(regioes).forEach(([regiao, count]) => {
      console.log(`      ${regiao}: ${count}`);
    });

    // 7. Salvar o JSON processado
    const outputPath = path.join(__dirname, '..', 'public', 'dados', 'estabelecimentos-saude.json');
    
    // Fazer backup do arquivo antigo se existir
    if (fs.existsSync(outputPath)) {
      const backupPath = path.join(__dirname, '..', 'public', 'dados', 'estabelecimentos-saude-backup.json');
      fs.copyFileSync(outputPath, backupPath);
      console.log(`\n💾 Backup criado: ${backupPath}`);
    }

    // Salvar novo arquivo
    fs.writeFileSync(outputPath, JSON.stringify(estabelecimentosProcessados, null, 2), 'utf8');
    console.log(`\n✅ Arquivo salvo: ${outputPath}`);
    console.log(`📊 Total de estabelecimentos: ${estabelecimentosProcessados.length}`);

    // 8. Mostrar alguns exemplos
    console.log('\n📋 Exemplos de estabelecimentos processados:');
    estabelecimentosProcessados.slice(0, 5).forEach((est, index) => {
      console.log(`\n   ${index + 1}. ${est.nome}`);
      console.log(`      📍 ${est.endereco} - ${est.bairro}`);
      console.log(`      🏥 ${est.tipo} - ${est.regiao}`);
      console.log(`      📞 ${est.telefone || 'Não informado'}`);
      console.log(`      📮 ${est.cep || 'Não informado'}`);
      console.log(`      🗺️ ${est.latitude && est.longitude ? `${est.latitude}, ${est.longitude}` : 'Sem coordenadas'}`);
    });

    console.log('\n=====================================================');
    console.log('✅ Processamento concluído com sucesso!');
    console.log('=====================================================');

  } catch (error) {
    console.error('❌ Erro ao processar planilha:', error);
    console.error('Stack:', error.stack);
  }
}

// Executar processamento
processarExcelSaude();
