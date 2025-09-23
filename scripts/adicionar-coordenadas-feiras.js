const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-backup.json');
const BATCH_SIZE = 5; // Processar em lotes menores
const DELAY_BETWEEN_BATCHES = 3000; // 3 segundos entre lotes
const DELAY_BETWEEN_REQUESTS = 1000; // 1 segundo entre requisições

/**
 * Função para fazer geocoding de um endereço
 */
async function geocodeAddress(endereco) {
  try {
    console.log(`🔍 Geocodificando: ${endereco}`);
    
    // Aguardar um pouco entre requisições
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: endereco,
        format: 'json',
        limit: 1,
        countrycodes: 'br',
        state: 'São Paulo',
        city: 'São Paulo',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 segundos de timeout
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`⚠️ Erro ao geocodificar ${endereco}:`, error.message);
    return null;
  }
}

/**
 * Função para processar um lote de feiras
 */
async function processarLote(feiras, indiceInicio) {
  const lote = feiras.slice(indiceInicio, indiceInicio + BATCH_SIZE);
  console.log(`\n📦 Processando lote ${Math.floor(indiceInicio / BATCH_SIZE) + 1} (feiras ${indiceInicio + 1} a ${Math.min(indiceInicio + BATCH_SIZE, feiras.length)})`);
  
  const resultados = [];
  
  for (let index = 0; index < lote.length; index++) {
    const feira = lote[index];
    const indiceGlobal = indiceInicio + index;
    
    // Se já tem coordenadas, pular
    if (feira.latitude && feira.longitude) {
      console.log(`✅ Feira ${indiceGlobal + 1} já tem coordenadas: ${feira.latitude}, ${feira.longitude}`);
      resultados.push(feira);
      continue;
    }
    
    // Construir endereço completo
    const enderecoCompleto = `${feira.endereco}, ${feira.bairro}, São Paulo, SP, Brasil`;
    
    // Fazer geocoding
    const coords = await geocodeAddress(enderecoCompleto);
    
    if (coords) {
      console.log(`✅ Feira ${indiceGlobal + 1} geocodificada: ${coords.lat}, ${coords.lng}`);
      resultados.push({
        ...feira,
        latitude: coords.lat,
        longitude: coords.lng
      });
    } else {
      console.log(`❌ Feira ${indiceGlobal + 1} não pôde ser geocodificada`);
      resultados.push({
        ...feira,
        latitude: null,
        longitude: null
      });
    }
  }
  
  return resultados;
}

/**
 * Função principal
 */
async function adicionarCoordenadas() {
  try {
    console.log('🚀 Iniciando processo de adição de coordenadas às feiras...');
    
    // Ler arquivo de feiras
    console.log('📖 Lendo arquivo de feiras...');
    const feirasData = fs.readFileSync(FEIRAS_FILE, 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras encontradas: ${feiras.length}`);
    
    // Criar backup
    console.log('💾 Criando backup do arquivo original...');
    fs.writeFileSync(BACKUP_FILE, feirasData);
    console.log(`✅ Backup criado em: ${BACKUP_FILE}`);
    
    // Verificar quantas já têm coordenadas
    const comCoordenadas = feiras.filter(f => f.latitude && f.longitude).length;
    const semCoordenadas = feiras.length - comCoordenadas;
    
    console.log(`📈 Feiras com coordenadas: ${comCoordenadas}`);
    console.log(`📉 Feiras sem coordenadas: ${semCoordenadas}`);
    
    if (semCoordenadas === 0) {
      console.log('✅ Todas as feiras já têm coordenadas!');
      return;
    }
    
    // Processar em lotes
    const feirasAtualizadas = [...feiras];
    const totalLotes = Math.ceil(feiras.length / BATCH_SIZE);
    
    for (let i = 0; i < feiras.length; i += BATCH_SIZE) {
      const loteAtualizado = await processarLote(feirasAtualizadas, i);
      
      // Atualizar o array principal
      for (let j = 0; j < loteAtualizado.length; j++) {
        feirasAtualizadas[i + j] = loteAtualizado[j];
      }
      
      // Salvar progresso a cada lote
      console.log('💾 Salvando progresso...');
      fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
      
      // Aguardar entre lotes para não sobrecarregar a API
      if (i + BATCH_SIZE < feiras.length) {
        console.log(`⏳ Aguardando ${DELAY_BETWEEN_BATCHES}ms antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Estatísticas finais
    const finalComCoordenadas = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
    const finalSemCoordenadas = feirasAtualizadas.length - finalComCoordenadas;
    
    console.log('\n🎉 Processo concluído!');
    console.log(`📊 Estatísticas finais:`);
    console.log(`   ✅ Feiras com coordenadas: ${finalComCoordenadas}`);
    console.log(`   ❌ Feiras sem coordenadas: ${finalSemCoordenadas}`);
    console.log(`   📈 Taxa de sucesso: ${((finalComCoordenadas / feiras.length) * 100).toFixed(1)}%`);
    
    // Salvar arquivo final
    console.log('💾 Salvando arquivo final...');
    fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
    console.log('✅ Arquivo atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  adicionarCoordenadas();
}

module.exports = { adicionarCoordenadas };
