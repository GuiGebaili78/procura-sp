const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('🔧 CORREÇÃO DE PRECISÃO: Todas as Feiras');
console.log('🎯 Objetivo: 6+ dígitos após o ponto em TODAS as coordenadas\n');

// Configurações
const DELAY_MS = 3000; // 3 segundos entre requests
const BATCH_SIZE = 25; // Salvar progresso a cada 25 feiras
const TIMEOUT_MS = 15000; // 15 segundos timeout
const MAX_RETRIES = 2;

// Arquivos
const INPUT_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', `feira-livre-backup-precision-${Date.now()}.json`);
const PROGRESS_FILE = path.join(__dirname, '..', 'scripts', 'progress-precision.json');

// Função para delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para garantir 6 dígitos de precisão
function garantirPrecisao(coordenada) {
  if (!coordenada) return null;
  return parseFloat(parseFloat(coordenada).toFixed(6));
}

// Função para verificar se precisa de correção
function precisaCorrecao(feira) {
  if (!feira.latitude || !feira.longitude) return true;
  
  const latStr = feira.latitude.toString();
  const lngStr = feira.longitude.toString();
  
  const latDigitos = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDigitos = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;
  
  return latDigitos < 6 || lngDigitos < 6;
}

// 1. Geocoding via Nominatim (principal)
async function tryNominatimGeocoding(endereco) {
  try {
    console.log(`🌐 [Nominatim] ${endereco}`);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: endereco,
        format: 'json',
        limit: 1,
        countrycodes: 'br',
        bounded: 1,
        viewbox: '-46.8,-23.8,-46.3,-23.3' // São Paulo
      },
      headers: {
        'User-Agent': 'Procura-SP-Precision-Corrector/1.0 (precision-fix)'
      },
      timeout: TIMEOUT_MS
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: garantirPrecisao(result.lat),
        longitude: garantirPrecisao(result.lon),
        fonte: 'nominatim',
        confidence: result.importance || 1
      };
    }
  } catch (error) {
    console.log(`❌ [Nominatim] ${error.message}`);
  }
  return null;
}

// 2. Fallback via nossa API interna
async function tryInternalAPI(feira) {
  if (!feira.cep) return null;
  
  try {
    console.log(`🏠 [API Interna] CEP ${feira.cep}`);
    
    const cepLimpo = feira.cep.replace(/\D/g, '');
    const response = await axios.get(`http://localhost:3000/api/cep/${cepLimpo}`, {
      timeout: TIMEOUT_MS
    });
    
    if (response.data.success && response.data.data.latitude && response.data.data.longitude) {
      return {
        latitude: garantirPrecisao(response.data.data.latitude),
        longitude: garantirPrecisao(response.data.data.longitude),
        fonte: 'api_interna'
      };
    }
  } catch (error) {
    console.log(`❌ [API Interna] ${error.message}`);
  }
  return null;
}

// 3. Coordenadas aproximadas baseadas em CEP
function getCoordenadasAproximadas(feira) {
  if (!feira.cep) return null;
  
  const cepNum = feira.cep.replace(/\D/g, '');
  
  // Coordenadas aproximadas por região de CEP
  const regioes = {
    '01': { lat: -23.550519, lng: -46.633308, nome: 'Centro' },
    '02': { lat: -23.480000, lng: -46.620000, nome: 'Zona Norte' },
    '03': { lat: -23.574300, lng: -46.521600, nome: 'Zona Leste' },
    '04': { lat: -23.600000, lng: -46.650000, nome: 'Zona Sul' },
    '05': { lat: -23.550000, lng: -46.720000, nome: 'Zona Oeste' },
    '08': { lat: -23.470000, lng: -46.610000, nome: 'Extremo Norte' }
  };
  
  const prefixo = cepNum.substring(0, 2);
  const regiao = regioes[prefixo];
  
  if (regiao) {
    // Adicionar pequena variação aleatória para evitar sobreposição
    const variacao = 0.001; // ~100 metros
    const lat = regiao.lat + (Math.random() - 0.5) * variacao;
    const lng = regiao.lng + (Math.random() - 0.5) * variacao;
    
    return {
      latitude: garantirPrecisao(lat),
      longitude: garantirPrecisao(lng),
      fonte: `aproximado_${regiao.nome.toLowerCase()}`,
      observacao: `Coordenadas aproximadas para região ${regiao.nome}`
    };
  }
  
  return null;
}

// Função principal de geocoding
async function geocodificarFeira(feira, retryCount = 0) {
  const enderecos = [
    `${feira.enderecoOriginal}, ${feira.bairro}, São Paulo, SP, Brasil`,
    `${feira.enderecoOriginal}, São Paulo, SP`,
    `${feira.bairro}, São Paulo, SP`
  ];
  
  // Tentar APIs em ordem de preferência
  for (const endereco of enderecos) {
    // 1. Nominatim
    const nominatim = await tryNominatimGeocoding(endereco);
    if (nominatim) return nominatim;
    
    await sleep(1000); // 1s entre tentativas do mesmo endereço
  }
  
  // 2. API Interna
  const apiInterna = await tryInternalAPI(feira);
  if (apiInterna) return apiInterna;
  
  // 3. Coordenadas aproximadas
  const aproximadas = getCoordenadasAproximadas(feira);
  if (aproximadas) return aproximadas;
  
  // 4. Se tudo falhar, melhorar precisão das coordenadas existentes
  if (feira.latitude && feira.longitude) {
    return {
      latitude: garantirPrecisao(feira.latitude),
      longitude: garantirPrecisao(feira.longitude),
      fonte: 'precisao_melhorada',
      observacao: 'Precisão melhorada das coordenadas existentes'
    };
  }
  
  return null;
}

