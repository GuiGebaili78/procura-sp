import fs from 'fs';
import path from 'path';

describe('Viacep', () => {
  test('deve fazer requisição para ViaCEP e validar campos específicos usando CEP do arquivo JSON', async () => {
    const testName = 'ViaCEP';
    let resultado = 'FALHA';
    const coordenadasFilePath = path.join(__dirname, 'coordenadas-test.json');
    
    try {
      console.log('\n' + '='.repeat(80));
      console.log(`🧪 TESTE: ${testName}`);
      console.log('='.repeat(80));
      console.log('🎯 Objetivo: Validar campos ViaCEP usando CEP do arquivo JSON');
      
      // Ler coordenadas do arquivo JSON para obter o CEP
      console.log('\n📂 Carregando CEP do Arquivo JSON');
      console.log(`📁 Arquivo: ${coordenadasFilePath}`);
      
      expect(fs.existsSync(coordenadasFilePath)).toBe(true);
      const dadosCoordenadas = JSON.parse(fs.readFileSync(coordenadasFilePath, 'utf8'));
      expect(dadosCoordenadas.coordenadas).toBeDefined();
      expect(dadosCoordenadas.status).toBe('sucesso');
      
      const cep = dadosCoordenadas.coordenadas.cep;
      console.log(`📮 CEP carregado: ${cep}`);
      
      // TESTE REAL - Chamar API ViaCEP real
      console.log('🌐 Fazendo requisição REAL para API ViaCEP...');
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const httpStatus = response.status;
      
      console.log('📡 Status HTTP real:', httpStatus);
      
      if (!response.ok) {
        throw new Error(`API ViaCEP retornou erro: ${httpStatus}`);
      }
      
      const viacepData = await response.json();
      console.log('📊 Resposta real da API ViaCEP:', viacepData);
      
      // Verificar se o status é 200
      expect(httpStatus).toBe(200);
      
      // Validar se não há erro na resposta
      expect(viacepData.erro).toBeUndefined();
      
      // Validar campos obrigatórios
      expect(viacepData.cep).toBeDefined();
      expect(viacepData.logradouro).toBeDefined();
      expect(viacepData.bairro).toBeDefined();
      expect(viacepData.localidade).toBeDefined();
      expect(viacepData.uf).toBeDefined();
    
    console.log('✅ Teste ViaCEP: Todos os campos validados com sucesso!');
    
    resultado = 'SUCESSO';
    
    } catch (error) {
      resultado = 'FALHA';
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
  });
});