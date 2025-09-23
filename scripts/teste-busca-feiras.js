const { feirasLocalService } = require('../src/lib/services/feirasLocal.service.ts');

async function testarBuscaFeiras() {
  try {
    console.log('🧪 Testando busca de feiras...');
    
    // Coordenadas do centro de São Paulo
    const lat = -23.5505;
    const lng = -46.6333;
    const raio = 5;
    
    console.log(`📍 Buscando feiras próximas a: ${lat}, ${lng} (raio: ${raio}km)`);
    
    const resultado = await feirasLocalService.buscarProximas(lat, lng, raio);
    
    console.log('\n📊 Resultado:');
    console.log(`   Total encontrado: ${resultado.total}`);
    console.log(`   Fonte: ${resultado.source}`);
    
    if (resultado.feiras.length > 0) {
      console.log('\n🛒 Primeiras feiras encontradas:');
      resultado.feiras.slice(0, 3).forEach((feira, index) => {
        console.log(`   ${index + 1}. Feira ${feira.numeroFeira} - ${feira.endereco}`);
        console.log(`      Distância: ${feira.distancia?.toFixed(2)} km`);
        console.log(`      Coordenadas: ${feira.latitude}, ${feira.longitude}`);
      });
    } else {
      console.log('\n❌ Nenhuma feira encontrada');
      
      // Verificar quantas feiras têm coordenadas
      const todasFeiras = feirasLocalService.getTodasFeiras();
      const comCoords = todasFeiras.filter(f => f.latitude && f.longitude);
      const ativas = todasFeiras.filter(f => f.ativo);
      const ativasComCoords = todasFeiras.filter(f => f.ativo && f.latitude && f.longitude);
      
      console.log('\n📈 Estatísticas:');
      console.log(`   Total de feiras: ${todasFeiras.length}`);
      console.log(`   Feiras ativas: ${ativas.length}`);
      console.log(`   Feiras com coordenadas: ${comCoords.length}`);
      console.log(`   Feiras ativas com coordenadas: ${ativasComCoords.length}`);
      
      if (ativasComCoords.length > 0) {
        console.log('\n📍 Primeiras feiras com coordenadas:');
        ativasComCoords.slice(0, 5).forEach((feira, index) => {
          const distancia = Math.sqrt(
            Math.pow(feira.latitude - lat, 2) + Math.pow(feira.longitude - lng, 2)
          ) * 111; // Aproximação grosseira
          console.log(`   ${index + 1}. Feira ${feira.numeroFeira} - Distância: ${distancia.toFixed(2)} km`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarBuscaFeiras();