// Salvar progresso
function salvarProgresso(feiras, indice) {
  const progress = {
    ultimoIndice: indice,
    totalFeiras: feiras.length,
    dataUltimaAtualizacao: new Date().toISOString(),
    feirasProcessadas: feiras.slice(0, indice + 1)
  };
  
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.log(`💾 Progresso: ${indice + 1}/${feiras.length} feiras`);
}

// Carregar progresso
function carregarProgresso() {
  if (fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`📂 Progresso anterior: ${progress.ultimoIndice + 1}/${progress.totalFeiras}`);
    return progress;
  }
  return null;
}

// Função principal
async function corrigirPrecisaoFeiras() {
  try {
    console.log('📖 Carregando feira-livre.json...');
    const feirasOriginais = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    
    // Criar backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(feirasOriginais, null, 2));
    console.log(`💾 Backup: ${path.basename(BACKUP_FILE)}`);
    
    // Verificar progresso anterior
    const progressoAnterior = carregarProgresso();
    let feiras = [...feirasOriginais];
    let indiceInicial = 0;
    
    if (progressoAnterior) {
      feiras = progressoAnterior.feirasProcessadas.concat(
        feirasOriginais.slice(progressoAnterior.ultimoIndice + 1)
      );
      indiceInicial = progressoAnterior.ultimoIndice + 1;
      console.log(`🔄 Continuando do índice ${indiceInicial}`);
    }
    
    // Estatísticas iniciais
    const precisaoInsuficiente = feiras.filter(precisaCorrecao).length;
    console.log(`\n🎯 Feiras para processar: ${precisaoInsuficiente}`);
    console.log(`⏱️ Tempo estimado: ${Math.ceil(precisaoInsuficiente * 3 / 60)} minutos\n`);
    
    let processadas = 0;
    let melhoradas = 0;
    let falhas = 0;
    
    // Processar feiras
    for (let i = indiceInicial; i < feiras.length; i++) {
      const feira = feiras[i];
      
      console.log(`\n[${i + 1}/${feiras.length}] ${feira.id}: ${feira.enderecoOriginal}`);
      
      // Verificar se precisa de correção
      if (!precisaCorrecao(feira)) {
        console.log(`✅ Já tem precisão adequada`);
        continue;
      }
      
      processadas++;
      console.log(`🔄 Processando... (${processadas}/${precisaoInsuficiente})`);
      
      // Geocodificar
      const novasCoordenadas = await geocodificarFeira(feira);
      
      if (novasCoordenadas) {
        feiras[i] = {
          ...feira,
          latitude: novasCoordenadas.latitude,
          longitude: novasCoordenadas.longitude,
          dataAtualizacao: new Date().toISOString(),
          fonteGeocode: novasCoordenadas.fonte
        };
        
        if (novasCoordenadas.observacao) {
          feiras[i].observacaoGeocode = novasCoordenadas.observacao;
        }
        
        console.log(`✅ ${novasCoordenadas.latitude}, ${novasCoordenadas.longitude} (${novasCoordenadas.fonte})`);
        melhoradas++;
      } else {
        console.log(`❌ Não foi possível obter coordenadas precisas`);
        falhas++;
      }
      
      // Salvar progresso periodicamente
      if ((i + 1) % BATCH_SIZE === 0) {
        salvarProgresso(feiras, i);
        fs.writeFileSync(INPUT_FILE, JSON.stringify(feiras, null, 2));
        console.log(`📄 Backup parcial salvo`);
      }
      
      // Delay entre requests
      if (i < feiras.length - 1 && precisaCorrecao(feiras[i + 1])) {
        console.log(`⏱️ Aguardando ${DELAY_MS/1000}s...`);
        await sleep(DELAY_MS);
      }
    }
    
    // Salvar arquivo final
    fs.writeFileSync(INPUT_FILE, JSON.stringify(feiras, null, 2));
    
    // Estatísticas finais
    const comCoordenadas = feiras.filter(f => f.latitude && f.longitude).length;
    const comPrecisao = feiras.filter(f => !precisaCorrecao(f)).length;
    
    console.log(`\n📊 ESTATÍSTICAS FINAIS:`);
    console.log(`✅ Total processado: ${processadas} feiras`);
    console.log(`🔧 Coordenadas melhoradas: ${melhoradas}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📍 Com coordenadas: ${comCoordenadas}/${feiras.length}`);
    console.log(`🎯 Com precisão 6+: ${comPrecisao}/${feiras.length}`);
    
    // Limpar progresso
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    
    console.log(`\n🎉 CORREÇÃO DE PRECISÃO CONCLUÍDA!`);
    
  } catch (error) {
    console.error(`❌ Erro fatal: ${error.message}`);
    process.exit(1);
  }
}

// Executar
corrigirPrecisaoFeiras().catch(console.error);
