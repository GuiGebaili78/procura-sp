/**
 * Teste de Integração com Banco de Dados
 * 
 * Verifica a conexão e funcionamento do banco de dados
 * para todos os serviços que dependem dele
 * 
 * ⚠️ IMPORTANTE: Este teste usa conexão REAL com o banco!
 * Deve falhar se o Docker estiver offline.
 */

import { buscarEstabelecimentosBanco, obterEstatisticasBanco } from '../../lib/services/banco-saude.service';
import db from '../../lib/database';

// NÃO mockar o banco - queremos conexão real para testes de integração
// jest.mock('../../lib/database', () => ({
//   query: jest.fn(),
// }));

// const mockDb = db as jest.Mocked<typeof db>;

// Helper removido - agora usamos conexão real com o banco

describe('Teste de Integração com Banco de Dados', () => {
  // Timeout maior para conexão real
  jest.setTimeout(15000);

  describe('1. Teste de Conexão REAL com Banco', () => {
    it('deve conectar com o banco de dados real', async () => {
      // Teste REAL de conexão - deve falhar se Docker estiver offline
      const result = await db.query('SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true');
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].total).toBeDefined();
      expect(Number(result.rows[0].total)).toBeGreaterThan(0);
    });

    it('deve testar query básica de conexão', async () => {
      // Teste básico de conectividade
      const result = await db.query('SELECT 1 as test');
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test).toBe(1);
    });
  });

  describe('2. Teste REAL de Busca de Estabelecimentos de Saúde', () => {
    it('deve buscar estabelecimentos reais com filtros básicos', async () => {
      // Teste REAL usando dados do banco
      const filtros = {
        ubs: true,
        hospitais: true,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      // Busca REAL no banco - deve falhar se Docker estiver offline
      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar estrutura dos dados retornados
      if (result.length > 0) {
        const estabelecimento = result[0];
        expect(estabelecimento).toHaveProperty('id');
        expect(estabelecimento).toHaveProperty('nome');
        expect(estabelecimento).toHaveProperty('tipo');
        expect(estabelecimento).toHaveProperty('endereco');
        expect(estabelecimento).toHaveProperty('coordenadas');
        expect(estabelecimento.coordenadas).toHaveProperty('lat');
        expect(estabelecimento.coordenadas).toHaveProperty('lng');
      }
    });

    it('deve filtrar por tipo de estabelecimento', async () => {
      // Teste REAL de filtro por tipo

      const filtros = {
        ubs: true,
        hospitais: false, // Apenas UBS
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      // Teste REAL de filtro por tipo
      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar se todos os resultados são UBS
      result.forEach(estabelecimento => {
        expect(estabelecimento.tipo).toContain('UNIDADE BASICA DE SAUDE');
      });
    });

    it('deve filtrar por esfera administrativa', async () => {
      // Teste REAL de filtro por esfera

      const filtros = {
        ubs: true,
        hospitais: true,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true, // Apenas Municipal
        estadual: false,
        privado: false
      };

      // Teste REAL de filtro por esfera
      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar se todos os resultados são municipais ou estaduais
      result.forEach(estabelecimento => {
        expect(['Municipal', 'Estadual']).toContain(estabelecimento.esferaAdministrativa);
      });
    });
  });

  describe('3. Teste REAL de Estatísticas do Banco', () => {
    it('deve obter estatísticas reais do banco', async () => {
      // Teste REAL de estatísticas - deve falhar se Docker estiver offline
      const result = await obterEstatisticasBanco();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('porEsfera');
      expect(result).toHaveProperty('porRegiao');
      
      expect(typeof result.total).toBe('number');
      expect(result.total).toBeGreaterThan(0);
      
      expect(typeof result.porEsfera).toBe('object');
      expect(typeof result.porRegiao).toBe('object');
      
      // Verificar se há dados nas estatísticas
      const esferas = Object.keys(result.porEsfera);
      const regioes = Object.keys(result.porRegiao);
      
      expect(esferas.length).toBeGreaterThan(0);
      expect(regioes.length).toBeGreaterThan(0);
    });
  });

  describe('4. Teste REAL de Performance do Banco', () => {
    it('deve executar queries reais em tempo aceitável', async () => {
      const startTime = Date.now();
      
      const filtros = {
        ubs: true,
        hospitais: false,
        postos: false,
        farmacias: false,
        maternidades: false,
        urgencia: false,
        academias: false,
        caps: false,
        saudeBucal: false,
        doencasRaras: false,
        ama: false,
        programas: false,
        diagnostico: false,
        ambulatorio: false,
        supervisao: false,
        residencia: false,
        reabilitacao: false,
        apoio: false,
        clinica: false,
        dst: false,
        prontoSocorro: false,
        testagem: false,
        auditiva: false,
        horaCerta: false,
        idoso: false,
        laboratorio: false,
        trabalhador: false,
        apoioDiagnostico: false,
        apoioTerapeutico: false,
        instituto: false,
        apae: false,
        referencia: false,
        imagem: false,
        nutricao: false,
        reabilitacaoGeral: false,
        nefrologia: false,
        odontologica: false,
        saudeMental: false,
        referenciaGeral: false,
        medicinas: false,
        hemocentro: false,
        zoonoses: false,
        laboratorioZoo: false,
        casaParto: false,
        sexual: false,
        dstUad: false,
        capsInfantil: false,
        ambulatorios: false,
        programasGerais: false,
        tradicionais: false,
        dependente: false,
        municipal: true,
        estadual: true,
        privado: true
      };

      // Teste REAL de performance - deve falhar se Docker estiver offline
      const result = await buscarEstabelecimentosBanco(-23.5505, -46.6333, filtros);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verificar que retornou dados
      expect(Array.isArray(result)).toBe(true);
      
      // Deve executar em menos de 10 segundos (query real com dados reais)
      expect(executionTime).toBeLessThan(10000);
      
      console.log(`Query executada em ${executionTime}ms, retornou ${result.length} estabelecimentos`);
    });
  });
});
