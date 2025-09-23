const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configurações
const FEIRAS_FILE = path.join(__dirname, '../public/dados/feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '../public/dados/feira-livre-backup.json');
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre requisições
const BATCH_SIZE = 5; // Processar 5 feiras por vez

// APIs de geocoding (todas gratuitas)
const APIS = {
  opencage: {
    name: 'OpenCage',
    url: 'https://api.opencagedata.com/geocode/v1/json',
    key: 'YOUR_OPENCAGE_KEY', // Substitua pela sua chave gratuita
    limit: 2500 // Limite gratuito por dia
  },
  nominatim: {
    name: 'Nominatim',
    url: 'https://nominatim.openstreetmap.org/search',
    key: null, // Gratuito, sem chave
    limit: 1000 // Limite por hora
  },
  mapbox: {
    name: 'MapBox',
    url: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    key: 'YOUR_MAPBOX_KEY', // Substitua pela sua chave gratuita
    limit: 100000 // Limite gratuito por mês
  }
};

class GeocodingMultiAPIs {
  constructor() {
    this.feiras = [];
    this.stats = {
      total: 0,
      comCoordenadas: 0,
      semCoordenadas: 0,
      processadas: 0,
      sucessos: 0,
      falhas: 0,
      apisUsadas: {
        opencage: 0,
        nominatim: 0,
        mapbox: 0
      }
    };
  }

  async carregarFeiras() {
    console.log('📁 Carregando feiras...');
    
    if (!fs.existsSync(FEIRAS_FILE)) {
      throw new Error(`Arquivo não encontrado: ${FEIRAS_FILE}`);
    }

    const data = fs.readFileSync(FEIRAS_FILE, 'utf8');
    this.feiras = JSON.parse(data);
    
    this.stats.total = this.feiras.length;
    this.stats.comCoordenadas = this.feiras.filter(f => f.latitude && f.longitude).length;
    this.stats.semCoordenadas = this.stats.total - this.stats.comCoordenadas;
    
    console.log(`✅ ${this.stats.total} feiras carregadas`);
    console.log(`📍 ${this.stats.comCoordenadas} já têm coordenadas`);
    console.log(`❌ ${this.stats.semCoordenadas} precisam de coordenadas`);
  }

  async fazerBackup() {
    console.log('💾 Fazendo backup...');
    fs.copyFileSync(FEIRAS_FILE, BACKUP_FILE);
    console.log(`✅ Backup salvo em: ${BACKUP_FILE}`);
  }

  async geocodificarComOpenCage(endereco) {
    try {
      const response = await axios.get(APIS.opencage.url, {
        params: {
          q: endereco,
          key: APIS.opencage.key,
          limit: 1,
          countrycode: 'br',
          no_annotations: 1
        },
        timeout: 10000
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          api: 'opencage'
        };
      }
    } catch (error) {
      console.warn(`⚠️ OpenCage falhou: ${error.message}`);
    }
    return null;
  }

  async geocodificarComNominatim(endereco) {
    try {
      const response = await axios.get(APIS.nominatim.url, {
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          api: 'nominatim'
        };
      }
    } catch (error) {
      console.warn(`⚠️ Nominatim falhou: ${error.message}`);
    }
    return null;
  }

  async geocodificarComMapBox(endereco) {
    try {
      const response = await axios.get(`${APIS.mapbox.url}/${encodeURIComponent(endereco)}.json`, {
        params: {
          access_token: APIS.mapbox.key,
          country: 'BR',
          limit: 1
        },
        timeout: 10000
      });

      if (response.data.features && response.data.features.length > 0) {
        const result = response.data.features[0];
        return {
          lat: result.center[1],
          lng: result.center[0],
          api: 'mapbox'
        };
      }
    } catch (error) {
      console.warn(`⚠️ MapBox falhou: ${error.message}`);
    }
    return null;
  }

  async geocodificarEndereco(endereco) {
    console.log(`🔍 Geocodificando: ${endereco}`);
    
    // Tentar OpenCage primeiro
    let resultado = await this.geocodificarComOpenCage(endereco);
    if (resultado) {
      this.stats.apisUsadas.opencage++;
      return resultado;
    }

    // Tentar Nominatim
    resultado = await this.geocodificarComNominatim(endereco);
    if (resultado) {
      this.stats.apisUsadas.nominatim++;
      return resultado;
    }

    // Tentar MapBox
    resultado = await this.geocodificarComMapBox(endereco);
    if (resultado) {
      this.stats.apisUsadas.mapbox++;
      return resultado;
    }

    return null;
  }

  async processarFeiras() {
    console.log('🚀 Iniciando processamento...');
    
    const feirasSemCoordenadas = this.feiras.filter(f => !f.latitude || !f.longitude);
    console.log(`📊 Processando ${feirasSemCoordenadas.length} feiras sem coordenadas`);

    for (let i = 0; i < feirasSemCoordenadas.length; i += BATCH_SIZE) {
      const batch = feirasSemCoordenadas.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(feirasSemCoordenadas.length / BATCH_SIZE)}`);

      for (const feira of batch) {
        try {
          const endereco = `${feira.endereco}, ${feira.bairro}, São Paulo, SP, Brasil`;
          const coordenadas = await this.geocodificarEndereco(endereco);

          if (coordenadas) {
            feira.latitude = coordenadas.lat;
            feira.longitude = coordenadas.lng;
            feira.dataAtualizacao = new Date().toISOString();
            this.stats.sucessos++;
            console.log(`✅ ${feira.numeroFeira}: ${coordenadas.lat}, ${coordenadas.lng} (${coordenadas.api})`);
          } else {
            this.stats.falhas++;
            console.log(`❌ ${feira.numeroFeira}: Falha no geocoding`);
          }

          this.stats.processadas++;
          
          // Salvar progresso a cada 10 feiras
          if (this.stats.processadas % 10 === 0) {
            await this.salvarProgresso();
          }

        } catch (error) {
          console.error(`💥 Erro ao processar ${feira.numeroFeira}:`, error.message);
          this.stats.falhas++;
        }

        // Delay entre requisições
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }

      // Delay entre lotes
      console.log('⏳ Aguardando antes do próximo lote...');
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS * 2));
    }
  }

  async salvarProgresso() {
    console.log('💾 Salvando progresso...');
    fs.writeFileSync(FEIRAS_FILE, JSON.stringify(this.feiras, null, 2));
    console.log('✅ Progresso salvo');
  }

  async salvarResultadoFinal() {
    console.log('💾 Salvando resultado final...');
    fs.writeFileSync(FEIRAS_FILE, JSON.stringify(this.feiras, null, 2));
    console.log('✅ Resultado final salvo');
  }

  exibirEstatisticas() {
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log(`Total de feiras: ${this.stats.total}`);
    console.log(`Com coordenadas: ${this.stats.comCoordenadas}`);
    console.log(`Sem coordenadas: ${this.stats.semCoordenadas}`);
    console.log(`Processadas: ${this.stats.processadas}`);
    console.log(`Sucessos: ${this.stats.sucessos}`);
    console.log(`Falhas: ${this.stats.falhas}`);
    console.log('\nAPIs utilizadas:');
    console.log(`OpenCage: ${this.stats.apisUsadas.opencage}`);
    console.log(`Nominatim: ${this.stats.apisUsadas.nominatim}`);
    console.log(`MapBox: ${this.stats.apisUsadas.mapbox}`);
  }

  async executar() {
    try {
      await this.carregarFeiras();
      await this.fazerBackup();
      await this.processarFeiras();
      await this.salvarResultadoFinal();
      this.exibirEstatisticas();
    } catch (error) {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const geocoding = new GeocodingMultiAPIs();
  geocoding.executar();
}

module.exports = GeocodingMultiAPIs;


