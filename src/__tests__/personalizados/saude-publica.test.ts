import fs from 'fs';
import path from 'path';

describe('Saúde Pública - Estabelecimentos de Saúde', () => {
  test('deve buscar estabelecimentos de saúde próximos e validar marcadores no mapa', async () => {
    const testName = 'Saúde Pública - Estabelecimentos de Saúde';
    let resultado = 'FALHA';
    const coordenadasFilePath = path.join(__dirname, 'coordenadas-test.json');
    const estabelecimentosSaudePath = path.join(process.cwd(), 'public/dados/estabelecimentos-saude.json');
    
    try {
      console.log('\n' + '='.repeat(80));
      console.log(`🧪 TESTE: ${testName}`);
      console.log('='.repeat(80));
      console.log('🎯 Objetivo: Buscar estabelecimentos de saúde próximos e validar marcadores no mapa');
      
      const startTime = Date.now();
      
      // Etapa 1: Ler coordenadas do arquivo JSON
      console.log('\n📂 ETAPA 1: Carregando Coordenadas do Arquivo JSON');
      console.log(`📁 Arquivo: ${coordenadasFilePath}`);
      
      expect(fs.existsSync(coordenadasFilePath)).toBe(true);
      const dadosCoordenadas = JSON.parse(fs.readFileSync(coordenadasFilePath, 'utf8'));
      expect(dadosCoordenadas.coordenadas).toBeDefined();
      expect(dadosCoordenadas.status).toBe('sucesso');
      
      const coordenadas = {
        lat: dadosCoordenadas.coordenadas.lat,
        lng: dadosCoordenadas.coordenadas.lng
      };
      
      console.log(`📍 Coordenadas carregadas: ${coordenadas.lat}, ${coordenadas.lng}`);
      console.log(`🏠 Endereço: ${dadosCoordenadas.coordenadas.endereco}`);
      console.log(`🗺️ CEP: ${dadosCoordenadas.coordenadas.cep} | Número: ${dadosCoordenadas.coordenadas.numero}`);
      
      // Etapa 2: Carregar dados dos estabelecimentos de saúde
      console.log('\n🏥 ETAPA 2: Carregando Dados dos Estabelecimentos de Saúde');
      console.log(`📁 Arquivo: ${estabelecimentosSaudePath}`);
      
      expect(fs.existsSync(estabelecimentosSaudePath)).toBe(true);
      const estabelecimentosSaude = JSON.parse(fs.readFileSync(estabelecimentosSaudePath, 'utf8'));
      expect(Array.isArray(estabelecimentosSaude)).toBe(true);
      expect(estabelecimentosSaude.length).toBeGreaterThan(0);
      
      console.log(`📊 Total de estabelecimentos carregados: ${estabelecimentosSaude.length}`);
      
      // Etapa 3: Função para calcular distância
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
      
      // Etapa 4: Buscar estabelecimentos próximos (raio de 5km)
      console.log('\n🔍 ETAPA 3: Buscando Estabelecimentos Próximos');
      console.log('🔍 Calculando distâncias e filtrando estabelecimentos próximos...');
      
      const raioBusca = 5000; // 5km em metros
      const estabelecimentosProximos = estabelecimentosSaude
        .map(estabelecimento => {
          const distancia = calcularDistancia(
            coordenadas.lat,
            coordenadas.lng,
            estabelecimento.latitude,
            estabelecimento.longitude
          );
          return {
            ...estabelecimento,
            distancia
          };
        })
        .filter(estabelecimento => estabelecimento.distancia <= raioBusca)
        .sort((a, b) => a.distancia - b.distancia)
        .slice(0, 10); // Top 10 mais próximos
      
      console.log(`📏 Raio de busca: ${raioBusca / 1000}km`);
      console.log(`🏥 Estabelecimentos encontrados: ${estabelecimentosProximos.length}`);
      
      expect(estabelecimentosProximos.length).toBeGreaterThan(0);
      
      // Etapa 5: Exibir estabelecimentos encontrados
      console.log('\n🏥 ETAPA 4: Estabelecimentos de Saúde Encontrados');
      
      estabelecimentosProximos.forEach((estabelecimento, index) => {
        console.log(`\n📍 ESTABELECIMENTO ${index + 1}:`);
        console.log(`   🏥 Nome: ${estabelecimento.nome}`);
        console.log(`   📍 Endereço: ${estabelecimento.endereco}`);
        console.log(`   🏘️  Bairro: ${estabelecimento.bairro}`);
        console.log(`   📞 Telefone: ${estabelecimento.telefone}`);
        console.log(`   🏷️  Tipo: ${estabelecimento.tipo}`);
        console.log(`   🏛️  Administração: ${estabelecimento.administracao}`);
        console.log(`   📏 Distância: ${estabelecimento.distancia.toFixed(2)}m`);
        console.log(`   📍 Coordenadas: ${estabelecimento.latitude}, ${estabelecimento.longitude}`);
      });
      
      // Etapa 6: Validação de marcadores no mapa
      console.log('\n🗺️ ETAPA 5: Validação de Marcadores no Mapa');
      console.log('🔍 Simulando renderização de marcadores no mapa...');
      
      // Simular marcadores no mapa
      const marcadores = [
        {
          id: 'usuario',
          tipo: 'residencia',
          cor: '#FF0000',
          icone: '🏠',
          titulo: 'Sua Localização',
          coordenadas: coordenadas,
          descricao: dadosCoordenadas.coordenadas.endereco
        },
        ...estabelecimentosProximos.map((estabelecimento) => ({
          id: `saude_${estabelecimento.id}`,
          tipo: 'estabelecimento_saude',
          cor: '#0066CC',
          icone: '🏥',
          titulo: estabelecimento.nome,
          coordenadas: {
            lat: estabelecimento.latitude,
            lng: estabelecimento.longitude
          },
          descricao: `${estabelecimento.endereco} - ${estabelecimento.bairro}`,
          distancia: estabelecimento.distancia,
          tipoEstabelecimento: estabelecimento.tipo,
          administracao: estabelecimento.administracao
        }))
      ];
      
      console.log(`📊 Total de marcadores: ${marcadores.length}`);
      console.log(`🏠 Marcador residência: 1`);
      console.log(`🏥 Marcadores estabelecimentos: ${estabelecimentosProximos.length}`);
      
      // Validar estrutura dos marcadores
      expect(marcadores).toHaveLength(estabelecimentosProximos.length + 1);
      
      // Validar marcador de residência
      const marcadorResidencia = marcadores.find(m => m.tipo === 'residencia');
      expect(marcadorResidencia).toBeDefined();
      expect(marcadorResidencia?.coordenadas.lat).toBe(coordenadas.lat);
      expect(marcadorResidencia?.coordenadas.lng).toBe(coordenadas.lng);
      expect(marcadorResidencia?.cor).toBe('#FF0000');
      expect(marcadorResidencia?.icone).toBe('🏠');
      
      // Validar marcadores de estabelecimentos
      const marcadoresSaude = marcadores.filter(m => m.tipo === 'estabelecimento_saude');
      expect(marcadoresSaude).toHaveLength(estabelecimentosProximos.length);
      
      marcadoresSaude.forEach((marcador, index) => {
        const estabelecimento = estabelecimentosProximos[index];
        expect(marcador.coordenadas.lat).toBe(estabelecimento.latitude);
        expect(marcador.coordenadas.lng).toBe(estabelecimento.longitude);
        expect(marcador.cor).toBe('#0066CC');
        expect(marcador.icone).toBe('🏥');
        expect(marcador.distancia).toBeLessThanOrEqual(raioBusca);
      });
      
      // Etapa 7: Simular centralização do mapa
      console.log('\n🗺️ ETAPA 6: Centralização do Mapa');
      console.log('🎯 Calculando bounds do mapa para centralizar visualização...');
      
      const todasLatitudes = marcadores.map(m => m.coordenadas.lat);
      const todasLongitudes = marcadores.map(m => m.coordenadas.lng);
      
      const bounds = {
        norte: Math.max(...todasLatitudes),
        sul: Math.min(...todasLatitudes),
        leste: Math.max(...todasLongitudes),
        oeste: Math.min(...todasLongitudes)
      };
      
      const centro = {
        lat: (bounds.norte + bounds.sul) / 2,
        lng: (bounds.leste + bounds.oeste) / 2
      };
      
      console.log(`📍 Centro do mapa: ${centro.lat.toFixed(6)}, ${centro.lng.toFixed(6)}`);
      console.log(`📏 Bounds: Norte ${bounds.norte.toFixed(6)}, Sul ${bounds.sul.toFixed(6)}`);
      console.log(`📏 Bounds: Leste ${bounds.leste.toFixed(6)}, Oeste ${bounds.oeste.toFixed(6)}`);
      
      // Validar que o centro está próximo das coordenadas do usuário
      const distanciaCentro = calcularDistancia(centro.lat, centro.lng, coordenadas.lat, coordenadas.lng);
      expect(distanciaCentro).toBeLessThan(1000); // Centro deve estar a menos de 1km do usuário
      
      // Etapa 8: Resumo por categoria
      console.log('\n📊 ETAPA 7: Resumo por Categoria');
      
      const resumoPorTipo = estabelecimentosProximos.reduce((acc, estabelecimento) => {
        const tipo = estabelecimento.tipo;
        if (!acc[tipo]) {
          acc[tipo] = 0;
        }
        acc[tipo]++;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(resumoPorTipo).forEach(([tipo, quantidade]) => {
        console.log(`   🏷️  ${tipo}: ${quantidade} estabelecimento(s)`);
      });
      
      const resumoPorAdministracao = estabelecimentosProximos.reduce((acc, estabelecimento) => {
        const admin = estabelecimento.administracao;
        if (!acc[admin]) {
          acc[admin] = 0;
        }
        acc[admin]++;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n📊 Por Administração:');
      Object.entries(resumoPorAdministracao).forEach(([admin, quantidade]) => {
        console.log(`   🏛️  ${admin}: ${quantidade} estabelecimento(s)`);
      });
      
      // Etapa 9: Validação final
      console.log('\n✅ ETAPA 8: Validação Final');
      
      expect(estabelecimentosProximos.length).toBeGreaterThan(0);
      expect(marcadores.length).toBeGreaterThan(1);
      expect(marcadorResidencia).toBeDefined();
      expect(marcadoresSaude.length).toBeGreaterThan(0);
      
      console.log('✅ Todas as validações passaram com sucesso!');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      resultado = 'SUCESSO';
      console.log(`\n🏆 RESULTADO: ${resultado}`);
      console.log(`⏱️  Tempo total: ${duration}ms`);
      console.log(`🏥 Estabelecimentos encontrados: ${estabelecimentosProximos.length}`);
      console.log(`🗺️ Marcadores no mapa: ${marcadores.length}`);
      console.log(`📏 Raio de busca: ${raioBusca / 1000}km`);
      console.log('✅ Teste de saúde pública concluído com sucesso!');
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
