const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração
const FEIRAS_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json');
const TESTE_FILE = path.join(__dirname, '..', 'public', 'dados', 'feira-livre-teste.json');

/**
 * Função para fazer geocoding de um endereço
 */
async function geocodeAddress(endereco) {
  try {
    console.log(`🔍 Geocodificando: ${endereco}`);
    
    // Aguardar 2 segundos entre requisições
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
    console.warn(`⚠️ Erro ao geocodificar ${endereco}:`, error.message);
    return null;
  }
}

/**
 * Função para testar geocoding com algumas feiras
 */
async function testarGeocoding() {
  try {
    console.log('🚀 Testando geocoding com algumas feiras...');
    
    // Ler arquivo de feiras
    const feirasData = fs.readFileSync(FEIRAS_FILE, 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras: ${feiras.length}`);
    
    // Pegar apenas as primeiras 10 feiras para teste
    const feirasTeste = feiras.slice(0, 10);
    console.log(`🧪 Testando com ${feirasTeste.length} feiras`);
    
    const feirasComCoordenadas = [];
    
    for (let i = 0; i < feirasTeste.length; i++) {
      const feira = feirasTeste[i];
      console.log(`\n📍 Processando feira ${i + 1}/${feirasTeste.length}: ${feira.numeroFeira}`);
      
      // Construir endereço completo
      const enderecoCompleto = `${feira.endereco}, ${feira.bairro}, São Paulo, SP, Brasil`;
      
      // Fazer geocoding
      const coords = await geocodeAddress(enderecoCompleto);
      
      if (coords) {
        console.log(`✅ Coordenadas encontradas: ${coords.lat}, ${coords.lng}`);
        feirasComCoordenadas.push({
          ...feira,
          latitude: coords.lat,
          longitude: coords.lng
        });
      } else {
        console.log(`❌ Não foi possível encontrar coordenadas`);
        feirasComCoordenadas.push({
          ...feira,
          latitude: null,
          longitude: null
        });
      }
    }
    
    // Salvar arquivo de teste
    fs.writeFileSync(TESTE_FILE, JSON.stringify(feirasComCoordenadas, null, 2));
    console.log(`\n💾 Arquivo de teste salvo em: ${TESTE_FILE}`);
    
    // Estatísticas
    const comCoordenadas = feirasComCoordenadas.filter(f => f.latitude && f.longitude).length;
    const semCoordenadas = feirasComCoordenadas.length - comCoordenadas;
    
    console.log(`\n📊 Resultados do teste:`);
    console.log(`   ✅ Feiras com coordenadas: ${comCoordenadas}`);
    console.log(`   ❌ Feiras sem coordenadas: ${semCoordenadas}`);
    console.log(`   📈 Taxa de sucesso: ${((comCoordenadas / feirasComCoordenadas.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testarGeocoding();


