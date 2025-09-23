const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração otimizada
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-backup.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-progress.json');

const BATCH_SIZE = 3; // Lotes menores
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 segundos entre requisições
const DELAY_BETWEEN_BATCHES = 3000; // 3 segundos entre lotes
const MAX_RETRIES = 3; // Máximo de tentativas por feira

/**
 * Função para obter coordenadas via ViaCEP
 */
async function getCoordsViaCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 8000
    });

    if (response.data && !response.data.erro) {
      const { uf, localidade, bairro, logradouro } = response.data;
      
      if (logradouro && bairro && localidade) {
        const endereco = `${logradouro}, ${bairro}, ${localidade}, ${uf}, Brasil`;
        return await geocodeWithNominatim(endereco);
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Função para geocoding com Nominatim (otimizada)
 */
async function geocodeWithNominatim(endereco, retryCount = 0) {
  try {
    // Aguardar entre requisições
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
        'User-Agent': 'Mozilla/5.0 (compatible; ProcuraSP/1.0; +https://github.com/procura-sp)'
      },
      timeout: 10000
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
    if (retryCount < MAX_RETRIES) {
      console.log(`⚠️ Tentativa ${retryCount + 1} falhou, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return geocodeWithNominatim(endereco, retryCount + 1);
    }
    
    console.warn(`❌ Erro no geocoding após ${MAX_RETRIES} tentativas: ${error.message}`);
    return null;
  }
}

/**
 * Função para salvar progresso
 */
function salvarProgresso(indiceAtual, feirasAtualizadas) {
  const progresso = {
    indiceAtual,
    feirasAtualizadas,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progresso, null, 2));
}

/**
 * Função para carregar progresso
 */
function carregarProgresso() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progresso = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log(`📂 Progresso encontrado: feira ${progresso.indiceAtual + 1}`);
      return progresso;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar progresso:', error.message);
  }
  return null;
}

/**
 * Função para processar feiras otimizada
 */
async function processarFeirasOtimizado() {
  try {
    console.log('🚀 Iniciando geocoding otimizado das feiras...');
    
    // Ler arquivo
    const feirasData = fs.readFileSync(FEIRAS_FILE, 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras: ${feiras.length}`);
    
    // Criar backup se não existir
    if (!fs.existsSync(BACKUP_FILE)) {
      fs.writeFileSync(BACKUP_FILE, feirasData);
      console.log(`💾 Backup criado: ${BACKUP_FILE}`);
    }
    
    // Carregar progresso anterior
    const progressoAnterior = carregarProgresso();
    let feirasAtualizadas = progressoAnterior ? progressoAnterior.feirasAtualizadas : [...feiras];
    let indiceInicial = progressoAnterior ? progressoAnterior.indiceAtual + 1 : 0;
    
    let sucessos = 0;
    let falhas = 0;
    let puladas = 0;
    
    console.log(`📍 Iniciando processamento a partir da feira ${indiceInicial + 1}`);
    
    for (let i = indiceInicial; i < feiras.length; i += BATCH_SIZE) {
      const lote = feiras.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (feiras ${i + 1} a ${Math.min(i + BATCH_SIZE, feiras.length)})`);
      
      const promises = lote.map(async (feira, index) => {
        const indiceGlobal = i + index;
        
        // Se já tem coordenadas, pular
        if (feira.latitude && feira.longitude) {
          console.log(`✅ Feira ${indiceGlobal + 1} já tem coordenadas: ${feira.latitude}, ${feira.longitude}`);
          puladas++;
          return feira;
        }
        
        console.log(`🔍 Processando feira ${indiceGlobal + 1}: ${feira.numeroFeira}`);
        
        let coords = null;
        
        // Tentar via CEP primeiro
        if (feira.cep) {
          coords = await getCoordsViaCEP(feira.cep);
        }
        
        // Se não conseguiu via CEP, tentar endereço direto
        if (!coords) {
          const enderecoCompleto = `${feira.endereco}, ${feira.bairro}, São Paulo, SP, Brasil`;
          coords = await geocodeWithNominatim(enderecoCompleto);
        }
        
        if (coords) {
          console.log(`✅ Feira ${indiceGlobal + 1} geocodificada: ${coords.lat}, ${coords.lng}`);
          feirasAtualizadas[indiceGlobal] = {
            ...feira,
            latitude: coords.lat,
            longitude: coords.lng
          };
          sucessos++;
        } else {
          console.log(`❌ Feira ${indiceGlobal + 1} não pôde ser geocodificada`);
          feirasAtualizadas[indiceGlobal] = {
            ...feira,
            latitude: null,
            longitude: null
          };
          falhas++;
        }
        
        return feirasAtualizadas[indiceGlobal];
      });
      
      // Processar lote
      await Promise.all(promises);
      
      // Salvar progresso a cada lote
      salvarProgresso(i + BATCH_SIZE - 1, feirasAtualizadas);
      fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
      
      console.log(`💾 Progresso salvo (${i + BATCH_SIZE}/${feiras.length})`);
      
      // Aguardar entre lotes
      if (i + BATCH_SIZE < feiras.length) {
        console.log(`⏳ Aguardando ${DELAY_BETWEEN_BATCHES}ms antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Remover arquivo de progresso
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    
    // Estatísticas finais
    const finalComCoordenadas = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
    const finalSemCoordenadas = feirasAtualizadas.length - finalComCoordenadas;
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ❌ Falhas: ${falhas}`);
    console.log(`   ⏭️ Puladas: ${puladas}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);
    console.log(`   🎯 Total com coordenadas: ${finalComCoordenadas}/${feiras.length} (${((finalComCoordenadas / feiras.length) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.log('💾 Progresso salvo. Execute novamente para continuar de onde parou.');
  }
}

// Executar
processarFeirasOtimizado();


