import fs from 'fs';
import path from 'path';

describe('Coleta de Lixo - API Ecourbis', () => {
  test('deve fazer requisição GET para API de coleta de lixo e validar resposta', async () => {
    const testName = 'Coleta de Lixo - API Ecourbis';
    let resultado = 'FALHA';
    const coordenadasFilePath = path.join(__dirname, 'coordenadas-test.json');
    
    try {
      console.log('\n' + '='.repeat(80));
      console.log(`🧪 TESTE: ${testName}`);
      console.log('='.repeat(80));
      console.log('🎯 Objetivo: Testar API de coleta de lixo usando coordenadas do arquivo JSON');
      
      const startTime = Date.now();
      
      // Etapa 1: Ler coordenadas do arquivo JSON
      console.log('\n📂 ETAPA 1: Carregando Coordenadas do Arquivo JSON');
      console.log(`📁 Arquivo: ${coordenadasFilePath}`);
      
      // Verificar se arquivo existe
      expect(fs.existsSync(coordenadasFilePath)).toBe(true);
      
      // Ler e validar arquivo JSON
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
      console.log(`⏰ Timestamp: ${dadosCoordenadas.timestamp}`);
      
      // Etapa 2: Construir URL da API Ecourbis
      console.log('\n🌐 ETAPA 2: Construindo URL da API Ecourbis');
      
      const ECOURBIS_BASE_URL = 'https://apicoleta.ecourbis.com.br/coleta';
      const dst = 100; // Distância de busca em metros
      const url = `${ECOURBIS_BASE_URL}?dst=${dst}&lat=${coordenadas.lat}&lng=${coordenadas.lng}`;
      
      console.log(`🔗 URL da API: ${url}`);
      console.log(`📏 Distância de busca: ${dst} metros`);
      
      // Etapa 3: Fazer requisição GET para a API
      console.log('\n📡 ETAPA 3: Fazendo Requisição GET');
      console.log('🔍 Enviando requisição para API Ecourbis...');
      
      // TESTE REAL - Chamar API Ecourbis real
      console.log('🌐 Fazendo requisição REAL para API Ecourbis...');
      
      // Configurar para ignorar certificados SSL problemáticos
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      // Usar axios que lida melhor com certificados SSL
      const axios = require('axios');
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });
      
      // Etapa 4: Validar status da resposta
      console.log('\n✅ ETAPA 4: Validação da Resposta');
      console.log(`📊 Status HTTP: ${response.status}`);
      console.log(`📋 Headers:`, response.headers);
      
      // Validar se a resposta tem status 200 OK
      expect(response.status).toBe(200);
      console.log('✅ Status 200 OK confirmado!');
      
      // Etapa 5: Processar e validar dados da resposta REAL
      console.log('\n📊 ETAPA 5: Processamento dos Dados REAIS');
      
      const data = response.data;
      console.log('📄 Resposta REAL da API Ecourbis:', JSON.stringify(data, null, 2));
      
      // Validar estrutura da resposta REAL da API Ecourbis
      expect(data).toBeDefined();
      expect(data.query).toBeDefined();
      expect(data.result).toBeDefined();
      expect(Array.isArray(data.result)).toBe(true);
      
      console.log(`📊 Total de itens retornados: ${data.result.length}`);
      console.log(`🔍 Query usada:`, data.query);
      
      if (data.result.length > 0) {
        console.log('\n🗑️ INFORMAÇÕES DE COLETA REAIS ENCONTRADAS:');
        
        data.result.forEach((item: any, index: number) => {
          console.log(`\n📍 COLETA ${index + 1}:`);
          console.log(`   🆔 ID: ${item.id || 'Não informado'}`);
          console.log(`   📍 Endereço: ${item.endereco?.logradouro || 'Não informado'}`);
          console.log(`   🏘️  Distrito: ${item.endereco?.distrito || 'Não informado'}`);
          console.log(`   📏 Distância: ${item.distancia || 'Não informada'} metros`);
          
          // Coleta Domiciliar
          if (item.domiciliar) {
            console.log(`   🗑️  Domiciliar: ${item.domiciliar.frequencia || 'Não informada'}`);
            console.log(`   ⏰ Horários Domiciliar:`, item.domiciliar.horarios);
          }
          
          // Coleta Seletiva
          if (item.seletiva && item.seletiva.possue) {
            console.log(`   ♻️  Seletiva: ${item.seletiva.frequencia || 'Não informada'}`);
            console.log(`   ⏰ Horários Seletiva:`, item.seletiva.horarios);
          }
        });
        
        console.log(`\n📊 RESUMO REAL:`);
        console.log(`   📍 Total de pontos encontrados: ${data.result.length}`);
        console.log(`   🗑️  Pontos com coleta domiciliar: ${data.result.filter((item: any) => item.domiciliar).length}`);
        console.log(`   ♻️  Pontos com coleta seletiva: ${data.result.filter((item: any) => item.seletiva?.possue).length}`);
        
      } else {
        console.log('⚠️  Nenhuma informação de coleta encontrada para esta localização');
      }
      
      // Etapa 6: Validação final
      console.log('\n🎯 ETAPA 6: Validação Final');
      
      // Validar que pelo menos a resposta foi recebida corretamente
      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      
      console.log('✅ Todas as validações passaram com sucesso!');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      resultado = 'SUCESSO';
      console.log(`\n🏆 RESULTADO: ${resultado}`);
      console.log(`⏱️  Tempo total: ${duration}ms`);
      console.log(`📡 Status da API: ${response.status} OK`);
      console.log(`📊 Dados recebidos: ${Array.isArray(data) ? data.length : 'N/A'} item(s)`);
      console.log('✅ Teste de coleta de lixo concluído com sucesso!');
      console.log('='.repeat(80));
      
    } catch (error) {
      resultado = 'FALHA';
      const endTime = Date.now();
      const startTime = endTime - 5000; // Estimativa
      const duration = endTime - startTime;
      
      console.log(`\n💥 ERRO DURANTE O TESTE:`);
      console.log(`⏱️  Tempo até falha: ${duration}ms`);
      console.log(`💬 Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Log adicional para erros de rede
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          console.log('🌐 Erro de rede detectado - verifique conectividade');
        }
        if (error.message.includes('404')) {
          console.log('🔍 Endpoint não encontrado - verifique URL da API');
        }
        if (error.message.includes('500')) {
          console.log('⚠️  Erro interno do servidor - API pode estar indisponível');
        }
      }
      
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
