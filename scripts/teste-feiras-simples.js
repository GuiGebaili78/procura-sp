const fs = require('fs');
const path = require('path');

// Função para calcular distância (aproximada)
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function testarFeiras() {
  try {
    console.log('🧪 Testando busca de feiras...');
    
    // Ler arquivo de feiras
    const feirasData = fs.readFileSync(path.join(__dirname, '..', 'public', 'dados', 'feira-livre.json'), 'utf8');
    const feiras = JSON.parse(feirasData);
    
    console.log(`📊 Total de feiras: ${feiras.length}`);
    
    // Coordenadas do centro de São Paulo
    const lat = -23.5505;
    const lng = -46.6333;
    const raio = 5;
    
    console.log(`📍 Buscando feiras próximas a: ${lat}, ${lng} (raio: ${raio}km)`);
    
    // Filtrar feiras com coordenadas e ativas
    const feirasComCoords = feiras.filter(feira => 
      feira.latitude && 
      feira.longitude && 
      feira.ativo
    );
    
    console.log(`📈 Feiras com coordenadas e ativas: ${feirasComCoords.length}`);
    
    if (feirasComCoords.length === 0) {
      console.log('❌ Nenhuma feira com coordenadas encontrada!');
      
      // Verificar estatísticas
      const comCoords = feiras.filter(f => f.latitude && f.longitude).length;
      const ativas = feiras.filter(f => f.ativo).length;
      
      console.log('\n📊 Estatísticas:');
      console.log(`   Total de feiras: ${feiras.length}`);
      console.log(`   Feiras ativas: ${ativas}`);
      console.log(`   Feiras com coordenadas: ${comCoords}`);
      
      return;
    }
    
    // Calcular distâncias e filtrar
    const feirasProximas = feirasComCoords
      .map(feira => ({
        ...feira,
        distancia: calcularDistancia(lat, lng, feira.latitude, feira.longitude)
      }))
      .filter(feira => feira.distancia <= raio)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 10);
    
    console.log(`\n✅ Feiras próximas encontradas: ${feirasProximas.length}`);
    
    if (feirasProximas.length > 0) {
      console.log('\n🛒 Primeiras feiras encontradas:');
      feirasProximas.forEach((feira, index) => {
        console.log(`   ${index + 1}. Feira ${feira.numeroFeira}`);
        console.log(`      Endereço: ${feira.endereco}`);
        console.log(`      Bairro: ${feira.bairro}`);
        console.log(`      Distância: ${feira.distancia.toFixed(2)} km`);
        console.log(`      Coordenadas: ${feira.latitude}, ${feira.longitude}`);
        console.log('');
      });
    } else {
      console.log('\n❌ Nenhuma feira encontrada no raio de 5km');
      
      // Mostrar as feiras mais próximas
      const todasComDistancia = feirasComCoords
        .map(feira => ({
          ...feira,
          distancia: calcularDistancia(lat, lng, feira.latitude, feira.longitude)
        }))
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, 5);
      
      console.log('\n📍 Feiras mais próximas (fora do raio):');
      todasComDistancia.forEach((feira, index) => {
        console.log(`   ${index + 1}. Feira ${feira.numeroFeira} - ${feira.distancia.toFixed(2)} km`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarFeiras();


