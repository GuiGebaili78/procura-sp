const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração super otimizada
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-backup.json');

const BATCH_SIZE = 20; // Lotes muito maiores
const DELAY_BETWEEN_REQUESTS = 200; // 0.2 segundos entre requisições
const DELAY_BETWEEN_BATCHES = 500; // 0.5 segundos entre lotes

/**
 * Função para obter coordenadas via ViaCEP
 */
async function getCoordsViaCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 2000
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
 * Função para geocoding com Nominatim (super rápida)
 */
async function geocodeWithNominatim(endereco) {
  try {
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: endereco,
        format: 'json',
        limit: 1,
        countrycodes: 'br'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProcuraSP/1.0)'
      },
      timeout: 3000
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
    return null;
  }
}

/**
 * Função para processar feiras super rapidamente
 */
async function processarFeirasSuperRapido() {
  try {
    console.log('🚀 Iniciando geocoding SUPER RÁPIDO das feiras...');
    
    // Ler arquivo
    const feirasData = fs.readFileSync(FEIRAS_FILE, 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras: ${feiras.length}`);
    
    // Criar backup se não existir
    if (!fs.existsSync(BACKUP_FILE)) {
      fs.writeFileSync(BACKUP_FILE, feirasData);
      console.log(`💾 Backup criado: ${BACKUP_FILE}`);
    }
    
    const feirasAtualizadas = [...feiras];
    let sucessos = 0;
    let falhas = 0;
    let puladas = 0;
    
    // Processar em lotes grandes
    for (let i = 0; i < feiras.length; i += BATCH_SIZE) {
      const lote = feiras.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (feiras ${i + 1} a ${Math.min(i + BATCH_SIZE, feiras.length)})`);
      
      const promises = lote.map(async (feira, index) => {
        const indiceGlobal = i + index;
        
        // Se já tem coordenadas, pular
        if (feira.latitude && feira.longitude) {
          puladas++;
          return feira;
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
          feirasAtualizadas[indiceGlobal] = {
            ...feira,
            latitude: coords.lat,
            longitude: coords.lng
          };
          sucessos++;
        } else {
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
      
      // Salvar progresso
      fs.writeFileSync(FEIRAS_FILE, JSON.stringify(feirasAtualizadas, null, 2));
      
      const processadas = Math.min(i + BATCH_SIZE, feiras.length);
      const comCoords = feirasAtualizadas.filter(f => f.latitude && f.longitude).length;
      console.log(`💾 Progresso: ${processadas}/${feiras.length} (${comCoords} com coordenadas)`);
      
      // Aguardar entre lotes
      if (i + BATCH_SIZE < feiras.length) {
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
processarFeirasSuperRapido();


