const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração estável e confiável
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-backup.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-progress.json');

const BATCH_SIZE = 5; // Lotes pequenos para estabilidade
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requisições
const DELAY_BETWEEN_BATCHES = 5000; // 5 segundos entre lotes
const MAX_RETRIES = 2; // Máximo de tentativas

/**
 * Função para obter coordenadas via ViaCEP
 */
async function getCoordsViaCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 10000
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
 * Função para geocoding com Nominatim (estável)
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
      timeout: 15000
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
      console.log(`⚠️ Tentativa ${retryCount + 1} falhou, tentando novamente em ${(retryCount + 1) * 3} segundos...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 3000));
      return geocodeWithNominatim(endereco, retryCount + 1);
    }
    
    console.warn(`❌ Erro no geocoding após ${MAX_RETRIES} tentativas: ${error.message}`);
    return null;
  }
}

/**
 * Função para salvar progresso
 */
function salvarProgresso(indiceAtual, feirasAtualizadas, sucessos, falhas, puladas) {
  const progresso = {
    indiceAtual,
    feirasAtualizadas,
    sucessos,
    falhas,
    puladas,
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
      console.log(`📊 Sucessos: ${progresso.sucessos}, Falhas: ${progresso.falhas}, Puladas: ${progresso.puladas}`);
      return progresso;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar progresso:', error.message);
  }
  return null;
}

/**
 * Função para processar uma feira
 */
async function processarFeira(feira, indice) {
  // Se já tem coordenadas, retornar
  if (feira.latitude && feira.longitude) {
    console.log(`⏭️ Feira ${indice + 1} já tem coordenadas: ${feira.latitude}, ${feira.longitude}`);
    return { ...feira, processada: true, pulada: true };
  }
  
  console.log(`🔍 Processando feira ${indice + 1}: ${feira.numeroFeira}`);
  console.log(`   Endereço: ${feira.endereco}`);
  console.log(`   Bairro: ${feira.bairro}`);
  console.log(`   CEP: ${feira.cep}`);
  
  let coords = null;
  
  // Tentar via CEP primeiro
  if (feira.cep) {
    console.log(`   🔍 Tentando via CEP...`);
    coords = await getCoordsViaCEP(feira.cep);
  }
  
  // Se não conseguiu via CEP, tentar endereço direto
  if (!coords) {
    console.log(`   🔍 Tentando via endereço direto...`);
    const enderecoCompleto = `${feira.endereco}, ${feira.bairro}, São Paulo, SP, Brasil`;
    coords = await geocodeWithNominatim(enderecoCompleto);
  }
  
  if (coords) {
    console.log(`   ✅ Coordenadas encontradas: ${coords.lat}, ${coords.lng}`);
    return {
      ...feira,
      latitude: coords.lat,
      longitude: coords.lng,
      processada: true,
      sucesso: true
    };
  } else {
    console.log(`   ❌ Não foi possível obter coordenadas`);
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
 * Função principal
 */
async function processarFeirasEstavel() {
  try {
    console.log('🚀 Iniciando geocoding estável das feiras...');
    
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
    let sucessos = progressoAnterior ? progressoAnterior.sucessos : 0;
    let falhas = progressoAnterior ? progressoAnterior.falhas : 0;
    let puladas = progressoAnterior ? progressoAnterior.puladas : 0;
    
    console.log(`📍 Iniciando processamento a partir da feira ${indiceInicial + 1}`);
    
    // Processar feiras sequencialmente para estabilidade
    for (let i = indiceInicial; i < feiras.length; i++) {
      const feira = feiras[i];
      
      console.log(`\n📦 Processando feira ${i + 1}/${feiras.length}`);
      
      const resultado = await processarFeira(feira, i);
      feirasAtualizadas[i] = resultado;
      
      if (resultado.sucesso) sucessos++;
      else if (resultado.pulada) puladas++;
      else falhas++;
      
      // Salvar progresso a cada 10 feiras
      if ((i + 1) % 10 === 0) {
        salvarProgresso(i, feirasAtualizadas, sucessos, falhas, puladas);
        fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
        
        const comCoords = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
        console.log(`💾 Progresso salvo: ${i + 1}/${feiras.length} (${comCoords} com coordenadas)`);
        console.log(`📊 Sucessos: ${sucessos}, Falhas: ${falhas}, Puladas: ${puladas}`);
      }
      
      // Aguardar entre feiras para não sobrecarregar
      if (i < feiras.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Remover arquivo de progresso
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    
    // Salvar arquivo final
    fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
    
    // Estatísticas finais
    const finalComCoordenadas = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
    const finalSemCoordenadas = feirasAtualizadas.length - finalComCoordenadas;
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📊 Estatísticas finais:`);
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
processarFeirasEstavel();


