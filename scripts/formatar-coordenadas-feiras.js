const fs = require('fs');
const path = require('path');

// Configurações
const FEIRAS_FILE = path.join(__dirname, '../public/dados/feira-livre.json');
const BACKUP_FILE = path.join(__dirname, '../public/dados/feira-livre-backup-antes-formatacao.json');

class FormatadorCoordenadas {
  constructor() {
    this.feiras = [];
    this.stats = {
      total: 0,
      comCoordenadas: 0,
      semCoordenadas: 0,
      formatadas: 0,
      erros: 0
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
    console.log(`📍 ${this.stats.comCoordenadas} têm coordenadas`);
    console.log(`❌ ${this.stats.semCoordenadas} sem coordenadas`);
  }

  async fazerBackup() {
    console.log('💾 Fazendo backup antes da formatação...');
    fs.copyFileSync(FEIRAS_FILE, BACKUP_FILE);
    console.log(`✅ Backup salvo em: ${BACKUP_FILE}`);
  }

  formatarCoordenada(valor, tipo) {
    if (valor === null || valor === undefined) {
      return null;
    }

    // Converter para número se for string
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    // Verificar se é um número válido
    if (isNaN(numero)) {
      console.warn(`⚠️ ${tipo} inválida: ${valor}`);
      return null;
    }

    // Verificar se está dentro dos limites geográficos de São Paulo
    if (tipo === 'latitude' && (numero < -24.5 || numero > -23.0)) {
      console.warn(`⚠️ Latitude fora dos limites de SP: ${numero}`);
      return null;
    }
    
    if (tipo === 'longitude' && (numero < -47.5 || numero > -46.0)) {
      console.warn(`⚠️ Longitude fora dos limites de SP: ${numero}`);
      return null;
    }

    // Formatar com 6 casas decimais
    return parseFloat(numero.toFixed(6));
  }

  async formatarCoordenadas() {
    console.log('🔧 Iniciando formatação das coordenadas...');
    
    for (let i = 0; i < this.feiras.length; i++) {
      const feira = this.feiras[i];
      
      try {
        let coordenadasAlteradas = false;
        
        // Formatar latitude
        if (feira.latitude !== null && feira.latitude !== undefined) {
          const latFormatada = this.formatarCoordenada(feira.latitude, 'latitude');
          if (latFormatada !== feira.latitude) {
            feira.latitude = latFormatada;
            coordenadasAlteradas = true;
          }
        }
        
        // Formatar longitude
        if (feira.longitude !== null && feira.longitude !== undefined) {
          const lngFormatada = this.formatarCoordenada(feira.longitude, 'longitude');
          if (lngFormatada !== feira.longitude) {
            feira.longitude = lngFormatada;
            coordenadasAlteradas = true;
          }
        }
        
        if (coordenadasAlteradas) {
          this.stats.formatadas++;
          feira.dataAtualizacao = new Date().toISOString();
        }
        
        // Progresso a cada 100 feiras
        if ((i + 1) % 100 === 0) {
          console.log(`📈 Progresso: ${i + 1}/${this.feiras.length} (${((i + 1) / this.feiras.length * 100).toFixed(1)}%)`);
        }
        
      } catch (error) {
        console.error(`💥 Erro ao formatar feira ${feira.numeroFeira}:`, error.message);
        this.stats.erros++;
      }
    }
  }

  async salvarResultado() {
    console.log('💾 Salvando resultado formatado...');
    fs.writeFileSync(FEIRAS_FILE, JSON.stringify(this.feiras, null, 2));
    console.log('✅ Resultado salvo');
  }

  exibirEstatisticas() {
    console.log('\n📊 ESTATÍSTICAS DA FORMATAÇÃO:');
    console.log(`Total de feiras: ${this.stats.total}`);
    console.log(`Com coordenadas: ${this.stats.comCoordenadas}`);
    console.log(`Sem coordenadas: ${this.stats.semCoordenadas}`);
    console.log(`Coordenadas formatadas: ${this.stats.formatadas}`);
    console.log(`Erros: ${this.stats.erros}`);
  }

  verificarPrecisaoFinal() {
    console.log('\n🔍 Verificando precisão final...');
    const precisaoLat = {};
    const precisaoLng = {};
    
    this.feiras.filter(f => f.latitude && f.longitude).forEach(f => {
      const latDec = f.latitude.toString().split('.')[1]?.length || 0;
      const lngDec = f.longitude.toString().split('.')[1]?.length || 0;
      precisaoLat[latDec] = (precisaoLat[latDec] || 0) + 1;
      precisaoLng[lngDec] = (precisaoLng[lngDec] || 0) + 1;
    });
    
    console.log('Precisão das latitudes (casas decimais):', precisaoLat);
    console.log('Precisão das longitudes (casas decimais):', precisaoLng);
  }

  async executar() {
    try {
      await this.carregarFeiras();
      await this.fazerBackup();
      await this.formatarCoordenadas();
      await this.salvarResultado();
      this.exibirEstatisticas();
      this.verificarPrecisaoFinal();
    } catch (error) {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const formatador = new FormatadorCoordenadas();
  formatador.executar();
}

module.exports = FormatadorCoordenadas;


