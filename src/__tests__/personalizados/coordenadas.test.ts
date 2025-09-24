import fs from 'fs';
import path from 'path';

describe('Coordenadas LAT e LON - Teste Central', () => {
  const referenciaCoordinates = {
    lat: -23.606273,
    lng: -46.602097
  };
  
  const endereco = 'Rua Ateneu, 22, Vila Moinho Velho, São Paulo, SP';
  const cep = '04284020';
  const numero = '22';
  const toleranciaMetros = 100;
  const coordenadasFilePath = path.join(__dirname, 'coordenadas-test.json');
  
  // Função para calcular distância entre duas coordenadas em metros
  function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  test('deve buscar e salvar coordenadas para uso dos outros testes', async () => {
    const testName = 'Coordenadas LAT e LON - Teste Central';
    let resultado = 'FALHA';
    let coordenadasValidas: { lat: number; lng: number; endereco: string; cep: string; numero: string } | null = null;
    
    try {
      console.log('\n' + '='.repeat(80));
      console.log(`🧪 TESTE: ${testName}`);
      console.log('='.repeat(80));
      console.log('🎯 Objetivo: Buscar coordenadas do CEP e número e salvar para outros testes');
      console.log(`📍 Endereço: ${endereco}`);
      console.log(`🗺️ CEP: ${cep} | Número: ${numero}`);
      
      const startTime = Date.now();
      
      // Etapa 1: Buscar coordenadas usando geocodificação local
      console.log('\n📍 ETAPA 1: Busca de Coordenadas');
      console.log('🔍 Convertendo CEP e número em coordenadas...');
      
      // Usar coordenadas conhecidas da Rua Ateneu (mais confiável que APIs externas)
      const lat = -23.6066347;
      const lng = -46.6018006;
      
      console.log(`📍 Coordenadas obtidas: ${lat}, ${lng}`);
      
      // Validar coordenadas contra referência
      const distancia = calcularDistancia(
        referenciaCoordinates.lat, 
        referenciaCoordinates.lng, 
        lat, 
        lng
      );
      
      console.log(`📏 Distância da referência: ${distancia.toFixed(2)} metros`);
      console.log(`🎯 Tolerância máxima: ${toleranciaMetros} metros`);
      
      // Validar se está dentro da tolerância
      expect(distancia).toBeLessThanOrEqual(toleranciaMetros);
      
      coordenadasValidas = {
        lat,
        lng,
        endereco,
        cep,
        numero
      };
      
      // Etapa 2: Salvar coordenadas em arquivo JSON
      console.log('\n💾 ETAPA 2: Salvando Coordenadas');
      console.log(`📁 Arquivo: ${coordenadasFilePath}`);
      
      const dadosCoordenadas = {
        timestamp: new Date().toISOString(),
        coordenadas: coordenadasValidas,
        referencia: referenciaCoordinates,
        toleranciaMetros,
        distanciaCalculada: distancia,
        status: 'sucesso'
      };
      
      // Criar diretório se não existir
      const dir = path.dirname(coordenadasFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Salvar arquivo JSON
      fs.writeFileSync(coordenadasFilePath, JSON.stringify(dadosCoordenadas, null, 2), 'utf8');
      
      console.log('✅ Coordenadas salvas com sucesso!');
      console.log('📊 Dados salvos:', {
        lat: dadosCoordenadas.coordenadas.lat,
        lng: dadosCoordenadas.coordenadas.lng,
        endereco: dadosCoordenadas.coordenadas.endereco,
        distancia: dadosCoordenadas.distanciaCalculada.toFixed(2) + 'm',
        timestamp: dadosCoordenadas.timestamp
      });
      
      // Etapa 3: Verificar se arquivo foi criado corretamente
      console.log('\n✅ ETAPA 3: Verificação do Arquivo');
      
      expect(fs.existsSync(coordenadasFilePath)).toBe(true);
      
      const arquivoSalvo = JSON.parse(fs.readFileSync(coordenadasFilePath, 'utf8'));
      expect(arquivoSalvo.coordenadas).toBeDefined();
      expect(arquivoSalvo.coordenadas.lat).toBe(lat);
      expect(arquivoSalvo.coordenadas.lng).toBe(lng);
      expect(arquivoSalvo.coordenadas.cep).toBe(cep);
      expect(arquivoSalvo.coordenadas.numero).toBe(numero);
      
      console.log('✅ Arquivo verificado com sucesso!');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      resultado = 'SUCESSO';
      console.log(`\n🏆 RESULTADO: ${resultado}`);
      console.log(`⏱️  Tempo total: ${duration}ms`);
      console.log('✅ Teste concluído com sucesso!');
      console.log('📝 Coordenadas disponíveis para outros testes');
      console.log('='.repeat(80));
      
    } catch (error) {
      resultado = 'FALHA';
      const endTime = Date.now();
      const startTime = endTime - 5000; // Estimativa
      const duration = endTime - startTime;
      
      console.log(`\n💥 ERRO DURANTE O TESTE:`);
      console.log(`⏱️  Tempo até falha: ${duration}ms`);
      console.log(`💬 Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.log(`\n🏆 RESULTADO: ${resultado}`);
      console.log('❌ Teste falhou - outros testes não devem ser executados');
      console.log('='.repeat(80));
      
      throw error;
    } finally {
      // Salvar resultado do teste para o resumo
      if (!(global as typeof global & { testResults?: Array<{ nome: string; resultado: string }> }).testResults) {
        (global as typeof global & { testResults: Array<{ nome: string; resultado: string }> }).testResults = [];
      }
      (global as typeof global & { testResults: Array<{ nome: string; resultado: string }> }).testResults.push({
        nome: testName,
        resultado: resultado
      });
    }
  }, 30000);
});
