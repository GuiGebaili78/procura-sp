const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração otimizada para processamento paralelo
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-backup.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-progress.json');

const BATCH_SIZE = 5; // Lotes de 5 feiras
const PARALLEL_BATCHES = 2; // 2 lotes em paralelo
const DELAY_BETWEEN_REQUESTS = 1000; // 1 segundo entre requisições
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre lotes
const MAX_RETRIES = 2; // Máximo de tentativas

/**
 * Função para obter coordenadas via ViaCEP
 */
async function getCoordsViaCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 5000
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
        city: 'São Paulo'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProcuraSP/1.0)'
      },
      timeout: 8000
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
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return geocodeWithNominatim(endereco, retryCount + 1);
    }
    return null;
  }
}

/**
 * Função para processar uma feira
 */
async function processarFeira(feira, indice) {
  // Se já tem coordenadas, retornar
  if (feira.latitude && feira.longitude) {
    return { ...feira, processada: true, pulada: true };
  }
  
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
    return {
      ...feira,
      latitude: coords.lat,
      longitude: coords.lng,
      processada: true,
      sucesso: true
    };
  } else {
    return {
      ...feira,
      latitude: null,
      longitude: null,
      processada: true,
      sucesso: false
    };
  }
}

/**
 * Função para processar lote de feiras
 */
async function processarLote(feiras, indiceInicial) {
  const lote = feiras.slice(indiceInicial, indiceInicial + BATCH_SIZE);
  console.log(`📦 Processando lote (feiras ${indiceInicial + 1} a ${indiceInicial + lote.length})`);
  
  const resultados = [];
  
  for (let i = 0; i < lote.length; i++) {
    const feira = lote[i];
    const indiceGlobal = indiceInicial + i;
    
    console.log(`🔍 Feira ${indiceGlobal + 1}: ${feira.numeroFeira}`);
    
    const resultado = await processarFeira(feira, indiceGlobal);
    resultados.push(resultado);
    
    if (resultado.sucesso) {
      console.log(`✅ Coordenadas: ${resultado.latitude}, ${resultado.longitude}`);
    } else if (resultado.pulada) {
      console.log(`⏭️ Já tinha coordenadas`);
    } else {
      console.log(`❌ Não foi possível obter coordenadas`);
    }
  }
  
  return resultados;
}

/**
 * Função principal
 */
async function processarFeirasParalelo() {
  try {
    console.log('🚀 Iniciando geocoding paralelo das feiras...');
    
    // Ler arquivo
    const feirasData = fs.readFileSync(FEIRAS_FILE, 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras: ${feiras.length}`);
    
    // Criar backup se não existir
    if (!fs.existsSync(BACKUP_FILE)) {
      fs.writeFileSync(BACKUP_FILE, feirasData);
      console.log(`💾 Backup criado: ${BACKUP_FILE}`);
    }
    
    let feirasAtualizadas = [...feiras];
    let sucessos = 0;
    let falhas = 0;
    let puladas = 0;
    
    // Processar em lotes paralelos
    for (let i = 0; i < feiras.length; i += BATCH_SIZE * PARALLEL_BATCHES) {
      const lotes = [];
      
      // Criar lotes para processamento paralelo
      for (let j = 0; j < PARALLEL_BATCHES && (i + j * BATCH_SIZE) < feiras.length; j++) {
        const indiceLote = i + j * BATCH_SIZE;
        lotes.push(processarLote(feiras, indiceLote));
      }
      
      // Processar lotes em paralelo
      const resultadosLotes = await Promise.all(lotes);
      
      // Consolidar resultados
      for (const resultados of resultadosLotes) {
        for (const resultado of resultados) {
          const indice = feirasAtualizadas.findIndex(f => f.id === resultado.id);
          if (indice !== -1) {
            feirasAtualizadas[indice] = resultado;
            
            if (resultado.sucesso) sucessos++;
            else if (resultado.pulada) puladas++;
            else falhas++;
          }
        }
      }
      
      // Salvar progresso
      fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
      
      const processadas = i + (BATCH_SIZE * PARALLEL_BATCHES);
      console.log(`💾 Progresso: ${Math.min(processadas, feiras.length)}/${feiras.length} feiras processadas`);
      
      // Aguardar entre ciclos
      if (i + (BATCH_SIZE * PARALLEL_BATCHES) < feiras.length) {
        console.log(`⏳ Aguardando ${DELAY_BETWEEN_BATCHES}ms...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Estatísticas finais
    const finalComCoordenadas = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ❌ Falhas: ${falhas}`);
    console.log(`   ⏭️ Puladas: ${puladas}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);
    console.log(`   🎯 Total com coordenadas: ${finalComCoordenadas}/${feiras.length} (${((finalComCoordenadas / feiras.length) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
processarFeirasParalelo();


